#!/bin/sh
set -eu

mkdir -p /app/prisma/data
echo "Applying database migrations..."
./node_modules/.bin/prisma migrate deploy
echo "Seeding initial data..."
npm run db:seed
echo "Starting AI Navigation..."
exec node .next/standalone/server.js
