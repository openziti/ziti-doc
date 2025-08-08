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

# use this line to mount /tmp and send the output to json which is sometimes easier to parse
#CMD="npm install -g linkinator && linkinator \"${SERVER}\" --format JSON > /mount/out.json; exit \$?"
docker run --rm --name linkinator -v "/tmp:/mount" -v "$PWD/linkinator.config.json":/linkinator.config.json node:22-slim bash -cx "$CMD"

# leaving this jq in the file to work with the above format JSON output should it ever be useful
#jq -r '["status","state","parent","url"], (.links | sort_by(.status, .state, .parent, .url)[] | [.status, .state, .parent, .url]) | @csv' /tmp/out.json > /tmp/out.csv

