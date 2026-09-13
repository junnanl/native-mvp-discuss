#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${ROOT_DIR}/app"
NODE_BIN="${ROOT_DIR}/runtime/node"
PNPM_CLI="${ROOT_DIR}/tools/pnpm/bin/pnpm.cjs"

test -x "${NODE_BIN}"
test -f "${PNPM_CLI}"
test -d "${APP_DIR}/node_modules/.pnpm"
test -f "${APP_DIR}/.next/BUILD_ID"
test -f "${APP_DIR}/data/employees.json"
test -d "${APP_DIR}/public/avatars"

"${NODE_BIN}" --version
"${NODE_BIN}" "${PNPM_CLI}" --version
echo "交付包结构检查通过"
