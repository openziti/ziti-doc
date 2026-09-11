#!/usr/bin/env bash
# =============================================================================
# gendoc.sh — thin platform shim.
#
# All build logic lives in gendoc.mjs, the single cross-platform source of
# truth (shared with gendoc.ps1). This script only forwards its arguments so
# existing callers (CI, publish.sh, publish-2025.sh, the unified-doc build)
# keep working unchanged.
#
# Run `node gendoc.mjs --help` for the full option/env-var reference.
# =============================================================================
set -euo pipefail
script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
exec node "${script_dir}/gendoc.mjs" "$@"
