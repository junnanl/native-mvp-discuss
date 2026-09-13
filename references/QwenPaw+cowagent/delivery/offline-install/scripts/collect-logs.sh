#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

main() {
  local ts
  ts="$(date +%Y%m%d-%H%M%S)"
  local out_dir="${ROOT_DIR}/storage/logs/support-bundles/${ts}"
  mkdir -p "${out_dir}"

  cp "${ROOT_DIR}/manifest.json" "${out_dir}/manifest.json" 2>/dev/null || true
  cp "${COMPOSE_DIR}/docker-compose.yml" "${out_dir}/docker-compose.yml" 2>/dev/null || true
  local env_file
  env_file="$(env_file_path)"
  if [ -f "${env_file}" ]; then
    redact_env < "${env_file}" > "${out_dir}/env.redacted"
  fi

  if docker info >/dev/null 2>&1; then
    docker ps -a > "${out_dir}/docker-ps.txt" 2>&1 || true
    local cmd
    cmd="$(compose_cmd || true)"
    if [ -n "${cmd}" ] && [ -f "${COMPOSE_DIR}/docker-compose.yml" ]; then
      (cd "${COMPOSE_DIR}" && ${cmd} --env-file "${env_file}" ps > "${out_dir}/compose-ps.txt" 2>&1 || true)
      (cd "${COMPOSE_DIR}" && ${cmd} --env-file "${env_file}" logs --no-color 2>&1 | redact_env > "${out_dir}/compose.log" || true)
    fi
  fi

  tar -czf "${out_dir}.tar.gz" -C "$(dirname "${out_dir}")" "$(basename "${out_dir}")"
  echo "${out_dir}.tar.gz"
}

main "$@"
