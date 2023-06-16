#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail
set -o xtrace

if [[ $# -eq 0 || $1 =~ -h|(--)?help ]]; then
    echo "ERROR: need URL to check as first param. Extra params are passed to muffet" >&2
    exit 1
else
    SERVER="$1"
    shift
fi

# ignore all http:// links and selected https:// links
EXCLUDE_PATTERN="(http://|https://("
while read -r; do
    EXCLUDE_PATTERN+="${REPLY}|"
done<<EOF
EXWPKK5PV4-dsn.algolia.net
www\.google\.com/search
www\.googletagmanager\.com
mermaid-js\.github.io
mermaid\.live
mermaid\.ink
play\.google\.com
apps\.apple\.com
www\.reddit\.com/r/openziti
.*#(__)?docusaurus_skipToContent_fallback$
.*\.ziti
.*\.zitik8s
.*\.svc
twitter\.com/(OpenZiggy|OpenZiti)
EOF
# github\.com/.*/releases/latest/download

EXCLUDE_PATTERN="${EXCLUDE_PATTERN%|}))"

docker run --rm --network=host raviqqe/muffet "${SERVER}" \
    --buffer-size=8192 \
    --max-connections-per-host=1 \
    --header=User-Agent:curl/7.54.0 \
    --timeout=20 \
    "--exclude=${EXCLUDE_PATTERN}" \
    "${@}"
