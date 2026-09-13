#!/bin/bash
set -euo pipefail
export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

echo "node=$(node -v 2>/dev/null || echo missing)"
cd /home/liujunnan/gs-ai/cx/extracted/CMI_AH_NEW

if curl -sf --connect-timeout 2 --max-time 3 -o /dev/null http://127.0.0.1:5173/; then
  echo "ALREADY_RUNNING"
  curl -sI --connect-timeout 2 --max-time 3 http://127.0.0.1:5173/ | head -5
  exit 0
fi

echo "NOT_RUNNING — starting vite"
if [ ! -f node_modules/vite/bin/vite.js ]; then
  echo "installing deps..."
  npm ci
fi

# kill stale listeners on 5173 if any
fuser -k 5173/tcp 2>/dev/null || true

nohup node ./node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173 \
  > /home/liujunnan/gs-ai/cx/_dev_server.log 2>&1 &
echo "started_pid=$!"

for i in 1 2 3 4 5 6 7 8 9 10; do
  sleep 1
  if curl -sf --connect-timeout 1 --max-time 2 -o /dev/null http://127.0.0.1:5173/; then
    echo "READY"
    curl -sI --connect-timeout 1 --max-time 2 http://127.0.0.1:5173/ | head -5
    cat /home/liujunnan/gs-ai/cx/_dev_server.log
    exit 0
  fi
done

echo "FAILED_TO_START"
cat /home/liujunnan/gs-ai/cx/_dev_server.log
exit 1
