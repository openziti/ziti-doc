#!/usr/bin/env bash
# The add-by-url lab (docs/how-to-guides/add-by-url). lab.sh sources this; see lab.sh for the contract.
# Steps 1 and 2 (network, Keycloak) are set up once; each pass redoes steps 3-8 and takes that page's shots.
PUBLIC_HOST=addbyurl.$D CTRL_HOST=addbyurl-ctrl.$D ROUTER_HOST=addbyurl-router.$D
export HOST_JWT=$A/acme-host.jwt

# step 4, the nginx half: the two services on 127.0.0.1:9781 and :9782
setup() {
  cat >/etc/nginx/conf.d/lab.conf <<NGINX
server { listen 127.0.0.1:9781; root $FLOW_DIR/pages; location / { try_files /eng-wiki.html =404; } }
server { listen 127.0.0.1:9782; root $FLOW_DIR/pages; location / { try_files /hr-portal.html =404; } }
NGINX
  nginx
}

pass() {
  bash "$FLOW_DIR/reset.sh"
  node "$LAB/run.mjs" add-by-url 30-ext-jwt-signer 40-services 50-policies
  bash "$FLOW_DIR/host.sh"
  bash "$FLOW_DIR/join.sh" alice token
  bash "$FLOW_DIR/join.sh" bob token
  node "$LAB/run.mjs" add-by-url 70-check-identities 80-map-existing-identities
  bash "$FLOW_DIR/join.sh" carol none
  bash "$FLOW_DIR/verify.sh"
}
