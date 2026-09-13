#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

http_get() {
  local url="$1"
  local rest
  local host_port
  local host
  local port
  local path
  local status

  rest="${url#http://}"
  [ "${rest}" != "${url}" ] || return 1
  host_port="${rest%%/*}"
  if [ "${rest}" = "${host_port}" ]; then
    path="/"
  else
    path="/${rest#*/}"
  fi
  if [ "${host_port}" != "${host_port%:*}" ]; then
    host="${host_port%:*}"
    port="${host_port##*:}"
  else
    host="${host_port}"
    port="80"
  fi

  exec 3<>"/dev/tcp/${host}/${port}" || return 1
  printf 'GET %s HTTP/1.0\r\nHost: %s\r\nConnection: close\r\n\r\n' "${path}" "${host}" >&3
  IFS= read -r status <&3 || {
    exec 3<&-
    exec 3>&-
    return 1
  }
  exec 3<&-
  exec 3>&-
  case "${status}" in
    HTTP/*" 2"*|HTTP/*" 3"*) return 0 ;;
    *) return 1 ;;
  esac
}

verify_container_runtime() {
  local container="$1"
  local required_skill_dirs="$2"

  docker inspect -f '{{.State.Running}}' "${container}" 2>/dev/null | grep -qx true \
    || die "container is not running: ${container}"

  docker exec "${container}" sh -lc '
    set -eu
    for c in soffice libreoffice pandoc pdftoppm tesseract node npm npx chromium; do
      command -v "$c" >/dev/null 2>&1 || {
        echo "missing runtime command: $c" >&2
        exit 1
      }
    done
    python - <<'"'"'PY'"'"'
mods = [
    "fitz", "pdfplumber", "pdf2image", "pytesseract", "pandas",
    "matplotlib", "jinja2", "seaborn", "scipy", "sklearn",
    "markitdown", "defusedxml",
]
for mod in mods:
    __import__(mod)
PY
    node -e "require(\"docx\"); require(\"pptxgenjs\")"
  ' || die "runtime dependency verification failed"

  docker exec "${container}" sh -lc '
    set -eu
    /opt/cowagent/toolpacks/mcp/browser-use/healthcheck.sh
    export PYTHONPATH=/opt/cowagent/toolpacks/python/browser-use/site-packages
    /opt/cowagent/toolpacks/python/browser-use/runtime/cpython-3.11.15-linux-x86_64-gnu/bin/python3.11 - <<'PY'
import asyncio
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def main():
    params = StdioServerParameters(
        command="/opt/cowagent/toolpacks/mcp/browser-use/bin/browser-use",
        args=[],
    )
    async with stdio_client(params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            names = [tool.name for tool in (await session.list_tools()).tools]
            expected = ["browser_exec", "browser_screenshot"]
            if names != expected:
                raise SystemExit(f"unexpected browser-use tools: {names}")
            print(f"browser-use MCP verified: {names}")

asyncio.run(main())
PY
  ' || die "browser-use MCP verification failed"

  docker exec --user agent "${container}" sh -lc '
    set -eu
    mkdir -p /home/agent/cow/tmp
    test -w /home/agent/cow/tmp
    probe="/home/agent/cow/tmp/.cowagent-write-test-$$"
    : > "${probe}"
    rm -f "${probe}"
  ' || die "workspace tmp directory is not writable by agent"

  docker exec -e REQUIRED_SKILL_DIRS="${required_skill_dirs}" "${container}" sh -lc '
    python - <<'"'"'PY'"'"'
import os
import sys
from pathlib import Path
from agent.skills.manager import SkillManager

skills_dir = Path("/home/agent/cow/skills")
required = [
    item.strip()
    for item in os.environ.get("REQUIRED_SKILL_DIRS", "").split(",")
    if item.strip()
]

missing_dirs = [
    name for name in required
    if not (skills_dir / name / "SKILL.md").is_file()
]
if missing_dirs:
    print("missing skill directories: " + ", ".join(missing_dirs), file=sys.stderr)
    sys.exit(1)

manager = SkillManager(custom_dir=str(skills_dir))
loaded = set()
for entry in manager.list_skills():
    loaded.add(entry.skill.name)
    loaded.add(Path(entry.skill.base_dir).name)

missing_loaded = [name for name in required if name not in loaded]
if missing_loaded:
    print("skills not loaded by SkillManager: " + ", ".join(missing_loaded), file=sys.stderr)
    sys.exit(1)

print(f"skills verified: {len(manager.list_skills())} loaded")
PY
  ' || die "skill verification failed"
}

main() {
  require_docker
  [ -f "${COMPOSE_DIR}/docker-compose.yml" ] || die "missing docker-compose.yml"
  [ -f "${COMPOSE_DIR}/docker-compose.override.yml" ] || die "missing docker-compose.override.yml; brand patch is not installed"
  require_env_file
  [ -d "${ROOT_DIR}/storage/cow" ] || die "missing storage/cow"
  [ -d "${ROOT_DIR}/patch-mounted" ] || die "missing patch-mounted"
  [ -d "${ROOT_DIR}/source-mounted" ] || die "missing source-mounted"

  local cmd
  local env_file
  cmd="$(compose_cmd)"
  env_file="$(env_file_path)"
  local compose_config
  compose_config="$(cd "${COMPOSE_DIR}" && ${cmd} --env-file "${env_file}" config)"
  printf '%s\n' "${compose_config}" | grep -q 'COW_BRAND_NAME: Evo-Harness' \
    || die "merged Compose config is missing COW_BRAND_NAME=Evo-Harness"
  printf '%s\n' "${compose_config}" | grep -q 'CHATGPT_ON_WECHAT_EXEC:' \
    || die "merged Compose config is missing the brand bootstrap command"

  local port
  port="$(read_env_value COW_WEB_PORT || echo 9899)"
  http_get "http://127.0.0.1:${port}/" || die "web console is not reachable on host port ${port}"

  local container
  local required_skill_dirs
  container="$(read_env_value COW_CONTAINER_NAME || echo cowagent-offline)"
  required_skill_dirs="$(read_env_value COW_REQUIRED_SKILL_DIRS || true)"
  if [ -z "${required_skill_dirs}" ]; then
    required_skill_dirs="xlsx,docx,official-writing,markdown-converter,Word---DOCX,pdf,pptx,eda-reporter,browser-use"
  fi
  verify_container_runtime "${container}" "${required_skill_dirs}"

  info "verify passed"
}

main "$@"
