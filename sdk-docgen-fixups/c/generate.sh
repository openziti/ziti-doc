#!/usr/bin/env bash
# =============================================================================
# generate.sh — thin platform shim.
#
# All C SDK doc-generation logic lives in generate.mjs, the single
# cross-platform source of truth (shared with gendoc.ps1 on Windows). This
# script only forwards its arguments so existing shell callers keep working.
#
# Run `node generate.mjs --help` for the full option/env-var reference.
# =============================================================================
set -euo pipefail
script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
exec node "${script_dir}/generate.mjs" "$@"
