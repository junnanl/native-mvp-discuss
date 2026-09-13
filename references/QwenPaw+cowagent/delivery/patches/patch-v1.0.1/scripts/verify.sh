#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

http_get() {
  local url="$1"
  local rest
  local host_port
  local host
  local port
  local path
  local status

  rest="${url#http://}"
  [ "${rest}" != "${url}" ] || return 1
  host_port="${rest%%/*}"
  if [ "${rest}" = "${host_port}" ]; then
    path="/"
  else
    path="/${rest#*/}"
  fi
  if [ "${host_port}" != "${host_port%:*}" ]; then
    host="${host_port%:*}"
    port="${host_port##*:}"
  else
    host="${host_port}"
    port="80"
  fi

  exec 3<>"/dev/tcp/${host}/${port}" || return 1
  printf 'GET %s HTTP/1.0\r\nHost: %s\r\nConnection: close\r\n\r\n' "${path}" "${host}" >&3
  IFS= read -r status <&3 || {
    exec 3<&-
    exec 3>&-
    return 1
  }
  exec 3<&-
  exec 3>&-
  case "${status}" in
    HTTP/*" 2"*|HTTP/*" 3"*) return 0 ;;
    *) return 1 ;;
  esac
}

read_env_value() {
  local key="$1"
  local env_file
  env_file="$(env_file_path)"
  awk -F= -v k="${key}" '$1 == k {print substr($0, length(k) + 2); exit}' "${env_file}"
}

main() {
  require_target_root
  verify_patch_checksums
  verify_target_compatibility
  [ -f "${PATCH_ROOT}/manifest.json" ] || die "missing patch manifest"

  local cmd
  local env_file
  require_env_file
  cmd="$(compose_cmd)"
  env_file="$(env_file_path)"
  (cd "${TARGET_ROOT}/compose" && ${cmd} --env-file "${env_file}" config >/dev/null)

  local port
  port="$(read_env_value COW_WEB_PORT || echo 9899)"
  http_get "http://127.0.0.1:${port}/" || die "web console is not reachable on host port ${port}"

  info "patch verify passed"
}

main "$@"
