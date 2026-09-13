#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PATCH_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
DIST_DIR="${PATCH_ROOT}/dist"
PACKAGE_NAME="cowagent-patch-v1.0.1.tar.gz"

die() {
  echo "ERROR: $*" >&2
  exit 1
}

main() {
  [ -f "${PATCH_ROOT}/manifest.json" ] || die "missing manifest.json"
  mkdir -p "${PATCH_ROOT}/checksums" "${DIST_DIR}"
  (cd "${PATCH_ROOT}" && find patches scripts docs manifest.json -type f \
    ! -path 'dist/*' \
    ! -path '*/__pycache__/*' \
    ! -name '*.pyc' \
    ! -name '.DS_Store' \
    -print0 | sort -z | xargs -0 sha256sum > checksums/SHA256SUMS)
  (cd "${PATCH_ROOT}/.." && tar -czf "${DIST_DIR}/${PACKAGE_NAME}" \
    --exclude='patch-v1.0.1/dist' \
    --exclude='*/__pycache__' \
    --exclude='*.pyc' \
    --exclude='.DS_Store' \
    patch-v1.0.1/patches \
    patch-v1.0.1/scripts \
    patch-v1.0.1/docs \
    patch-v1.0.1/checksums \
    patch-v1.0.1/manifest.json)

  if tar -tzf "${DIST_DIR}/${PACKAGE_NAME}" | grep -E '(^|/)storage/|(^|/)compose/\.env$|support-bundles|__pycache__|\.pyc$|\.pem$|\.key$' >/dev/null; then
    die "package contains forbidden runtime, secret, cache, or support-bundle path"
  fi

  (cd "${DIST_DIR}" && sha256sum "${PACKAGE_NAME}" > "${PACKAGE_NAME}.sha256")
  echo "${DIST_DIR}/${PACKAGE_NAME}"
}

main "$@"
