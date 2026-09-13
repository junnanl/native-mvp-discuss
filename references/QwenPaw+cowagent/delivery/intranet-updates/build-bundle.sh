#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARENT="$(dirname "${ROOT}")"
DIST_DIR="${ROOT}/dist"
BUNDLE_NAME="evo-harness-intranet-updates-v1.0.3-to-v1.0.6.tar.gz"
ROOT_NAME="$(basename "${ROOT}")"

die() {
  echo "ERROR: $*" >&2
  exit 1
}

main() {
  mkdir -p "${ROOT}/checksums" "${DIST_DIR}"

  local required=(
    "common.sh"
    "deploy-all.sh"
    "verify-all.sh"
    "rollback-all.sh"
    "collect-logs-all.sh"
    "build-bundle.sh"
    "manifest.json"
    "内网增量更新顺序.md"
    "cowagent-site-update-v1.0.3-runtime-config.tar.gz"
    "cowagent-site-update-v1.0.3-runtime-config.tar.gz.sha256"
    "cowagent-site-update-v1.0.4-officecli-toolpack.tar.gz"
    "cowagent-site-update-v1.0.4-officecli-toolpack.tar.gz.sha256"
    "cowagent-site-update-v1.0.5-html-report.tar.gz"
    "cowagent-site-update-v1.0.5-html-report.tar.gz.sha256"
    "cowagent-site-update-v1.0.6-mcp-ssh-manager.tar.gz"
    "cowagent-site-update-v1.0.6-mcp-ssh-manager.tar.gz.sha256"
  )
  local file
  for file in "${required[@]}"; do
    [ -f "${ROOT}/${file}" ] || die "missing required file: ${file}"
  done

  (
    cd "${ROOT}"
    printf '%s\0' "${required[@]}" | sort -z | xargs -0 sha256sum > "checksums/SHA256SUMS"
  )

  (
    cd "${PARENT}"
    tar -czf "${DIST_DIR}/${BUNDLE_NAME}" \
      "${ROOT_NAME}/common.sh" \
      "${ROOT_NAME}/deploy-all.sh" \
      "${ROOT_NAME}/verify-all.sh" \
      "${ROOT_NAME}/rollback-all.sh" \
      "${ROOT_NAME}/collect-logs-all.sh" \
      "${ROOT_NAME}/build-bundle.sh" \
      "${ROOT_NAME}/manifest.json" \
      "${ROOT_NAME}/内网增量更新顺序.md" \
      "${ROOT_NAME}/cowagent-site-update-v1.0.3-runtime-config.tar.gz" \
      "${ROOT_NAME}/cowagent-site-update-v1.0.3-runtime-config.tar.gz.sha256" \
      "${ROOT_NAME}/cowagent-site-update-v1.0.4-officecli-toolpack.tar.gz" \
      "${ROOT_NAME}/cowagent-site-update-v1.0.4-officecli-toolpack.tar.gz.sha256" \
      "${ROOT_NAME}/cowagent-site-update-v1.0.5-html-report.tar.gz" \
      "${ROOT_NAME}/cowagent-site-update-v1.0.5-html-report.tar.gz.sha256" \
      "${ROOT_NAME}/cowagent-site-update-v1.0.6-mcp-ssh-manager.tar.gz" \
      "${ROOT_NAME}/cowagent-site-update-v1.0.6-mcp-ssh-manager.tar.gz.sha256" \
      "${ROOT_NAME}/checksums/SHA256SUMS"
  )

  if tar -tzf "${DIST_DIR}/${BUNDLE_NAME}" \
    | grep -E '(^|/)(storage|support-bundles|logs|uploads|database|\.env)(/|$)|\.pem$|\.key$|__pycache__|\.pyc$' >/dev/null; then
    die "bundle contains a forbidden runtime, secret-file, cache, or data path"
  fi

  (cd "${DIST_DIR}" && sha256sum "${BUNDLE_NAME}" > "${BUNDLE_NAME}.sha256")
  echo "${DIST_DIR}/${BUNDLE_NAME}"
}

main "$@"
