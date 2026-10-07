# syntax=docker/dockerfile:1.7

# ---------------------------------------------------------------------------
# javascript.cm — production image
# ---------------------------------------------------------------------------
FROM node:24-bookworm-slim AS base
WORKDIR /app
ENV CI=true \
    npm_config_fund=false \
    npm_config_audit=false \
    npm_config_update_notifier=false

# All dependencies (build tooling included)
FROM base AS deps
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# Production dependencies only
FROM base AS production-deps
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

# Compile TypeScript + Vite client and SSR bundles into ./build
FROM deps AS build
COPY . .
RUN node ace build

# Runtime
FROM base AS runtime
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3333 \
    LOG_LEVEL=info
COPY --from=production-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/build ./
COPY --chown=node:node docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh && mkdir -p tmp && chown node:node tmp
USER node
EXPOSE 3333
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3333/up').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["node", "bin/server.js"]
