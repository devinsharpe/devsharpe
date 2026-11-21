// Server-only (the `.server.ts` suffix makes the build reject client imports).
//
// Env is read on every call, never at module scope, so a module-level read can
// never be inlined into a client bundle or evaluated before the process env is set.

// Loads .env (if there is one) into process.env, without overriding what's
// already set. The database module does the same; this makes sure it has
// happened however this module is reached first.
import "dotenv/config";

export function getServerEnv() {
  return {
    siteTitle: process.env.SITE_TITLE ?? 'Devin Sharpe',
    siteSubtitle: process.env.SITE_SUBTITLE ?? "",
    // Public origin for absolute links (e.g. the RSS feed). Optional: falls
    // back to BETTER_AUTH_URL, then to the request's own origin.
    siteUrl: process.env.SITE_URL || process.env.BETTER_AUTH_URL || '',
    // Where uploaded media is stored. Any S3-compatible service works; set
    // S3_ENDPOINT for one that isn't AWS (R2, MinIO, B2, ...). Without
    // S3_ACCESS_KEY_ID, the AWS SDK's usual credential chain is used (AWS_*
    // env vars, a shared profile, or an instance/task role).
    s3: {
      bucket: process.env.S3_BUCKET ?? '',
      region: process.env.S3_REGION || 'us-east-1',
      endpoint: process.env.S3_ENDPOINT || undefined,
      // Where browsers reach the bucket, when that differs from S3_ENDPOINT
      // (e.g. in Docker: the server uses http://rustfs:9000, the browser
      // http://localhost:9000). Upload URLs are signed for this host.
      publicEndpoint: process.env.S3_PUBLIC_ENDPOINT || undefined,
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
      accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
    },
    // Renders media. KEY and SALT are imgproxy's IMGPROXY_KEY/IMGPROXY_SALT
    // (hex); leave both unset only for an imgproxy that accepts unsigned URLs.
    imgproxy: {
      url: process.env.IMGPROXY_URL ?? '',
      key: process.env.IMGPROXY_KEY ?? '',
      salt: process.env.IMGPROXY_SALT ?? '',
      // How imgproxy reaches the bucket. Defaults to s3://{S3_BUCKET}/, which
      // needs IMGPROXY_USE_S3=true on the imgproxy side.
      sourcePrefix: process.env.IMGPROXY_SOURCE_PREFIX ?? '',
    },
    // Cloudflare Turnstile, in front of the contact form. The site key is
    // public: the server hands it to the contact page at request time (it's
    // never built into the client bundle, despite the VITE_ prefix), so both
    // keys are set wherever the server runs.
    turnstile: {
      siteKey: process.env.VITE_CLOUDFLARE_SITEKEY ?? '',
      secretKey: process.env.CLOUDFLARE_SECRET_KEY ?? '',
    },
  }
}
