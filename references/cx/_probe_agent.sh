#!/bin/bash
set -euo pipefail
cd /home/liujunnan/gs-ai/cx
{
  echo "=== LS ==="
  ls -lah
  echo "=== UNZIP LIST ==="
  unzip -l CMI_AH_NEW*.zip | head -100
  echo "=== EXTRACT ==="
  mkdir -p extracted
  if [ ! -f extracted/.extracted_ok ]; then
    unzip -o CMI_AH_NEW*.zip -d extracted
    touch extracted/.extracted_ok
  else
    echo "Already extracted"
  fi
  echo "=== FIND MARKERS ==="
  find extracted -maxdepth 4 \( -name package.json -o -name index.html -o -name vite.config.* -o -name webpack.config.* -o -name README\* -o -name .nvmrc -o -name .node-version \) 2>/dev/null | head -50
  echo "=== TOP LEVEL EXTRACTED ==="
  ls -lah extracted
  echo "DONE"
} > /home/liujunnan/gs-ai/cx/_agent_out.txt 2>&1
