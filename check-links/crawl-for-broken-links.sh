#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail
set -o xtrace

if [[ $# -eq 0 || $1 =~ -h|(--)?help ]]; then
    echo "ERROR: need URL to check as first param. Extra params are passed" >&2
    exit 1
else
    SERVER="$1"
    shift
fi

# ignores all http:// links because they're probably examples, not functioning links
# ignores https:// links matching EXCLUDE_PATTERN
EXCLUDE_PATTERN="(http://|https://("
while read -r; do
    EXCLUDE_PATTERN+="${REPLY}|"
done<<EOF
EXWPKK5PV4-dsn.algolia.net
www\.google\.com/search
www\.googletagmanager\.com
play\.google\.com
apps\.apple\.com
www\.reddit\.com/r/openziti
.*#(__)?docusaurus_skipToContent_fallback$
.*\.ziti
.*\.zitik8s
.*\.svc
.*\.internal
.*\.private
.*\.home
.*\.lan
twitter\.com/(OpenZiggy|OpenZiti)
x\.com/(OpenZiggy|OpenZiti)
landing.openziti.io/
fonts.gstatic.com/
github\.com/.*#
.*\.?example\.(com|net|org)
openziti.io(/comments)?/feed/
developer.chrome.com/origintrials/#/register_trial/.*
entra\.microsoft\.com
github\.com/openziti/ziti-tunnel-sdk-c%3E
example.*openziti\.io
my.identity.provider.*
your.openziti.controller.example.io.*
trial-z520298.okta.com.*
dev-k1gpd4wpyslypklr.us.auth0.com.*
authelia.doc.demo.openziti.org.*
authentik.doc.demo.openziti.org.*
dex.doc.demo.openziti.org.*
cognito-idp.us-east-2.amazonaws.com.*
.*23f45e36-2ae6-4434-b116-25c66c27168d.*
EOF

# drop the trailing pipe
EXCLUDE_PATTERN="${EXCLUDE_PATTERN%|}))"

CMD="npm install -g linkinator && linkinator \"${SERVER}\" --skip \"${EXCLUDE_PATTERN}\" $*"
docker run --rm -t --name linkinator node:18-alpine sh -c "$CMD"
