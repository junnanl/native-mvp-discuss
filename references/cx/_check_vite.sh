#!/bin/bash
set -e
curl -sI http://127.0.0.1:5173/ | head -5
echo "----"
pgrep -af 'vite' | head -5 || echo "no vite process"
echo "----"
if ! curl -sf -o /dev/null http://127.0.0.1:5173/; then
  echo "NOT_RUNNING"
  export NVM_DIR="$HOME/.nvm"
  # shellcheck disable=SC1091
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
  cd /home/liujunnan/gs-ai/cx/extracted/CMI_AH_NEW
  nohup node ./node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173 \
    > /home/liujunnan/gs-ai/cx/_dev_server.log 2>&1 &
  echo "started_pid=$!"
  sleep 2
  curl -sI http://127.0.0.1:5173/ | head -5
else
  echo "ALREADY_RUNNING"
fi
