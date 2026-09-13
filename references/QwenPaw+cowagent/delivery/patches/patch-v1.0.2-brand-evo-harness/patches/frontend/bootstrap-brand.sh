#!/bin/sh
set -eu

PATCH_ROOT="/opt/cowagent/patch-mounted/frontend"
APP_ROOT="${CHATGPT_ON_WECHAT_PREFIX:-/app}"

if [ -d "${PATCH_ROOT}/channel" ]; then
  cp -a "${PATCH_ROOT}/channel/." "${APP_ROOT}/channel/"
fi

printf '%s\n' "Evo-Harness brand patch applied"
