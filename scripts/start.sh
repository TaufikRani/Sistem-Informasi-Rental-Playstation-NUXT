#!/bin/sh
set -e

node /app/scripts/wait-db.mjs
node /app/scripts/migrate.mjs
node /app/scripts/seed-if-empty.mjs

exec node /app/.output/server/index.mjs
