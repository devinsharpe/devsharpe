// Starts the production container (see the Dockerfile). The runtime image has
// no shell, so this runs in the one Node process: it applies pending
// migrations, optionally prepares the bucket, then starts the server. A step
// that fails rejects here, which exits with an error before the server ever
// listens, so it never runs against an old schema.

// Resolves once the migrations have finished (or rejects if they fail).
await import("../.output/tools/migrate.mjs");

// Optional: with S3_CORS_ORIGINS set (e.g. https://devsharpe.io), creates the
// bucket if it's missing and replaces its CORS rules with one that lets those
// origins upload. Leave it unset to manage the bucket yourself.
if (process.env.S3_CORS_ORIGINS) {
  await import("../.output/tools/setup-bucket.mjs");
}

await import("../.output/server/index.mjs");
