#!/bin/bash
set -uo pipefail
. /home/liujunnan/.nvm/nvm.sh
nvm use 22 >/dev/null
# Prefer Linux bins; strip Windows /mnt/c entries that break npm script shims
NEWPATH=""
IFS=':'
for p in $PATH; do
  case "$p" in
    /mnt/c/*) ;;
    *) NEWPATH="${NEWPATH:+$NEWPATH:}$p" ;;
  esac
done
unset IFS
export PATH="$NEWPATH"
echo "node=$(command -v node) $(node -v)"
cd /home/liujunnan/gs-ai/cx/extracted/CMI_AH_NEW
/usr/bin/pkill -f 'vite.js' 2>/dev/null || true
/usr/bin/sleep 1
: > /home/liujunnan/gs-ai/cx/_dev_server.log
nohup node ./node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173 \
  >> /home/liujunnan/gs-ai/cx/_dev_server.log 2>&1 &
echo "started:$!"
/usr/bin/sleep 4
/usr/bin/cat /home/liujunnan/gs-ai/cx/_dev_server.log
/usr/bin/curl -s -o /dev/null -w '%{http_code}\n' --max-time 5 http://127.0.0.1:5173/
