#!/usr/bin/env bash
set -euo pipefail

MVP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_DIR="$(cd "${MVP_DIR}/.." && pwd)"
DELIVERY_DIR="${PROJECT_DIR}/delivery"
PACKAGE_NAME="digital-employee-mvp-0.4-linux-x64-full"
PACKAGE_DIR="${DELIVERY_DIR}/${PACKAGE_NAME}"
ARCHIVE_PATH="${DELIVERY_DIR}/${PACKAGE_NAME}.tar.gz"
NODE_HOME="$(dirname "$(dirname "$(readlink -f "$(command -v node)")")")"
PNPM_CACHE="${HOME}/.cache/node/corepack/v1/pnpm/10.28.2"

if [[ "$(uname -s)" != "Linux" || "$(uname -m)" != "x86_64" ]]; then
  echo "当前打包脚本只支持 Linux x86_64"
  exit 1
fi

if [[ ! -d "${MVP_DIR}/node_modules/.pnpm" ]]; then
  echo "缺少完整 node_modules，请先在有依赖的开发机执行安装"
  exit 1
fi

if [[ ! -f "${PNPM_CACHE}/bin/pnpm.cjs" ]]; then
  echo "缺少 pnpm 10.28.2 离线 CLI：${PNPM_CACHE}"
  exit 1
fi

cd "${MVP_DIR}"
export NEXT_TELEMETRY_DISABLED=1
"${NODE_HOME}/bin/node" "${PNPM_CACHE}/bin/pnpm.cjs" run typecheck
NEXT_DIST_DIR=.next-package "${NODE_HOME}/bin/node" "${PNPM_CACHE}/bin/pnpm.cjs" run build
"${NODE_HOME}/bin/node" "${PNPM_CACHE}/bin/pnpm.cjs" licenses list --prod --json >"${MVP_DIR}/deploy/THIRD_PARTY_LICENSES.json"

mkdir -p "${DELIVERY_DIR}"
rm -f "${ARCHIVE_PATH}" "${ARCHIVE_PATH}.sha256"
if [[ -d "${PACKAGE_DIR}" ]]; then
  find "${PACKAGE_DIR}" -mindepth 1 -delete
else
  mkdir -p "${PACKAGE_DIR}"
fi

mkdir -p "${PACKAGE_DIR}/app" "${PACKAGE_DIR}/runtime" "${PACKAGE_DIR}/tools"
cp -a "${MVP_DIR}/." "${PACKAGE_DIR}/app/"
find "${PACKAGE_DIR}/app/.next" -mindepth 1 -delete
cp -a "${MVP_DIR}/.next-package/." "${PACKAGE_DIR}/app/.next/"
if [[ -d "${PACKAGE_DIR}/app/.next-package" ]]; then
  find "${PACKAGE_DIR}/app/.next-package" -depth -delete
fi
cp -a "${NODE_HOME}/bin/node" "${PACKAGE_DIR}/runtime/node"
cp -a "${NODE_HOME}/LICENSE" "${PACKAGE_DIR}/runtime/NODE-LICENSE"
cp -a "${PNPM_CACHE}" "${PACKAGE_DIR}/tools/pnpm"
cp -a "${MVP_DIR}/deploy/start.sh" "${PACKAGE_DIR}/start.sh"
cp -a "${MVP_DIR}/deploy/stop.sh" "${PACKAGE_DIR}/stop.sh"
cp -a "${MVP_DIR}/deploy/status.sh" "${PACKAGE_DIR}/status.sh"
cp -a "${MVP_DIR}/deploy/rebuild.sh" "${PACKAGE_DIR}/rebuild.sh"
cp -a "${MVP_DIR}/deploy/verify.sh" "${PACKAGE_DIR}/verify.sh"
cp -a "${MVP_DIR}/deploy/config.env.example" "${PACKAGE_DIR}/config.env"
cp -a "${MVP_DIR}/deploy/README-部署.md" "${PACKAGE_DIR}/README-部署.md"
cp -a "${MVP_DIR}/deploy/THIRD_PARTY_LICENSES.json" "${PACKAGE_DIR}/THIRD_PARTY_LICENSES.json"
cp -a "${PROJECT_DIR}/docs" "${PACKAGE_DIR}/docs"

chmod +x "${PACKAGE_DIR}/runtime/node" "${PACKAGE_DIR}/start.sh" "${PACKAGE_DIR}/stop.sh" "${PACKAGE_DIR}/status.sh" "${PACKAGE_DIR}/rebuild.sh" "${PACKAGE_DIR}/verify.sh"

SOURCE_MODULES_BYTES="$(du -sb "${MVP_DIR}/node_modules" | cut -f1)"
PACKAGE_MODULES_BYTES="$(du -sb "${PACKAGE_DIR}/app/node_modules" | cut -f1)"
if [[ "${SOURCE_MODULES_BYTES}" != "${PACKAGE_MODULES_BYTES}" ]]; then
  echo "node_modules 复制不完整：源=${SOURCE_MODULES_BYTES}，包=${PACKAGE_MODULES_BYTES}"
  exit 1
fi

{
  echo "package=${PACKAGE_NAME}"
  echo "built_at=$(date --iso-8601=seconds)"
  echo "platform=linux-x64"
  echo "node=$(${PACKAGE_DIR}/runtime/node --version)"
  echo "pnpm=$(${PACKAGE_DIR}/runtime/node ${PACKAGE_DIR}/tools/pnpm/bin/pnpm.cjs --version)"
  echo "next=$(cd "${PACKAGE_DIR}/app" && "${PACKAGE_DIR}/runtime/node" -p "require('./node_modules/next/package.json').version")"
  echo "node_modules_bytes=${PACKAGE_MODULES_BYTES}"
} >"${PACKAGE_DIR}/BUILD-INFO.txt"

"${PACKAGE_DIR}/verify.sh"
tar -C "${DELIVERY_DIR}" -czf "${ARCHIVE_PATH}" "${PACKAGE_NAME}"
sha256sum "${ARCHIVE_PATH}" >"${ARCHIVE_PATH}.sha256"

echo "交付目录：${PACKAGE_DIR}"
echo "交付压缩包：${ARCHIVE_PATH}"
echo "校验文件：${ARCHIVE_PATH}.sha256"
