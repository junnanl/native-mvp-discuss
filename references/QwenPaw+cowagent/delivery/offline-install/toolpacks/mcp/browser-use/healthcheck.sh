#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TOOLPACK_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
PYTHON_BIN="${TOOLPACK_ROOT}/python/browser-use/runtime/cpython-3.11.15-linux-x86_64-gnu/bin/python3.11"
SITE_PACKAGES="${TOOLPACK_ROOT}/python/browser-use/site-packages"
export PYTHONPATH="${SITE_PACKAGES}${PYTHONPATH:+:${PYTHONPATH}}"

"${PYTHON_BIN}" - <<'PY'
import importlib.metadata as metadata
import browser_harness
import browser_use

assert metadata.version("browser-use") == "0.13.8"
assert metadata.version("browser-harness") == "0.1.9"
assert browser_use.__file__
assert browser_harness.__file__
print("browser-use toolpack healthy: browser-use 0.13.8, browser-harness 0.1.9")
PY
