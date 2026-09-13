#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

main() {
  require_target_root

  local patch_version
  patch_version="$(grep -o '"patchVersion"[[:space:]]*:[[:space:]]*"[^"]*"' "${PATCH_ROOT}/manifest.json" | cut -d'"' -f4)"
  [ -n "${patch_version}" ] || die "patchVersion not found in manifest"

  local patch_backup_root="${TARGET_ROOT}/storage/backups/patches/${patch_version}"
  [ -d "${patch_backup_root}" ] || die "no backup directory found for ${patch_version}"

  local latest_backup
  latest_backup="$(find "${patch_backup_root}" -mindepth 1 -maxdepth 1 -type d | sort | tail -n 1)"
  [ -n "${latest_backup}" ] || die "no backup snapshot found for ${patch_version}"

  if [ -d "${latest_backup}/patch-mounted.before" ]; then
    rm -rf "${TARGET_ROOT}/patch-mounted"
    cp -a "${latest_backup}/patch-mounted.before" "${TARGET_ROOT}/patch-mounted"
  fi

  if [ -d "${latest_backup}/storage-cow/skills.before" ]; then
    rm -rf "${TARGET_ROOT}/storage/cow/skills"
    mkdir -p "${TARGET_ROOT}/storage/cow"
    cp -a "${latest_backup}/storage-cow/skills.before" "${TARGET_ROOT}/storage/cow/skills"
  fi

  if [ -d "${latest_backup}/toolpacks.before" ]; then
    rm -rf "${TARGET_ROOT}/toolpacks"
    cp -a "${latest_backup}/toolpacks.before" "${TARGET_ROOT}/toolpacks"
  fi

  {
    echo "patchVersion=${patch_version}"
    echo "rolledBackAt=$(date -Iseconds)"
    echo "backupDir=${latest_backup}"
  } >> "${TARGET_ROOT}/storage/backups/patches/rollback.log"

  normalize_cow_storage_permissions
  restart_service
  "${SCRIPT_DIR}/verify.sh"
}

main "$@"
