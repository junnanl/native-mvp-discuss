#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${ROOT_DIR}/app"
NODE_BIN="${ROOT_DIR}/runtime/node"
PNPM_CLI="${ROOT_DIR}/tools/pnpm/bin/pnpm.cjs"

export PATH="${ROOT_DIR}/runtime:${APP_DIR}/node_modules/.bin:${PATH}"
export COREPACK_ENABLE_NETWORK=0
export NEXT_TELEMETRY_DISABLED=1

cd "${APP_DIR}"
"${NODE_BIN}" "${PNPM_CLI}" run typecheck
"${NODE_BIN}" "${PNPM_CLI}" run build
echo "离线类型检查和生产构建已完成"
