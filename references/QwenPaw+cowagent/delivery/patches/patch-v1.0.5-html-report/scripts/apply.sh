#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

backup_tree() {
  local source="$1"
  local backup_root="$2"
  local label="$3"
  mkdir -p "${backup_root}/${label}"
  if [ -e "${source}" ]; then
    cp -a "${source}" "${backup_root}/${label}/before"
  else
    : > "${backup_root}/${label}/absent"
  fi
}

copy_tree() {
  local source="$1"
  local target="$2"
  mkdir -p "${target}"
  cp -a "${source}/." "${target}/"
}

main() {
  require_tools
  require_target_root
  verify_patch_checksums
  verify_target_compatibility
  require_previous_patch

  grep -q '"dependencyChange"[[:space:]]*:[[:space:]]*true' "${PATCH_ROOT}/manifest.json" \
    && die "dependencyChange=true requires a base image upgrade"

  local backup_dir
  backup_dir="${TARGET_ROOT}/storage/backups/patches/${PATCH_VERSION}/$(date +%Y%m%d-%H%M%S)"
  mkdir -p "${backup_dir}"
  backup_tree "${TARGET_ROOT}/storage/cow/skills/html-report" "${backup_dir}" "skill"
  backup_tree "${TARGET_ROOT}/storage/cow/skills/skills_config.json" "${backup_dir}" "skills-config"

  copy_tree "${PATCH_ROOT}/patches/skills/html-report" \
    "${TARGET_ROOT}/storage/cow/skills/html-report"
  register_html_report_skill

  write_patch_state "applying"
  trap 'remove_patch_state' ERR
  normalize_mount_permissions
  restart_service
  SKIP_PATCH_STATE_CHECK=1 "${SCRIPT_DIR}/verify.sh"
  write_patch_state "applied"
  trap - ERR

  {
    echo "patchVersion=${PATCH_VERSION}"
    echo "appliedAt=$(date -Iseconds)"
    echo "backupDir=${backup_dir}"
  } >> "${TARGET_ROOT}/storage/backups/patches/apply.log"
  info "HTML Report Skill update applied"
}

main "$@"

