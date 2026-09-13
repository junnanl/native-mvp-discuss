#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PATCH_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
DIST_DIR="${PATCH_ROOT}/dist"
PATCH_DIR_NAME="patch-v1.0.3-runtime-config-persistence"
PACKAGE_NAME="cowagent-patch-v1.0.3-runtime-config-persistence.tar.gz"

die() {
  echo "ERROR: $*" >&2
  exit 1
}

main() {
  [ -f "${PATCH_ROOT}/manifest.json" ] || die "missing manifest.json"
  mkdir -p "${PATCH_ROOT}/checksums" "${DIST_DIR}"
  (cd "${PATCH_ROOT}" && find patches scripts docs manifest.json update.sh verify.sh rollback.sh collect-logs.sh -type f \
    ! -path 'dist/*' \
    ! -path '*/__pycache__/*' \
    ! -name '*.pyc' \
    ! -name '.DS_Store' \
    -print0 | sort -z | xargs -0 sha256sum > checksums/SHA256SUMS)
  (cd "${PATCH_ROOT}/.." && tar -czf "${DIST_DIR}/${PACKAGE_NAME}" \
    --exclude="${PATCH_DIR_NAME}/dist" \
    --exclude='*/__pycache__' \
    --exclude='*.pyc' \
    --exclude='.DS_Store' \
    "${PATCH_DIR_NAME}/patches" \
    "${PATCH_DIR_NAME}/scripts" \
    "${PATCH_DIR_NAME}/docs" \
    "${PATCH_DIR_NAME}/checksums" \
    "${PATCH_DIR_NAME}/manifest.json" \
    "${PATCH_DIR_NAME}/update.sh" \
    "${PATCH_DIR_NAME}/verify.sh" \
    "${PATCH_DIR_NAME}/rollback.sh" \
    "${PATCH_DIR_NAME}/collect-logs.sh")

  if tar -tzf "${DIST_DIR}/${PACKAGE_NAME}" | grep -E '(^|/)compose/\.env$|support-bundles|__pycache__|\.pyc$|\.pem$|\.key$|cowagent-runtime\.config\.json' >/dev/null; then
    die "package contains forbidden runtime, secret, cache, or support-bundle path"
  fi

  (cd "${DIST_DIR}" && sha256sum "${PACKAGE_NAME}" > "${PACKAGE_NAME}.sha256")
  echo "${DIST_DIR}/${PACKAGE_NAME}"
}

main "$@"
