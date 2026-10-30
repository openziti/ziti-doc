#!/usr/bin/env bash
# The tunneled-dns lab (docs/how-to-guides/tunneled-dns). lab.sh sources this; see lab.sh for the contract.
# Only the controller side of steps 2-5 and 9 runs here; the Pi-hole, the clients and their DNS are not part of it.
PUBLIC_HOST=tdns.$D CTRL_HOST=tdns-ctrl.$D ROUTER_HOST=tdns-router.$D

# the CLI tabs, once, so verify.sh can compare ZAC's configs with theirs
setup() {
  bash "$FLOW_DIR/cli.sh"
  bash "$FLOW_DIR/host.sh"
  bash "$FLOW_DIR/verify.sh" cli
}

pass() {
  bash "$FLOW_DIR/reset.sh"
  node "$LAB/run.mjs" tunneled-dns 02-dns-server-identity 03-dns-service 04-policies 05-client 09-wildcard-web
  bash "$FLOW_DIR/host.sh"
  bash "$FLOW_DIR/verify.sh" zac
}
