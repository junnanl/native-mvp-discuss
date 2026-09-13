#!/bin/sh
set -eu

PATCH_ROOT="/opt/cowagent/patch-mounted"
APP_ROOT="${CHATGPT_ON_WECHAT_PREFIX:-/app}"

if [ -d "${PATCH_ROOT}/frontend/channel" ]; then
  cp -a "${PATCH_ROOT}/frontend/channel/." "${APP_ROOT}/channel/"
fi

if [ -d "${PATCH_ROOT}/plugins" ]; then
  cp -a "${PATCH_ROOT}/plugins/." "${APP_ROOT}/plugins/"
fi

printf '%s\n' "Evo-Harness brand patch applied"
