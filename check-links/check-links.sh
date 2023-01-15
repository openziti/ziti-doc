#!/usr/bin/env bash

set -euo pipefail

[[ $# -eq 2 ]] || {
    echo "ERROR: need base URL to check as \$1 and links file (one URL path per line) as \$2" >&2
    exit 1
} 

[[ "$1" =~ ^https?:// ]] || {
    echo "ERROR: $1 does not look like an HTTP base URL, e.g. https://example.com" >&2
    exit 1
}

[[ -s "$2" ]] || {
    echo "ERROR: links file $2 is empty or doesn't exist" >&2
    exit 1
}

TOTAL=0
typeset -a SUCCESSES=() FAILURES=()
while read; do
    (( ++TOTAL ))
    if HTTP_CODE=$(curl -sfLw '%{http_code}' -o/dev/null "${1}${REPLY}" 2>/dev/null); then
        SUCCESSES+=("${HTTP_CODE} ${REPLY}")
    else
        FAILURES+=("${HTTP_CODE} ${REPLY}")
    fi
done < "${2}"

if ! (( ${#FAILURES[*]} )); then
    echo "INFO: all ${TOTAL} links succeeded!"
    exit 0
elif [[ ${TOTAL} -eq ${#FAILURES[*]} ]]; then
    echo "ERROR: all ${TOTAL} links failed" >&2
    exit 1
else
    echo "INFO: of ${TOTAL} links there were ${#SUCCESSES[*]} successes and ${#FAILURES[*]} failures."
    printf '\n.:: REPORT ::.\n'
    for i in "${SUCCESSES[@]}"; do printf '\t%d\t%s\n' ${i}; done | sort
    for i in "${FAILURES[@]}"; do printf '\t%d\t%s\n' ${i}; done | sort
    exit 1
fi
