#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

main() {
  require_docker
  require_env_file
  normalize_cow_runtime_permissions "${ROOT_DIR}"
  local cmd
  local env_file
  cmd="$(compose_cmd)"
  env_file="$(env_file_path)"
  (cd "${COMPOSE_DIR}" && ${cmd} --env-file "${env_file}" up -d)
}

main "$@"
