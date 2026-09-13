#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOTFIX_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
DIST_DIR="$(cd "${HOTFIX_ROOT}/.." && pwd)/dist"
PACKAGE_NAME="cowagent-hotfix-v1.1.0-brand-bootstrap.1.tar.gz"

main() {
  mkdir -p "${HOTFIX_ROOT}/checksums" "${DIST_DIR}"
  (
    cd "${HOTFIX_ROOT}"
    find \
      docker-compose.override.yml \
      manifest.json \
      apply.sh \
      verify.sh \
      rollback.sh \
      scripts \
      docs \
      -type f \
      ! -path 'checksums/*' \
      ! -name 'SHA256SUMS' \
      -print0 \
      | sort -z \
      | xargs -0 sha256sum > "checksums/SHA256SUMS"
  )
  (
    cd "${HOTFIX_ROOT}/.."
    tar -czf "${DIST_DIR}/${PACKAGE_NAME}" "$(basename "${HOTFIX_ROOT}")"
  )
  (
    cd "${DIST_DIR}"
    sha256sum "${PACKAGE_NAME}" > "${PACKAGE_NAME}.sha256"
  )
  printf '%s\n' "${DIST_DIR}/${PACKAGE_NAME}"
}

main "$@"
