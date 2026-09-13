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
  require_env_file
  validate_runtime_config_json

  if [ "${SKIP_PATCH_STATE_CHECK:-0}" != "1" ]; then
    [ -f "$(patch_state_file)" ] || die "patch state is missing: $(patch_state_file)"
    grep -q '"status"[[:space:]]*:[[:space:]]*"applied"' "$(patch_state_file)" \
      || die "patch state is not applied"
  fi

  local cmd
  local env_file
  cmd="$(compose_cmd)"
  env_file="$(env_file_path)"
  (cd "${TARGET_ROOT}/compose" && ${cmd} --env-file "${env_file}" config >/dev/null)

  local port
  port="$(read_env_value COW_WEB_PORT || echo 9899)"
  wait_for_http "http://127.0.0.1:${port}/" 30 2 || die "web console is not reachable on host port ${port}"

  local container_name
  local host_config
  container_name="$(container_for_target)"
  host_config="$(runtime_config_path)"

  docker inspect -f '{{.State.Running}}' "${container_name}" 2>/dev/null | grep -qx true \
    || die "container is not running: ${container_name}"

  docker inspect -f '{{range .Mounts}}{{println .Destination}}{{end}}' "${container_name}" \
    | grep -Fxq '/app/config.json' \
    || die "/app/config.json is not mounted from host runtime config"
  docker inspect -f '{{range .Mounts}}{{println .Destination}}{{end}}' "${container_name}" \
    | grep -Fxq '/root/.cow' \
    || die "/root/.cow is not mounted from host env config"

  docker exec "${container_name}" python - <<'PY'
import json
from pathlib import Path
path = Path("/app/config.json")
with path.open("r", encoding="utf-8") as f:
    data = json.load(f)
if not isinstance(data, dict):
    raise SystemExit("container /app/config.json is not a JSON object")
for key in ("model", "bot_type", "agent_max_context_tokens", "agent_max_context_turns", "agent_max_steps"):
    if key not in data:
        raise SystemExit(f"missing runtime config key: {key}")
PY

  [ -s "${host_config}" ] || die "host runtime config is empty: ${host_config}"
  [ -f "${TARGET_ROOT}/storage/cow/env-config/.env" ] \
    || die "host skill env config is missing: ${TARGET_ROOT}/storage/cow/env-config/.env"
  info "runtime config persistence verify passed"
}

main "$@"
