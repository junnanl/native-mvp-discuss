#!/bin/bash
set -uo pipefail
LOG=/home/liujunnan/gs-ai/cx/_agent_out.txt
{
  echo '=== FIXDEV START ==='
  date -Iseconds
  export NVM_DIR="$HOME/.nvm"
  if [ ! -s "$NVM_DIR/nvm.sh" ]; then
    curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  fi
  . "$NVM_DIR/nvm.sh"
  nvm install 22
  echo "node=$(node -v) npm=$(npm -v)"
  cd /home/liujunnan/gs-ai/cx/extracted/CMI_AH_NEW
  rm -rf node_modules
  npm ci || npm install
  echo "install_exit=$?"
  pkill -f 'vite --host' 2>/dev/null || true
  nohup npm run dev -- --host 0.0.0.0 --port 5173 > /home/liujunnan/gs-ai/cx/_dev_server.log 2>&1 &
  echo "dev_pid=$!"
  sleep 5
  echo '=== DEV LOG ==='
  cat /home/liujunnan/gs-ai/cx/_dev_server.log
  echo '=== CURL ==='
  curl -sI http://127.0.0.1:5173/ | head -15 || true
  echo '=== FXXDEV END ==='
} >> "$LOG" 2>&1
