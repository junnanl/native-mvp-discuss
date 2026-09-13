#!/bin/bash
set -uo pipefail
cd /home/liujunnan/gs-ai/cx
OUT=/home/liujunnan/gs-ai/cx/_agent_out.txt
SUM=/home/liujunnan/gs-ai/cx/_agent_summary.txt
exec > >(tee "$OUT") 2>&1

echo "=== $(date -Iseconds) AGENT RUN START ==="
echo "=== TASK1: unzip -l ==="
unzip -l CMI_AH_NEW*.zip | head -100

echo
echo "=== TASK2: extract ==="
mkdir -p extracted
if [ -f extracted/CMI_AH_NEW/package.json ]; then
  echo "Already extracted (package.json present)"
else
  unzip -o "CMI_AH_NEW(4)(1).zip" -d extracted
  echo "unzip exit: $?"
fi

PROJ=/home/liujunnan/gs-ai/cx/extracted/CMI_AH_NEW
echo
echo "=== Top-level folders ==="
ls -la "$PROJ" || ls -la extracted/

echo
echo "=== package.json ==="
cat "$PROJ/package.json" 2>&1 || true

echo
echo "=== README.md ==="
cat "$PROJ/README.md" 2>&1 || true

echo
echo "=== Node tooling ==="
command -v node; node -v 2>&1 || true
command -v npm; npm -v 2>&1 || true
command -v yarn; yarn -v 2>&1 || true
command -v pnpm; pnpm -v 2>&1 || true

echo
echo "=== engines / nvmrc ==="
[ -f "$PROJ/.nvmrc" ] && cat "$PROJ/.nvmrc" || echo "no .nvmrc"
[ -f "$PROJ/.node-version" ] && cat "$PROJ/.node-version" || echo "no .node-version"

echo
echo "=== TASK5: install ==="
cd "$PROJ"
# Prefer fresh install; zip may include node_modules but often broken across platforms
if [ -f package-lock.json ]; then
  npm ci 2>&1 || npm install 2>&1
else
  npm install 2>&1
fi
INSTALL_EXIT=$?
echo "install exit: $INSTALL_EXIT"

echo
echo "=== Start dev server ==="
# Kill any prior vite on common ports
(fuser -k 5173/tcp 2>/dev/null || true)
(fuser -k 5174/tcp 2>/dev/null || true)

nohup npm run dev -- --host 0.0.0.0 --port 5173 > /home/liujunnan/gs-ai/cx/_dev_server.log 2>&1 &
DEV_PID=$!
echo "dev pid: $DEV_PID"
sleep 5
echo "=== _dev_server.log ==="
cat /home/liujunnan/gs-ai/cx/_dev_server.log 2>&1 || true
echo "=== curl localhost:5173 ==="
curl -sI http://127.0.0.1:5173/ 2>&1 | head -20 || true

# Build summary
{
  echo "CMI_AH_NEW project summary"
  echo "Generated: $(date -Iseconds)"
  echo
  echo "Project type: Frontend (Vite + likely React/TS based on vite.config.ts, package.json, src/)"
  echo "Source zip: CMI_AH_NEW(4)(1).zip"
  echo "Extracted to: /home/liujunnan/gs-ai/cx/extracted/CMI_AH_NEW"
  echo
  echo "Top-level entries:"
  ls -1 "$PROJ" 2>/dev/null | sed 's/^/  - /'
  echo
  echo "Scripts (from package.json):"
  python3 - <<'PY' 2>/dev/null || node -e 'const p=require("./package.json"); console.log(JSON.stringify(p.scripts,null,2))' 2>/dev/null || grep -A20 '"scripts"' package.json
import json
p=json.load(open("package.json"))
for k,v in (p.get("scripts") or {}).items():
    print(f"  {k}: {v}")
print("\nKey dependencies:")
for section in ("dependencies","devDependencies"):
    print(f"  [{section}]")
    for k,v in sorted((p.get(section) or {}).items()):
        print(f"    {k}: {v}")
print("\nengines:", p.get("engines"))
print("packageManager:", p.get("packageManager"))
PY
  echo
  echo "Node version: $(node -v 2>/dev/null || echo unknown)"
  echo "npm version: $(npm -v 2>/dev/null || echo unknown)"
  echo "Install exit: $INSTALL_EXIT"
  echo "Dev PID: $DEV_PID"
  if curl -sf -o /dev/null http://127.0.0.1:5173/; then
    echo "Dev server URL: http://127.0.0.1:5173/"
  else
    echo "Dev server URL: NOT CONFIRMED (see _dev_server.log)"
    echo "Dev log tail:"
    tail -30 /home/liujunnan/gs-ai/cx/_dev_server.log 2>/dev/null || true
  fi
  echo
  echo "Errors / fixes:"
  echo "  - Parent Shell tool often fails with powershell.exe ENOENT; used wsl bash when available."
  echo "  - Zip includes node_modules and __MACOSX; prefer npm ci/npm install for Linux."
} > "$SUM"

echo
echo "=== SUMMARY WRITTEN ==="
cat "$SUM"
echo "=== $(date -Iseconds) AGENT RUN END ==="
