#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

main() {
  require_tools
  local image name browser cdp_port runtime_py
  image="$(image_for_target)"
  name="$(container_for_target)"
  browser="${name}-browser"
  cdp_port="$(read_env_value COW_BROWSER_CDP_PORT || echo 39222)"
  runtime_py="/opt/cowagent-offline/toolpacks/python/browser-use/runtime/cpython-3.11.15-linux-x86_64-gnu/bin/python3.11"

  info "checking browser container"
  docker ps --format '{{.Names}} {{.Status}}' | grep -q "^${browser} " \
    || die "browser container not running: ${browser}"

  info "checking CDP endpoint on 127.0.0.1:${cdp_port}"
  curl -fsS "http://127.0.0.1:${cdp_port}/json/version" | grep -q '"Browser"' \
    || die "CDP endpoint not reachable"

  info "checking toolpack files"
  [ -x "${TARGET_ROOT}/toolpacks/mcp/browser-dp/bin/browser-dp" ] || die "browser-dp launcher missing"
  [ -d "${TARGET_ROOT}/toolpacks/python/drissionpage/site-packages/DrissionPage" ] || die "DrissionPage site-packages missing"
  [ -x "${TARGET_ROOT}/toolpacks/python/browser-use/runtime/cpython-3.11.15-linux-x86_64-gnu/bin/python3.11" ] || die "baseline Python runtime missing (requires offline-install 1.1.0)"
  grep -q '"browser-dp"' "${TARGET_ROOT}/storage/cow/mcp.json" || die "browser-dp not registered in mcp.json"
  python3 -c "import json,sys;d=json.load(open('${TARGET_ROOT}/storage/cow/mcp.json'));sys.exit(0 if d['mcpServers']['browser-dp']['disabled'] is False else 1)" \
    || die "browser-dp mcp entry disabled"
  python3 -c "import json,sys;d=json.load(open('${TARGET_ROOT}/storage/cow/mcp.json'));bu=d['mcpServers'].get('browser-use');sys.exit(0 if bu is None or bu.get('disabled') is True else 1)" \
    || die "browser-use should be disabled"

  info "checking skill registration"
  python3 -c "import json,sys;d=json.load(open('${TARGET_ROOT}/storage/cow/skills/skills_config.json'));sys.exit(0 if d.get('browser-dp',{}).get('enabled') is True else 1)" \
    || die "browser-dp skill not enabled"

  info "running MCP smoke verification in baseline image container"
  docker run --rm --link "${browser}:browser" \
    -v "${TARGET_ROOT}/toolpacks:/opt/cowagent-offline/toolpacks:ro" \
    -v "${PATCH_ROOT}:/mnt/patch:ro" \
    --entrypoint "${runtime_py}" \
    -e "DP_BROWSER_ADDRESS=browser:9222" \
    -e "PYTHONPATH=/opt/cowagent-offline/toolpacks/python/drissionpage/site-packages" \
    "${image}" /mnt/patch/scripts/verify-client.py

  info "verify passed"
}

main "$@"
