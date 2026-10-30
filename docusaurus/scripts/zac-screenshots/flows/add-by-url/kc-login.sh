#!/usr/bin/env bash
# kc-login.sh <authorize-url> <user> <password>
# Completes a Keycloak browser sign-in with curl and follows the redirect to the tunneler's localhost:20314 callback.
set -euo pipefail
URL=$1 U=$2 P=$3
J=$(mktemp)
PAGE=$(curl -sk -c "$J" -b "$J" -L "$URL")
ACTION=$(printf '%s' "$PAGE" | grep -o 'action="[^"]*"' | head -1 | sed -e 's/^action="//' -e 's/"$//' -e 's/&amp;/\&/g')
[[ -n $ACTION ]] || { echo "no login form" >&2; printf '%s' "$PAGE" | head -c 400 >&2; exit 1; }
LOC=$(curl -sk -c "$J" -b "$J" -o /dev/null -w '%{redirect_url}' --data-urlencode "username=$U" \
  --data-urlencode "password=$P" --data-urlencode credentialId= "$ACTION")
echo "redirect: ${LOC%%\?*}"
[[ $LOC == http://localhost:20314/* ]] || { echo "unexpected redirect" >&2; exit 1; }
curl -s -m 20 "$LOC" | head -c 300; echo
rm -f "$J"
