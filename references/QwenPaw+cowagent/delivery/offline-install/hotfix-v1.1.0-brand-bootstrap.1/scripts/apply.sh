#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

main() {
  require_docker
  require_target
  verify_hotfix_checksums
  verify_compatibility

  local backup_dir
  local override_was_present="false"
  local target_override="${TARGET_ROOT}/compose/docker-compose.override.yml"

  # This hotfix exists for the 1.1.0 package variant that accidentally
  # omitted the Compose override altogether.  Replacing an existing override
  # would silently discard site-specific environment variables, mounts, or
  # extra_hosts entries.  Refuse that case before creating any backup or
  # changing the target.  A byte-identical override means the hotfix was
  # already applied and is safe to verify again (idempotent rerun).
  if [ -f "${target_override}" ]; then
    if cmp -s "${target_override}" "${HOTFIX_ROOT}/docker-compose.override.yml"; then
      SKIP_STATE_CHECK=1 "${SCRIPT_DIR}/verify.sh"
      info "止血包已存在，幂等验证通过；现场文件未修改"
      trap - ERR
      exit 0
    fi
    die "现场已存在 docker-compose.override.yml，为避免覆盖现场配置，本止血包停止应用；请使用修正后的完整 1.1.0 交付包或人工合并品牌配置"
  fi

  prepare_state_storage
  backup_dir="${TARGET_ROOT}/storage/backups/hotfixes/${HOTFIX_VERSION}/$(date +%Y%m%d-%H%M%S)"
  mkdir -p "${backup_dir}"

  restore_on_error() {
    local rc=$?
    echo "错误: 应用失败，正在恢复原 Compose override" >&2
    if [ "${override_was_present}" = "true" ]; then
      cp -a "${backup_dir}/docker-compose.override.yml.before" "${target_override}"
      restart_service || true
    else
      rm -f "${target_override}"
      local cmd
      cmd="$(compose_cmd)"
      (
        cd "${TARGET_ROOT}/compose"
        ${cmd} --env-file ".env" -f "docker-compose.yml" up -d --force-recreate cowagent
      ) || true
    fi
    exit "${rc}"
  }
  trap restore_on_error ERR

  cp -a "${HOTFIX_ROOT}/docker-compose.override.yml" "${target_override}"
  chmod 0644 "${target_override}"

  local config
  config="$(compose_config)"
  printf '%s\n' "${config}" | grep -q 'COW_BRAND_NAME: Evo-Harness' \
    || die "Compose 合并结果缺少 Evo-Harness 品牌变量"
  printf '%s\n' "${config}" | grep -q 'bootstrap-brand.sh' \
    || die "Compose 合并结果缺少品牌启动命令"

  restart_service
  SKIP_STATE_CHECK=1 "${SCRIPT_DIR}/verify.sh"
  write_state "applied" "${backup_dir}" "${override_was_present}"
  trap - ERR

  info "止血包应用成功，现场数据和 compose/.env 未被修改"
}

main "$@"
