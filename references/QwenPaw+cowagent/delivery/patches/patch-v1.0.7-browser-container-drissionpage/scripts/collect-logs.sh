#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

main() {
  require_tools
  require_target_root
  local out name browser ts
  name="$(container_for_target)"
  browser="${name}-browser"
  ts="$(date +%Y%m%d-%H%M%S)"
  out="${TARGET_ROOT}/storage/logs/patch-collect/${PATCH_VERSION}/${ts}"
  mkdir -p "${out}"

  docker logs --timestamps "${browser}" > "${out}/browser-container.log" 2>&1 || true
  docker logs --timestamps --tail 2000 "${name}" > "${out}/cowagent-container.log" 2>&1 || true
  docker inspect "${browser}" > "${out}/browser-inspect.json" 2>&1 || true
  docker ps -a --format '{{.Names}}\t{{.Image}}\t{{.Status}}' > "${out}/containers.txt" || true

  # CDP 与内存水位快照
  cdp_port="$(read_env_value COW_BROWSER_CDP_PORT || echo 39222)"
  curl -fsS "http://127.0.0.1:${cdp_port}/json/version" > "${out}/cdp-version.json" 2>&1 || true
  curl -fsS "http://127.0.0.1:${cdp_port}/json/list" > "${out}/cdp-tabs.json" 2>&1 || true
  docker stats --no-stream --format '{{.Name}}\t{{.MemUsage}}\t{{.MemPerc}}' \
    | grep -E "${name}|${browser}" > "${out}/memory.txt" || true

  [ -f "${TARGET_ROOT}/storage/cow/mcp.json" ] && cp "${TARGET_ROOT}/storage/cow/mcp.json" "${out}/"
  [ -f "${TARGET_ROOT}/storage/cow/patch-state/${PATCH_VERSION}.json" ] && \
    cp "${TARGET_ROOT}/storage/cow/patch-state/${PATCH_VERSION}.json" "${out}/"

  info "logs collected at ${out}"
}

main "$@"
