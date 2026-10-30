#!/usr/bin/env bash
# Runs inside the lab container. capture.ps1 calls it; see README.md.
#   lab.sh certs                    make a throwaway CA and a server cert for *.zititv.demo.openziti.org in /certs
#   lab.sh run <flow> light dark    build the network, then run the flow once per theme, saving shots to /out
#
# flows/<flow>/flow.sh sets the controller's names and defines:
#   pass      required; runs the flow once (THEME, SHOTS and CTRL_URL are set) and fails if the result is wrong
#   setup     optional; runs once after the network is up (extra servers the flow needs)
set -euo pipefail
D=zititv.demo.openziti.org
CTRL_PORT=9580 ROUTER_PORT=9590
A=/work
LAB=$(cd "$(dirname "$0")" && pwd)
# keep the logs of a failed run; capture.ps1 mounts .work/logs on /logs
trap '[[ -d /logs && -d $A ]] && cp -r "$A"/*.log "$A"/users /logs/ 2>/dev/null || true' EXIT

certs() {
  cd /certs
  openssl req -x509 -newkey rsa:2048 -nodes -days 2 -subj "/CN=zac-screenshots lab CA" \
    -keyout ca.key -out ca.pem 2>/dev/null
  openssl req -newkey rsa:2048 -nodes -subj "/CN=ctrl.$D" -keyout privkey.pem -out server.csr 2>/dev/null
  printf 'subjectAltName=DNS:*.%s\nextendedKeyUsage=serverAuth\n' "$D" > ext.cnf
  openssl x509 -req -in server.csr -CA ca.pem -CAkey ca.key -CAcreateserial -days 2 -extfile ext.cnf \
    -out server.pem 2>/dev/null
  cat server.pem ca.pem > fullchain.pem
  chmod 644 ./*.pem
  echo "certs: $(openssl x509 -in server.pem -noout -ext subjectAltName | tail -1 | xargs)"
}

# quickstart on CTRL_HOST (the private name), the lab certificate for PUBLIC_HOST as alt_server_certs, ZAC on /zac
network() {
  cp /certs/ca.pem /usr/local/share/ca-certificates/zac-screenshots.crt && update-ca-certificates >/dev/null
  mkdir -p "$A"
  ziti edge quickstart --configure-and-exit --home "$A/qs" --password admin-demo-pw \
    --ctrl-address "$CTRL_HOST" --ctrl-port "$CTRL_PORT" \
    --router-address "$ROUTER_HOST" --router-port "$ROUTER_PORT" >"$A/qs.log" 2>&1
  local ctrl=$A/qs/instance-1/ctrl.yaml
  # the wildcard serves OIDC only for names listed under allowedHostnames; ZAC signs in on the public name
  perl -0pi -e "
    s|^      #alt_server_certs:\n|      alt_server_certs:\n        - server_cert: \"/certs/fullchain.pem\"\n          server_key:  \"/certs/privkey.pem\"\n|m;
    s|^      #- binding: spa\n|      - binding: spa\n        options:\n          path: zac\n          location: /opt/ziti/zac\n          indexFile: index.html\n|m;
    s|(      - binding: edge-oidc\n(?:.*\n)*?)        options: \{ \}\n|\$1        options:\n          allowedHostnames:\n            - $PUBLIC_HOST\n|;
  " "$ctrl"
  grep -q "location: /opt/ziti/zac" "$ctrl" && grep -q "allowedHostnames" "$ctrl" && grep -q "^      alt_server_certs:" "$ctrl" \
    || { echo "ctrl.yaml edit failed" >&2; exit 1; }
  cd "$A"
  nohup ziti controller run qs/instance-1/ctrl.yaml >ctrl.log 2>&1 &
  nohup ziti router run qs/instance-1/router-instance-1.yaml >router.log 2>&1 &
  for _ in $(seq 1 60); do curl -sf "$CTRL_URL/edge/client/v1/version" >/dev/null && break; sleep 2; done
  curl -sf -o /dev/null "$CTRL_URL/zac/" || { tail -20 ctrl.log >&2; exit 1; }
  ziti edge login "localhost:$CTRL_PORT" -u admin -p admin-demo-pw -y >/dev/null
  # reads work before the cluster elects a leader; writes fail with CLUSTER_NO_LEADER until it does
  for _ in $(seq 1 60); do ziti edge create identity lab-ready >/dev/null 2>&1 && break; sleep 2; done
  ziti edge delete identity lab-ready >/dev/null || { tail -20 ctrl.log >&2; exit 1; }
  echo "network: controller, router and ZAC up on $CTRL_URL"
}

case ${1:-} in
certs) certs ;;
run)
  FLOW=${2:?usage: lab.sh run <flow> [light] [dark]}
  shift 2
  FLOW_DIR=$LAB/flows/$FLOW
  # shellcheck source=/dev/null
  source "$FLOW_DIR/flow.sh"
  export CTRL_URL=https://$PUBLIC_HOST:$CTRL_PORT SHOTS=/out
  network
  if declare -F setup >/dev/null; then setup; fi
  for t in "${@:-light}"; do
    export THEME=$t
    pass
    echo "pass $FLOW $t: done"
  done ;;
*) echo "usage: lab.sh certs | run <flow> [light] [dark]" >&2; exit 2 ;;
esac
