#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

main() {
  require_tools
  require_target_root
  local out_dir="${TARGET_ROOT}/support-bundles/html-report-$(date +%Y%m%d-%H%M%S)"
  local container
  mkdir -p "${out_dir}"
  container="$(container_for_target)"

  {
    echo "patchVersion=${PATCH_VERSION}"
    echo "targetRoot=${TARGET_ROOT}"
    echo "container=${container}"
    echo "createdAt=$(date -Iseconds)"
  } > "${out_dir}/summary.txt"
  [ -f "$(patch_state_file)" ] && cp -a "$(patch_state_file)" "${out_dir}/patch-state.json"
  if docker inspect "${container}" >/dev/null 2>&1; then
    docker logs --tail 300 "${container}" > "${out_dir}/container.log" 2>&1 || true
    docker exec "${container}" node \
      /home/agent/cow/skills/html-report/verify-offline.mjs \
      /home/agent/cow/skills/html-report/example.html \
      > "${out_dir}/offline-self-check.txt" 2>&1 || true
  fi
  info "logs collected: ${out_dir}"
}

main "$@"
