#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="${ROOT_DIR}/run/digital-employee.pid"

if [[ ! -f "${PID_FILE}" ]]; then
  echo "数字员工平台未运行"
  exit 0
fi

PID="$(cat "${PID_FILE}")"
if kill -0 "${PID}" 2>/dev/null; then
  kill "${PID}"
  for _ in {1..20}; do
    if ! kill -0 "${PID}" 2>/dev/null; then
      break
    fi
    sleep 0.5
  done
fi

rm -f "${PID_FILE}"
echo "数字员工平台已停止"
