#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

restore_tree() {
  local backup_dir="$1"
  local label="$2"
  local target="$3"
  if [ -e "${backup_dir}/${label}/before" ]; then
    rm -rf "${target}"
    mkdir -p "$(dirname "${target}")"
    cp -a "${backup_dir}/${label}/before" "${target}"
  elif [ -f "${backup_dir}/${label}/absent" ]; then
    rm -rf "${target}"
  fi
}

main() {
  require_tools
  require_target_root
  local dependent_state="${TARGET_ROOT}/storage/cow/patch-state/1.0.6-mcp-ssh-manager.json"
  if [ -f "${dependent_state}" ] && grep -q '"status"[[:space:]]*:[[:space:]]*"applied"' "${dependent_state}"; then
    die "rollback v1.0.6-mcp-ssh-manager before ${PATCH_VERSION}"
  fi
  local backup_dir
  backup_dir="$(latest_backup_dir || true)"
  [ -n "${backup_dir}" ] || die "no backup snapshot found for ${PATCH_VERSION}"

  restore_tree "${backup_dir}" "skill" "${TARGET_ROOT}/storage/cow/skills/html-report"
  restore_tree "${backup_dir}" "skills-config" "${TARGET_ROOT}/storage/cow/skills/skills_config.json"
  remove_patch_state
  normalize_mount_permissions
  restart_service
  wait_for_web

  {
    echo "patchVersion=${PATCH_VERSION}"
    echo "rolledBackAt=$(date -Iseconds)"
    echo "backupDir=${backup_dir}"
  } >> "${TARGET_ROOT}/storage/backups/patches/rollback.log"
  info "HTML Report Skill rollback completed"
}

main "$@"
