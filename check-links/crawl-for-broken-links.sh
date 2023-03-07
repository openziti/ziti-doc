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

EXCLUDE_PATTERN="https://("
while read -r; do
    EXCLUDE_PATTERN+="${REPLY}|"
done< <(cat <<EOF
EXWPKK5PV4-dsn.algolia.net
www.google.com/search
www.googletagmanager.com
mermaid-js.github.io
mermaid.live
mermaid.ink
play.google.com/
apps.apple.com/
www.reddit.com/r/openziti
github.com/.*/releases/latest/download/)
(#docusaurus_skipToContent_fallback|\.(ziti(k8s)?|svc)(/[^.]+)?)
EOF
)
EXCLUDE_PATTERN="${EXCLUDE_PATTERN%|}$"

case "$SERVER" in
    *)
        EXCLUDE="${EXCLUDE_PATTERN}"
    ;;
esac

docker run --rm --network=host raviqqe/muffet "${SERVER}" \
    --color=always \
    --buffer-size=8192 \
    --max-connections-per-host=5 \
    --header=User-Agent:curl/7.54.0 \
    --timeout=20 \
    --exclude="$EXCLUDE" \
    "${@}"
