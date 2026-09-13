#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

main() {
  require_tools
  require_target_root
  local out container
  out="${TARGET_ROOT}/support-bundles/mcp-ssh-manager-$(date +%Y%m%d-%H%M%S)"
  container="$(container_for_target)"
  mkdir -p "${out}"
  printf 'patchVersion=%s\ntargetRoot=%s\ncontainer=%s\ncreatedAt=%s\n' \
    "${PATCH_VERSION}" "${TARGET_ROOT}" "${container}" "$(date -Iseconds)" > "${out}/summary.txt"
  [ -f "$(patch_state_file)" ] && cp -a "$(patch_state_file)" "${out}/patch-state.json"
  if docker inspect "${container}" >/dev/null 2>&1; then
    docker logs --tail 300 "${container}" > "${out}/container.log" 2>&1 || true
    docker exec -i --user agent "${container}" python - < "${SCRIPT_DIR}/verify-cowagent.py" \
      > "${out}/mcp-self-check.txt" 2>&1 || true
  fi
  info "logs collected without SSH credentials: ${out}"
}

main "$@"
