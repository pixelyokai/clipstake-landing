#!/usr/bin/env bash
# Builds, serves the production build on :3100, runs Lighthouse mobile, then stops the server.
# Usage: bash scripts/measure.sh [runs]
set -euo pipefail
cd "$(dirname "$0")/.."

npm run build >/dev/null
node node_modules/next/dist/bin/next start -p 3100 >/dev/null 2>&1 &
server=$!
trap 'kill $server 2>/dev/null || true' EXIT

for _ in $(seq 1 30); do curl -s -o /dev/null http://localhost:3100 && break; sleep 1; done
node scripts/lighthouse.mjs http://localhost:3100 "${1:-3}"
