# ===== Tahap build =====
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# ===== Tahap produksi =====
FROM base AS prod
ENV NODE_ENV=production

# Dependency runtime untuk script migrasi & seed (drizzle-orm, mysql2)
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

COPY --from=build /app/.output ./.output
COPY --from=build /app/server/db/migrations ./server/db/migrations
COPY --from=build /app/scripts ./scripts

EXPOSE 3000
CMD ["sh", "/app/scripts/start.sh"]
