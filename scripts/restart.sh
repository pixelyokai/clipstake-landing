#!/usr/bin/env bash
# Stops whatever serves :3100, rebuilds, and starts the production server detached.
set -euo pipefail
cd "$(dirname "$0")/.."
powershell.exe -NoProfile -Command "\$p = (Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue).OwningProcess | Select-Object -Unique; foreach (\$id in \$p) { Stop-Process -Id \$id -Force }" || true
npm run build 2>&1 | grep -E "Compiled|rror" || true
nohup node node_modules/next/dist/bin/next start -p 3100 >/dev/null 2>&1 &
for _ in $(seq 1 30); do curl -s -o /dev/null http://localhost:3100 && break; sleep 1; done
echo "serving on :3100"
