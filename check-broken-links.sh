#!/usr/bin/env bash

set -euo pipefail

[[ $# -eq 1 ]] || {
    echo "ERROR: need base URL to check as first param" >&2
    exit 1
} 

docker run --rm --network=host raviqqe/muffet  ${1} \
    --color=always \
    --exclude="https://(EXWPKK5PV4-dsn.algolia.net|www.googletagmanager.com|mermaid-js.github.io|mermaid.live|github.com/openziti/ziti-doc/blob/main/docusaurus/|play.google.com/store/apps/details\?id=io\.netfoundry\.ziti\.tunnel|openziti.github.io|github.com/openziti/ziti-doc/tree/main/docusaurus/)|#docusaurus_skipToContent_fallback$" 
