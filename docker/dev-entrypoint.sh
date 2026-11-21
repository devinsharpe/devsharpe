#!/bin/sh
# Starts the app service in compose.yaml: installs dependencies whenever
# package-lock.json changes, prepares the media bucket, applies migrations,
# then runs the dev server.
set -eu

lock_hash=$(sha256sum package-lock.json | cut -d " " -f 1)
if [ "$(cat node_modules/.lock-hash 2>/dev/null || true)" != "$lock_hash" ]; then
  echo "Installing dependencies..."
  npm ci --no-audit --no-fund
  echo "$lock_hash" > node_modules/.lock-hash
fi

node docker/setup-bucket.mjs
npm run migrate
exec npm run dev -- --host 0.0.0.0
