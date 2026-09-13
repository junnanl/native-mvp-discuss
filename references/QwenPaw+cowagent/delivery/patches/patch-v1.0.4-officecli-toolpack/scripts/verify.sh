#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

main() {
  require_tools
  require_target_root
  verify_patch_checksums
  verify_target_compatibility
  require_previous_patch

  if [ "${SKIP_PATCH_STATE_CHECK:-0}" != "1" ]; then
    [ -f "$(patch_state_file)" ] || die "patch state is missing: $(patch_state_file)"
    grep -q '"status"[[:space:]]*:[[:space:]]*"applied"' "$(patch_state_file)" \
      || die "patch state is not applied"
  fi

  local binary="${TARGET_ROOT}/toolpacks/binaries/officecli/officecli"
  local skill="${TARGET_ROOT}/storage/cow/skills/officecli/SKILL.md"
  local container
  local actual_sha
  [ -x "${binary}" ] || die "OfficeCLI binary is missing or not executable: ${binary}"
  [ -s "${skill}" ] || die "OfficeCLI Skill is missing: ${skill}"
  actual_sha="$(sha256sum "${binary}" | awk '{print $1}')"
  [ "${actual_sha}" = "86a0b7d2a847ff2a9ee9e4be83b39300a3620184911698900608a32914970f51" ] \
    || die "OfficeCLI binary SHA256 mismatch"

  container="$(container_for_target)"
  docker inspect -f '{{.State.Running}}' "${container}" 2>/dev/null | grep -qx true \
    || die "container is not running: ${container}"
  docker inspect -f '{{range .Mounts}}{{println .Destination}}{{end}}' "${container}" \
    | grep -Fxq '/opt/cowagent/toolpacks' \
    || die "toolpacks mount is missing from container"
  [ "$(docker exec "${container}" /opt/cowagent/toolpacks/binaries/officecli/officecli --version)" = "1.0.134" ] \
    || die "OfficeCLI container version check failed"
  docker exec "${container}" test -s /home/agent/cow/skills/officecli/SKILL.md \
    || die "OfficeCLI Skill is not visible inside container"
  grep -A8 '"officecli"[[:space:]]*:' "${TARGET_ROOT}/storage/cow/skills/skills_config.json" \
    | grep -q '"enabled"[[:space:]]*:[[:space:]]*true' \
    || die "OfficeCLI Skill is not enabled"
  wait_for_web
  info "OfficeCLI Toolpack verify passed"
}

main "$@"
