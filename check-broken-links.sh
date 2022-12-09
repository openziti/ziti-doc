#!/usr/bin/env bash

set -euo pipefail

if [[ $# -eq 0 || $1 =~ -h|(--)?help ]]; then
    echo "ERROR: need URL to check as first param. Extra params are passed to muffet" >&2
    exit 1
else
    SERVER="$1"
    shift
fi

case "$SERVER" in
    https://openziti.github.io*)
        # ignore links that are known to be irrelevant or known issues
        EXCLUDE='https://(EXWPKK5PV4-dsn.algolia.net|www.googletagmanager.com|mermaid-js.github.io|mermaid.live|play.google.com/store/apps/details\?id=io\.netfoundry\.ziti\.tunnel)|#docusaurus_skipToContent_fallback$' \
    ;;
    *)
        # additionally ignore GitHub links if not testing GH Pages site
        EXCLUDE='https://(EXWPKK5PV4-dsn.algolia.net|www.googletagmanager.com|mermaid-js.github.io|mermaid.live|github.com/openziti/ziti-doc/blob/main/docusaurus/|play.google.com/store/apps/details\?id=io\.netfoundry\.ziti\.tunnel|openziti.github.io|github.com/openziti/ziti-doc/tree/main/docusaurus/)|#docusaurus_skipToContent_fallback$' \
    ;;
esac

docker run --rm --network=host raviqqe/muffet "${SERVER}" \
    --color=always \
    --exclude="$EXCLUDE" \
    "${@}"
