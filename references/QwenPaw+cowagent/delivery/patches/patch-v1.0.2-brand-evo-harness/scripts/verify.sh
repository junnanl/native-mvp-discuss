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
  IFS= read -r status <&3 2>/dev/null || {
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

wait_for_http() {
  local url="$1"
  local attempts="${2:-30}"
  local delay="${3:-2}"
  local i
  for i in $(seq 1 "${attempts}"); do
    if http_get "${url}"; then
      return 0
    fi
    sleep "${delay}"
  done
  return 1
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
  wait_for_http "http://127.0.0.1:${port}/" 30 2 || die "web console is not reachable on host port ${port}"

  local container_name
  container_name="$(read_env_file_value "${env_file}" COW_CONTAINER_NAME || echo cowagent-offline)"
  docker exec "${container_name}" grep -q "Evo-Harness Console" "/app/channel/web/chat.html" \
    || die "brand title was not applied in container"
  docker exec "${container_name}" grep -q "Evo-Harness" "/app/channel/web/static/js/console.js" \
    || die "brand script was not applied in container"
  docker exec "${container_name}" grep -q "Evo-Harness" "/app/channel/web/web_channel.py" \
    || die "brand backend title was not applied in container"
  docker exec "${container_name}" test -s "/app/channel/web/static/logo.jpg" \
    || die "brand logo.jpg is missing in container"
  docker exec "${container_name}" test -s "/app/channel/web/static/favicon.ico" \
    || die "brand favicon.ico is missing in container"
  if docker exec "${container_name}" grep -RInE "docs\\.cowagent\\.ai|https://cowagent\\.ai|github\\.com/zhayujie|skills\\.cowagent\\.ai" \
      "/app/channel/web/chat.html" "/app/channel/web/static/js/console.js" >/dev/null; then
    die "external CowAgent links are still present in patched web files"
  fi

  info "patch verify passed"
}

main "$@"
