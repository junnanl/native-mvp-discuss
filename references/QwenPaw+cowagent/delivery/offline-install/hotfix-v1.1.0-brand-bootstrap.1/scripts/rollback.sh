#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

main() {
  require_docker
  require_target
  verify_hotfix_checksums

  local backup_dir
  local override_was_present
  local target_override="${TARGET_ROOT}/compose/docker-compose.override.yml"
  backup_dir="$(read_state_value backupDir || true)"
  override_was_present="$(read_state_value overrideWasPresent || true)"
  [ -n "${backup_dir}" ] || die "未找到止血包备份记录"

  if [ "${override_was_present}" = "true" ]; then
    [ -f "${backup_dir}/docker-compose.override.yml.before" ] \
      || die "备份文件不存在: ${backup_dir}/docker-compose.override.yml.before"
    cp -a "${backup_dir}/docker-compose.override.yml.before" "${target_override}"
    restart_service
  else
    rm -f "${target_override}"
    local cmd
    cmd="$(compose_cmd)"
    (
      cd "${TARGET_ROOT}/compose"
      ${cmd} --env-file ".env" -f "docker-compose.yml" up -d --force-recreate cowagent
    )
  fi

  write_state "rolled_back" "${backup_dir}" "${override_was_present}"
  info "止血包已回滚，现场数据和 compose/.env 未被修改"
}

main "$@"
