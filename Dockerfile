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
# The runtime image is distroless: Node and the libraries it needs, with no
# shell or package manager. It holds the built server and the start-up scripts
# (all self-contained, so no node_modules) and the migrations' SQL. On start it
# applies pending migrations, then starts the server (see docker/start.mjs).
#
# The build stage doubles as a tools image with the full install, for one-off
# commands such as seeding:
#
#   docker build --target build -t devsharpe-tools .
#   docker run --rm -e DATABASE_URL=... devsharpe-tools npm run seed

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

# Runs as the image's non-root user (65532). Its entrypoint is node itself,
# which is PID 1 and handles stop signals through the server's own graceful
# shutdown.
FROM gcr.io/distroless/nodejs26-debian13:nonroot
WORKDIR /app

ENV NODE_ENV=production \
  PORT=3000

COPY --from=build /app/.output ./.output
COPY --from=build /app/drizzle ./drizzle
COPY docker/start.mjs ./docker/start.mjs

EXPOSE 3000

# A plain liveness check. The start period covers the migrations that run
# before the server listens.
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD ["/nodejs/bin/node", "-e", "fetch(`http://127.0.0.1:${process.env.PORT}/api/health`).then((response) => process.exit(response.ok ? 0 : 1), () => process.exit(1))"]

CMD ["docker/start.mjs"]
