#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail
set -o xtrace

if [[ $# -eq 0 || $1 =~ -h|(--)?help ]]; then
    echo "ERROR: need URL to check as first param. Extra params are ignored" >&2
    exit 1
else
    SERVER="$1"
    shift
fi

echo "Link to check: ${SERVER}"

# see root checkout, linkinator.config.json for linkinator config
CMD="npm install -g linkinator && linkinator \"${SERVER}\"; exit \$?"
docker run --rm -t --name linkinator -v $PWD/linkinator.config.json:/linkinator.config.json node:22-slim bash -c "$CMD"
