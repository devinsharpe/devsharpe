// Creates the media bucket if it's missing and lets the site's pages upload to
// it (CORS, from S3_CORS_ORIGINS). Run by dev-entrypoint.sh, and by start.mjs in
// production when S3_CORS_ORIGINS is set; safe to run repeatedly.
import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketCorsCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const env = process.env;
const bucket = env.S3_BUCKET;
const origins = (env.S3_CORS_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const client = new S3Client({
  region: env.S3_REGION || "us-east-1",
  endpoint: env.S3_ENDPOINT,
  forcePathStyle: env.S3_FORCE_PATH_STYLE === "true",
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID ?? "",
    secretAccessKey: env.S3_SECRET_ACCESS_KEY ?? "",
  },
});

try {
  await client.send(new HeadBucketCommand({ Bucket: bucket }));
} catch (error) {
  if (error?.$metadata?.httpStatusCode !== 404) throw error;
  await client.send(new CreateBucketCommand({ Bucket: bucket }));
  console.log(`Created bucket ${bucket}.`);
}

if (origins.length > 0) {
  await client.send(
    new PutBucketCorsCommand({
      Bucket: bucket,
      CORSConfiguration: {
        CORSRules: [
          {
            // Matches the media uploader: one PUT per file, Content-Type set.
            AllowedOrigins: origins,
            AllowedMethods: ["PUT"],
            AllowedHeaders: ["content-type"],
            MaxAgeSeconds: 3600,
          },
        ],
      },
    }),
  );
  console.log(`Bucket ${bucket} accepts uploads from ${origins.join(", ")}.`);
}

// Closes its connections, so they don't hold the process open (in production
// the server keeps running in this same process).
client.destroy();
