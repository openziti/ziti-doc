#!/usr/bin/env bash
# =============================================================================
# vercel-build.sh — Vercel's buildCommand for preview deployments.
#
# The C SDK reference (docs/reference/developer/sdk/clang/) is only produced
# when gendoc runs WITHOUT -l/--skip-linked-doc. That step is skipped by
# default on every preview (see docusaurus/vercel.json's prior buildCommand,
# "../gendoc.sh -l") to keep unrelated PR previews fast -- cloning ziti-sdk-c
# and running doxygen/doxybook2 takes real time nobody wants to pay for a docs
# wording fix.
#
# The trade-off: when a PR *does* touch the SDK-doc pipeline itself, skipping
# it means the preview can't show what the PR actually changes -- it falls
# back to generate.mjs's placeholder page instead (see sdk-docgen-fixups/c/
# generate.mjs's writePlaceholder()).
#
# This script picks between the two per-build instead of hardcoding one:
# full generation only when the diff against main actually touches something
# that affects the C SDK docs; the fast, skipped path otherwise.
# =============================================================================
set -euo pipefail
cd "$(dirname "$0")"

git remote add origin https://github.com/openziti/ziti-doc.git 2>/dev/null || true
git fetch origin main --depth=1 2>/dev/null || true

# Paths that can change what the C SDK reference build does or produces.
SDK_DOC_PATHS=(
  sdk-docgen-fixups/
  gendoc.mjs
  gendoc.sh
  gendoc.ps1
  docusaurus/sidebars.ts
)

if git diff --quiet origin/main HEAD -- "${SDK_DOC_PATHS[@]}" 2>/dev/null; then
  echo "vercel-build: no SDK-doc-related changes vs main -- skipping full generation for a fast preview"
  exec ./gendoc.sh -l
else
  echo "vercel-build: SDK-doc-related changes detected vs main -- running full generation so this preview shows them"
  exec ./gendoc.sh
fi
