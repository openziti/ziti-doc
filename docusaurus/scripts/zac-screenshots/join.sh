#!/usr/bin/env bash
# join.sh <user> [token|none]: add by URL with ziti-edge-tunnel, sign in to Keycloak with curl.
# token: enroll --enroll-to token starts the IdP flow itself.
# none: enroll only saves a bootstrap config, so run it with run-host and start the flow with ext-jwt-login (step 8).
set -uo pipefail
A=/work; mkdir -p "$A/users"; cd "$A"
# the SDK binds its OIDC callback to [::1] only; see bind6.c
[[ $(cat /proc/sys/net/ipv6/conf/lo/disable_ipv6) == 1 ]] && export LD_PRELOAD=/opt/ziti/lib/bind6.so
u=$1 mode=${2:-token}
CTRL=https://addbyurl.zititv.demo.openziti.org:9580
URL_RE="https://[^ '\"]*openid-connect/auth\?[^ '\"]*"
rm -f "users/$u.json"
if [[ $mode == none ]]; then
  timeout 20 ziti-edge-tunnel enroll --url "$CTRL" -i "users/$u.json" >"users/$u.log" 2>&1
  (setsid nohup ziti-edge-tunnel run-host -i "$A/users/$u.json" -P "$u" >"users/$u-run.log" 2>&1 &)
  sleep 4
  (timeout 90 ziti-edge-tunnel ext-jwt-login -P "$u" -i "$A/users/$u.json" -p acme-idp >"users/$u-login.log" 2>&1 &)
  LOG=users/$u-login.log
else
  (timeout 90 ziti-edge-tunnel enroll --url "$CTRL" --provider acme-idp \
    -i "users/$u.json" --enroll-to "$mode" >"users/$u.log" 2>&1 &)
  LOG=users/$u.log
fi
URL=
for _ in $(seq 1 30); do
  URL=$(grep -oP "$URL_RE" "$LOG" | head -1)
  [[ -n $URL ]] && break; sleep 1
done
[[ -n $URL ]] || { echo "join $u: no auth url" >&2; tail -5 "$LOG" >&2; exit 1; }
bash "$(dirname "$0")/kc-login.sh" "$URL" "$u" "$u-demo-pw" | head -1
if [[ $mode == none ]]; then
  for _ in $(seq 1 30); do grep -q "enroll_mode=none" "users/$u-run.log" && break; sleep 1; done
  grep -q "enroll_mode=none" "users/$u-run.log" || { echo "join $u: no enroll_mode=none" >&2; tail -5 "users/$u-run.log" >&2; exit 1; }
else
  for _ in $(seq 1 30); do [[ -s users/$u.json ]] && break; sleep 1; done
  [[ -s users/$u.json ]] || { echo "join $u: no identity file" >&2; tail -5 "$LOG" >&2; exit 1; }
fi
echo "join $u ($mode): ok"
