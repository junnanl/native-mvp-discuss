#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${ROOT}/common.sh"

main() {
  require_tools
  require_target_root
  verify_batch_checksums
  prepare_extract_root
  run_runtime_config_update
  run_action 0 verify
  run_action 1 update
  run_action 1 verify
  run_action 2 update
  run_action 2 verify
  run_action 3 update
  run_action 3 verify
  info "all four incremental updates completed"
}

main "$@"
