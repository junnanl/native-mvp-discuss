#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

main() {
  require_docker
  require_target
  verify_hotfix_checksums
  verify_compatibility

  [ -f "${TARGET_ROOT}/compose/docker-compose.override.yml" ] \
    || die "现场缺少 docker-compose.override.yml"

  if [ "${SKIP_STATE_CHECK:-0}" != "1" ]; then
    [ "$(read_state_value status || true)" = "applied" ] \
      || die "未找到已应用的止血包状态"
  fi

  local config
  local container
  config="$(compose_config)"
  printf '%s\n' "${config}" | grep -q 'COW_BRAND_NAME: Evo-Harness' \
    || die "Compose 合并结果缺少 Evo-Harness 品牌变量"
  printf '%s\n' "${config}" | grep -q 'bootstrap-brand.sh' \
    || die "Compose 合并结果缺少品牌启动命令"

  container="$(container_name)"
  docker inspect -f '{{.State.Running}}' "${container}" 2>/dev/null | grep -qx true \
    || die "容器未运行: ${container}"
  docker inspect -f '{{range .Config.Env}}{{println .}}{{end}}' "${container}" \
    | grep -Fxq 'COW_BRAND_NAME=Evo-Harness' \
    || die "容器未加载 Evo-Harness 品牌变量"
  docker inspect -f '{{range .Config.Env}}{{println .}}{{end}}' "${container}" \
    | grep -q '^CHATGPT_ON_WECHAT_EXEC=.*bootstrap-brand.sh' \
    || die "容器未加载品牌启动命令"

  docker exec "${container}" sh -lc \
    "grep -Fq \"const BRAND_NAME = 'Evo-Harness';\" /app/channel/web/static/js/console.js" \
    || die "容器前端品牌补丁未生效"
  docker exec "${container}" sh -lc \
    "grep -Fq 'Evo-Harness v' /app/plugins/cow_cli/cow_cli.py" \
    || die "容器 /version 品牌补丁未生效"

  wait_for_web
  info "止血包验证通过：Compose、容器环境、前端和 /version 品牌均已生效"
}

main "$@"
