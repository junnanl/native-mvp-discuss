#!/bin/bash
export PATH="/home/liujunnan/.nvm/versions/node/v22.23.2/bin:/usr/bin:/bin:$PATH"
cd /home/liujunnan/gs-ai/cx/extracted/CMI_AH_NEW || exit 1
fuser -k 5173/tcp 2>/dev/null || true
sleep 1
nohup node ./node_modules/vite/bin/vite.js --host 0.0.0.0 --port 5173 \
  > /home/liujunnan/gs-ai/cx/_dev_server.log 2>&1 &
echo "pid=$!"
sleep 2
hostname -I
curl -sI --connect-timeout 2 --max-time 3 http://127.0.0.1:5173/ | head -5
cat /home/liujunnan/gs-ai/cx/_dev_server.log
