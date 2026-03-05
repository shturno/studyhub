#!/bin/bash
set -e

echo "🧹 Lint & Type Check..."
pnpm lint
pnpm tsc --noEmit

echo "✅ Unit Tests..."
pnpm test:unit

echo "🗄️ Starting DB..."
docker compose -f docker-compose.dev.yml up -d
sleep 5

echo "✅ Integration Tests..."
pnpm test:integration

echo "🛑 Stopping DB..."
docker compose -f docker-compose.dev.yml down

echo "🔨 Building..."
pnpm build

echo "✨ All tests passed! Ready to push."
