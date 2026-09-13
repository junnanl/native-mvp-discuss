#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

copy_tree_if_exists() {
  local src="$1"
  local dst="$2"
  if [ -d "${src}" ]; then
    mkdir -p "${dst}"
    cp -a "${src}/." "${dst}/"
  fi
}

main() {
  require_target_root
  verify_patch_checksums
  verify_target_compatibility

  grep -q '"dependencyChange"[[:space:]]*:[[:space:]]*true' "${PATCH_ROOT}/manifest.json" \
    && die "dependencyChange=true requires a base image upgrade, not a lightweight patch"

  local patch_version
  patch_version="$(grep -o '"patchVersion"[[:space:]]*:[[:space:]]*"[^"]*"' "${PATCH_ROOT}/manifest.json" | cut -d'"' -f4)"
  [ -n "${patch_version}" ] || die "patchVersion not found in manifest"

  local backup_dir="${TARGET_ROOT}/storage/backups/patches/${patch_version}/$(date +%Y%m%d-%H%M%S)"
  mkdir -p "${backup_dir}"

  if [ -d "${TARGET_ROOT}/patch-mounted" ]; then
    cp -a "${TARGET_ROOT}/patch-mounted" "${backup_dir}/patch-mounted.before"
  fi
  mkdir -p "${backup_dir}/compose"
  if [ -f "${TARGET_ROOT}/compose/docker-compose.override.yml" ]; then
    cp -a "${TARGET_ROOT}/compose/docker-compose.override.yml" "${backup_dir}/compose/docker-compose.override.yml.before"
  else
    : > "${backup_dir}/compose/docker-compose.override.yml.absent"
  fi

  copy_tree_if_exists "${PATCH_ROOT}/patches/frontend" "${TARGET_ROOT}/patch-mounted/frontend"
  copy_tree_if_exists "${PATCH_ROOT}/patches/compose" "${TARGET_ROOT}/compose"

  mkdir -p "${TARGET_ROOT}/storage/backups/patches"
  {
    echo "patchVersion=${patch_version}"
    echo "appliedAt=$(date -Iseconds)"
    echo "backupDir=${backup_dir}"
  } >> "${TARGET_ROOT}/storage/backups/patches/apply.log"

  normalize_cow_storage_permissions
  restart_service
  "${SCRIPT_DIR}/verify.sh"
}

main "$@"
