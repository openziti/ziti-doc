#!/usr/bin/env bash
set -euo pipefail
git remote add origin https://github.com/openziti/ziti-doc.git
git fetch origin main --depth=1
git diff --quiet origin/main HEAD -- ../docusaurus/ ../gendoc.sh
