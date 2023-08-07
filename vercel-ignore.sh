#!/usr/bin/env bash
set -euo pipefail
git remote -v show
git fetch origin main
git diff --quiet origin/main HEAD -- ../docusaurus/ ../gendoc.sh
