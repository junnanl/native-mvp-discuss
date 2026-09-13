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

  local skill_root="${TARGET_ROOT}/storage/cow/skills/html-report"
  local container
  [ -s "${skill_root}/SKILL.md" ] || die "HTML Report Skill is missing"
  [ -s "${skill_root}/render.mjs" ] || die "HTML Report renderer is missing"
  [ -s "${skill_root}/verify-offline.mjs" ] || die "HTML offline verifier is missing"
  [ -s "${skill_root}/references/UPSTREAM_SKILL.md" ] || die "upstream Skill reference is missing"
  [ -s "${skill_root}/LICENSE" ] || die "HTML Report license is missing"

  container="$(container_for_target)"
  docker inspect -f '{{.State.Running}}' "${container}" 2>/dev/null | grep -qx true \
    || die "container is not running: ${container}"
  docker exec "${container}" node \
    /home/agent/cow/skills/html-report/verify-offline.mjs \
    /home/agent/cow/skills/html-report/example.html >/dev/null \
    || die "HTML Report offline self-check failed"
  docker exec --user agent "${container}" sh -c '
    set -e
    mkdir -p /home/agent/cow/tmp/reports
    probe=/home/agent/cow/tmp/reports/.html-report-write-test
    : > "$probe"
    rm -f "$probe"
  ' || die "HTML Report output directory is not writable by agent user"
  grep -A8 '"html-report"[[:space:]]*:' "${TARGET_ROOT}/storage/cow/skills/skills_config.json" \
    | grep -q '"enabled"[[:space:]]*:[[:space:]]*true' \
    || die "HTML Report Skill is not enabled"
  wait_for_web
  info "HTML Report Skill verify passed"
}

main "$@"

