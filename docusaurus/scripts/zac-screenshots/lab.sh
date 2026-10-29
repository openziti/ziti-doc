#!/usr/bin/env bash
# Runs inside the lab container. capture.ps1 calls it; see README.md.
#   lab.sh certs              make a throwaway CA and a server cert for the lab names in /certs
#   lab.sh run light dark     build the network, then do steps 3-8 through ZAC once per theme, saving shots to /out
set -euo pipefail
D=zititv.demo.openziti.org
CTRL_PORT=9580 ROUTER_PORT=9590
A=/work
LAB=$(cd "$(dirname "$0")" && pwd)
# keep the logs of a failed run; capture.ps1 mounts .work/logs on /logs
trap '[[ -d /logs && -d $A ]] && cp -r "$A"/*.log "$A"/users /logs/ 2>/dev/null' EXIT

certs() {
  cd /certs
  openssl req -x509 -newkey rsa:2048 -nodes -days 2 -subj "/CN=zac-screenshots lab CA" \
    -keyout ca.key -out ca.pem 2>/dev/null
  openssl req -newkey rsa:2048 -nodes -subj "/CN=addbyurl.$D" -keyout privkey.pem -out server.csr 2>/dev/null
  printf 'subjectAltName=DNS:*.%s\nextendedKeyUsage=serverAuth\n' "$D" > ext.cnf
  openssl x509 -req -in server.csr -CA ca.pem -CAkey ca.key -CAcreateserial -days 2 -extfile ext.cnf \
    -out server.pem 2>/dev/null
  cat server.pem ca.pem > fullchain.pem
  chmod 644 ./*.pem
  echo "certs: $(openssl x509 -in server.pem -noout -ext subjectAltName | tail -1 | xargs)"
}

# step 1: quickstart on the private name, the public certificate as alt_server_certs, ZAC on /zac
network() {
  cp /certs/ca.pem /usr/local/share/ca-certificates/zac-screenshots.crt && update-ca-certificates >/dev/null
  mkdir -p "$A"
  ziti edge quickstart --configure-and-exit --home "$A/qs" --password admin-demo-pw \
    --ctrl-address "addbyurl-ctrl.$D" --ctrl-port "$CTRL_PORT" \
    --router-address "addbyurl-router.$D" --router-port "$ROUTER_PORT" >"$A/qs.log" 2>&1
  local ctrl=$A/qs/instance-1/ctrl.yaml
  # the wildcard serves OIDC only for names listed under allowedHostnames; ZAC signs in on the public name
  perl -0pi -e "
    s|^      #alt_server_certs:\n|      alt_server_certs:\n        - server_cert: \"/certs/fullchain.pem\"\n          server_key:  \"/certs/privkey.pem\"\n|m;
    s|^      #- binding: spa\n|      - binding: spa\n        options:\n          path: zac\n          location: /opt/ziti/zac\n          indexFile: index.html\n|m;
    s|(      - binding: edge-oidc\n(?:.*\n)*?)        options: \{ \}\n|\$1        options:\n          allowedHostnames:\n            - addbyurl.$D\n|;
  " "$ctrl"
  grep -q "location: /opt/ziti/zac" "$ctrl" && grep -q "allowedHostnames" "$ctrl" && grep -q "^      alt_server_certs:" "$ctrl" \
    || { echo "ctrl.yaml edit failed" >&2; exit 1; }
  cd "$A"
  nohup ziti controller run qs/instance-1/ctrl.yaml >ctrl.log 2>&1 &
  nohup ziti router run qs/instance-1/router-instance-1.yaml >router.log 2>&1 &
  for _ in $(seq 1 60); do curl -sf "https://addbyurl.$D:$CTRL_PORT/edge/client/v1/version" >/dev/null && break; sleep 2; done
  curl -sf -o /dev/null "https://addbyurl.$D:$CTRL_PORT/zac/" || { tail -20 ctrl.log >&2; exit 1; }
  ziti edge login "localhost:$CTRL_PORT" -u admin -p admin-demo-pw -y >/dev/null

  # step 4, the nginx half: the two services on 127.0.0.1:9781 and :9782
  cat >/etc/nginx/conf.d/lab.conf <<EOF
server { listen 127.0.0.1:9781; root $LAB/pages; location / { try_files /eng-wiki.html =404; } }
server { listen 127.0.0.1:9782; root $LAB/pages; location / { try_files /hr-portal.html =404; } }
EOF
  nginx
  echo "network: controller, router, ZAC and services up"
}

pass() {
  local theme=$1
  export THEME=$theme SHOTS=/out HOST_JWT=$A/acme-host.jwt
  bash "$LAB/reset.sh"
  node "$LAB/capture.mjs" build
  bash "$LAB/host.sh"
  bash "$LAB/join.sh" alice token
  bash "$LAB/join.sh" bob token
  node "$LAB/capture.mjs" identities
  node "$LAB/capture.mjs" carol
  bash "$LAB/join.sh" carol none
  bash "$LAB/verify.sh"
  echo "pass $theme: done"
}

case ${1:-} in
certs) certs ;;
run)
  shift
  network
  for t in "${@:-light}"; do pass "$t"; done ;;
*) echo "usage: lab.sh certs | run [light] [dark]" >&2; exit 2 ;;
esac
