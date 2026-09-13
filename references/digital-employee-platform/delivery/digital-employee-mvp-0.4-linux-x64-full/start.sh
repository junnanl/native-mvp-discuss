#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${ROOT_DIR}/app"
NODE_BIN="${ROOT_DIR}/runtime/node"
CONFIG_FILE="${ROOT_DIR}/config.env"
RUN_DIR="${ROOT_DIR}/run"
LOG_DIR="${ROOT_DIR}/logs"
PID_FILE="${RUN_DIR}/digital-employee.pid"

if [[ -f "${CONFIG_FILE}" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "${CONFIG_FILE}"
  set +a
fi

export HOSTNAME="${HOSTNAME:-0.0.0.0}"
export PORT="${PORT:-3010}"
export COWAGENT_BASE_URL="${COWAGENT_BASE_URL:-http://127.0.0.1:19989}"
export COWAGENT_WEB_PASSWORD="${COWAGENT_WEB_PASSWORD:-}"
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1

mkdir -p "${RUN_DIR}" "${LOG_DIR}"

if [[ -f "${PID_FILE}" ]]; then
  EXISTING_PID="$(cat "${PID_FILE}")"
  if kill -0 "${EXISTING_PID}" 2>/dev/null; then
    echo "数字员工平台已运行，PID=${EXISTING_PID}"
    exit 0
  fi
  rm -f "${PID_FILE}"
fi

cd "${APP_DIR}"
nohup "${NODE_BIN}" "node_modules/next/dist/bin/next" start --hostname "${HOSTNAME}" --port "${PORT}" >>"${LOG_DIR}/application.log" 2>&1 &
PID=$!
echo "${PID}" >"${PID_FILE}"

for _ in {1..30}; do
  if ! kill -0 "${PID}" 2>/dev/null; then
    echo "启动失败，请查看 ${LOG_DIR}/application.log"
    exit 1
  fi
  if "${NODE_BIN}" -e "fetch('http://127.0.0.1:${PORT}/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"; then
    echo "数字员工平台已启动：http://${HOSTNAME}:${PORT}（PID=${PID}）"
    exit 0
  fi
  sleep 1
done

echo "服务进程已启动，但 30 秒内未通过 HTTP 检查，请查看 ${LOG_DIR}/application.log"
exit 1
