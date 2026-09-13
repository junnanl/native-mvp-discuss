#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

restore_path() {
  local backup_rel target_rel image
  backup_rel="${1#"${TARGET_ROOT}/"}"
  target_rel="${3#"${TARGET_ROOT}/"}"
  [ "${backup_rel}" != "$1" ] || die "backup path must be under TARGET_ROOT: $1"
  [ "${target_rel}" != "$3" ] || die "restore target must be under TARGET_ROOT: $3"
  image="$(image_for_target)"
  docker run --rm --user 0:0 -v "${TARGET_ROOT}:/mnt/root" \
    -e "BACKUP_REL=${backup_rel}" -e "LABEL=$2" -e "TARGET_REL=${target_rel}" \
    --entrypoint sh "${image}" -c '
      set -e
      backup="/mnt/root/${BACKUP_REL}/${LABEL}"
      target="/mnt/root/${TARGET_REL}"
      if [ -e "${backup}/before" ]; then
        rm -rf "${target}"
        mkdir -p "$(dirname "${target}")"
        cp -a "${backup}/before" "${target}"
      elif [ -f "${backup}/absent" ]; then
        rm -rf "${target}"
      fi
    '
}

main() {
  require_tools
  require_target_root
  local backup
  backup="$(latest_backup_dir || true)"
  [ -n "${backup}" ] || die "no backup snapshot found for ${PATCH_VERSION}"
  restore_path "${backup}" "toolpack" "${TARGET_ROOT}/toolpacks/mcp/mcp-ssh-manager"
  restore_path "${backup}" "runtime" "${TARGET_ROOT}/storage/cow/mcp-ssh-manager"
  restore_path "${backup}" "mcp-json" "${TARGET_ROOT}/storage/cow/mcp.json"
  restore_path "${backup}" "admin-skill" "${TARGET_ROOT}/storage/cow/skills/ssh-manager-admin"
  restore_path "${backup}" "skills-config" "${TARGET_ROOT}/storage/cow/skills/skills_config.json"
  remove_patch_state
  restart_service
  wait_for_web
  printf 'patchVersion=%s\nrolledBackAt=%s\nbackupDir=%s\n' "${PATCH_VERSION}" "$(date -Iseconds)" "${backup}" \
    >> "${TARGET_ROOT}/storage/backups/patches/rollback.log"
  info "mcp-ssh-manager rollback completed"
}

main "$@"
