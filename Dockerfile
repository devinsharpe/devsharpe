# Production image. .gitea/workflows/build-image.yml builds it on each push and
# pushes it to the registry, for Dokploy to deploy (see Deploying in the
# README). To try it locally:
#
#   docker build -t devsharpe .
#   docker run --rm -p 3000:3000 --env-file .env.production devsharpe
#
# (Addresses in the env file must be reachable from inside the container;
# `localhost` there is the container itself. .env.* files are git- and
# docker-ignored.)
#
# The runtime image is Node's slim Debian image, so the container has bash and
# npm for debugging (e.g. in Dokploy's terminal). It holds the built server,
# the start-up scripts and the seed (all self-contained, so no node_modules),
# and the migrations' SQL. On start it applies pending migrations, then starts
# the server (see docker/start.mjs). In the container, `npm run seed` loads the
# site's content.
#
# Each layer must stay under Cloudflare's 100 MB upload limit (see
# .gitea/workflows/build-image.yml): the largest is the base image's Node and
# npm, at about 56 MB compressed.

# The build runs on the builder's own platform even when the image is for
# another one: its output is plain JavaScript, so it's the same for every
# platform, and the runtime stage below only copies files (no emulation).
FROM --platform=$BUILDPLATFORM node:26-trixie-slim AS build
WORKDIR /app

# Dependencies first, so this layer is reused until the lockfile changes.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

# The same base as the build stage, for the image's own platform. This stage
# only copies files (no RUN), so building it for another platform needs no
# emulation either.
FROM node:26-trixie-slim
WORKDIR /app

# NPM_CONFIG_UPDATE_NOTIFIER: `npm run` in the container doesn't check the
# registry for a newer npm.
ENV NODE_ENV=production \
  PORT=3000 \
  NPM_CONFIG_UPDATE_NOTIFIER=false

COPY --from=build /app/.output ./.output
COPY --from=build /app/drizzle ./drizzle
COPY docker/start.mjs ./docker/start.mjs
# Not the repository's package.json: its scripts need the full install.
COPY docker/runtime.package.json ./package.json

# The base image's non-root user (uid 1000). The files above stay owned by
# root, so the server can't change them.
USER node

EXPOSE 3000

# A plain liveness check. The start period covers the migrations that run
# before the server listens. The image has no curl, so Node makes the request.
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD ["node", "-e", "fetch(`http://127.0.0.1:${process.env.PORT}/api/health`).then((response) => process.exit(response.ok ? 0 : 1), () => process.exit(1))"]

# The base image's entrypoint execs this, so node is PID 1 and handles stop
# signals through the server's own graceful shutdown.
CMD ["node", "docker/start.mjs"]
