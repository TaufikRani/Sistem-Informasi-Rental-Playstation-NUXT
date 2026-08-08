#!/bin/sh
set -e

node /app/scripts/wait-db.mjs

# Only run migrate + seed when DB is fresh (no users table data)
node /app/scripts/seed-if-empty.mjs

exec node /app/.output/server/index.mjs
