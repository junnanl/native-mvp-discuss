#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

main() {
  require_target_root
  local ts
  ts="$(date +%Y%m%d-%H%M%S)"
  local out_dir="${TARGET_ROOT}/storage/logs/support-bundles/patch-${ts}"
  mkdir -p "${out_dir}"

  cp "${PATCH_ROOT}/manifest.json" "${out_dir}/patch-manifest.json" 2>/dev/null || true
  cp "${TARGET_ROOT}/manifest.json" "${out_dir}/install-manifest.json" 2>/dev/null || true
  cp "${TARGET_ROOT}/compose/docker-compose.yml" "${out_dir}/docker-compose.yml" 2>/dev/null || true
  local env_file
  env_file="$(env_file_path)"
  if [ -f "${env_file}" ]; then
    redact_env < "${env_file}" > "${out_dir}/env.redacted"
  fi
  cp "${TARGET_ROOT}/storage/backups/patches/apply.log" "${out_dir}/patch-apply.log" 2>/dev/null || true
  cp "${TARGET_ROOT}/storage/backups/patches/rollback.log" "${out_dir}/patch-rollback.log" 2>/dev/null || true

  local cmd
  cmd="$(compose_cmd || true)"
  if [ -n "${cmd}" ]; then
    (cd "${TARGET_ROOT}/compose" && ${cmd} --env-file "${env_file}" ps > "${out_dir}/compose-ps.txt" 2>&1 || true)
    (cd "${TARGET_ROOT}/compose" && ${cmd} --env-file "${env_file}" logs --no-color 2>&1 | redact_env > "${out_dir}/compose.log" || true)
  fi

  tar -czf "${out_dir}.tar.gz" -C "$(dirname "${out_dir}")" "$(basename "${out_dir}")"
  echo "${out_dir}.tar.gz"
}

main "$@"
