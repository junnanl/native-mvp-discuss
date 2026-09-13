#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${ROOT}/common.sh"

main() {
  require_tools
  require_target_root
  verify_batch_checksums
  prepare_extract_root
  run_action 0 collect-logs
  run_action 1 collect-logs
  run_action 2 collect-logs
  run_action 3 collect-logs
  info "all update logs collected under ${TARGET_ROOT}/support-bundles"
}

main "$@"
