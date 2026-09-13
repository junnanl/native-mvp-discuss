#!/usr/bin/env bash
set -Eeuo pipefail

BUNDLE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_ROOT="${TARGET_ROOT:-/opt/cowagent-offline}"
PACKAGE_NAMES=(
  "cowagent-site-update-v1.0.3-runtime-config.tar.gz"
  "cowagent-site-update-v1.0.4-officecli-toolpack.tar.gz"
  "cowagent-site-update-v1.0.5-html-report.tar.gz"
  "cowagent-site-update-v1.0.6-mcp-ssh-manager.tar.gz"
)
EXTRACT_DIR_NAMES=(
  "site-update-v1.0.3-runtime-config"
  "site-update-v1.0.4-officecli-toolpack"
  "site-update-v1.0.5-html-report"
  "site-update-v1.0.6-mcp-ssh-manager"
)

die() {
  echo "ERROR: $*" >&2
  exit 1
}

info() {
  echo "INFO: $*"
}

require_tools() {
  command -v docker >/dev/null 2>&1 || die "docker is required"
  command -v tar >/dev/null 2>&1 || die "tar is required"
  command -v sha256sum >/dev/null 2>&1 || die "sha256sum is required"
  docker info >/dev/null 2>&1 || die "docker daemon is not available"
}

require_target_root() {
  [ -d "${TARGET_ROOT}/compose" ] || die "invalid target root: ${TARGET_ROOT}"
  [ -f "${TARGET_ROOT}/manifest.json" ] || die "missing target manifest"
}

verify_batch_checksums() {
  [ -f "${BUNDLE_ROOT}/checksums/SHA256SUMS" ] || die "missing checksums/SHA256SUMS"
  (cd "${BUNDLE_ROOT}" && sha256sum -c --quiet "checksums/SHA256SUMS")
}

prepare_extract_root() {
  EXTRACT_ROOT="$(mktemp -d "${TMPDIR:-/tmp}/evo-harness-updates.XXXXXX")"
  export EXTRACT_ROOT
  trap 'rm -rf "${EXTRACT_ROOT}"' EXIT
  local package
  for package in "${PACKAGE_NAMES[@]}"; do
    tar -xzf "${BUNDLE_ROOT}/${package}" -C "${EXTRACT_ROOT}"
  done
}

run_action() {
  local index="$1"
  local action="$2"
  local update_root="${EXTRACT_ROOT}/${EXTRACT_DIR_NAMES[${index}]}"
  [ -f "${update_root}/${action}.sh" ] || die "missing ${action}.sh in ${update_root}"
  info "${action}: ${EXTRACT_DIR_NAMES[${index}]}"
  TARGET_ROOT="${TARGET_ROOT}" bash "${update_root}/${action}.sh"
}

run_runtime_config_update() {
  local update_root="${EXTRACT_ROOT}/${EXTRACT_DIR_NAMES[0]}"
  local entrypoint="update.sh"
  if [ "${PRESERVE_CURRENT_CONFIG:-0}" = "1" ]; then
    entrypoint="install-preserve-current.sh"
  fi
  [ -f "${update_root}/${entrypoint}" ] || die "missing ${entrypoint} in ${update_root}"
  info "update: ${EXTRACT_DIR_NAMES[0]} via ${entrypoint}"
  TARGET_ROOT="${TARGET_ROOT}" bash "${update_root}/${entrypoint}"
}
