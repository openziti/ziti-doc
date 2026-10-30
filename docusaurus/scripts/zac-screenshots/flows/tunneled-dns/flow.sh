#!/usr/bin/env bash
# The tunneled-dns lab (docs/how-to-guides/tunneled-dns). lab.sh sources this; see lab.sh for the contract.
# Only the controller side of steps 2-5 and 9 runs here; the Pi-hole, the clients and their DNS are not part of it.
PUBLIC_HOST=tdns.$D CTRL_HOST=tdns-ctrl.$D ROUTER_HOST=tdns-router.$D
# each page's ZAC module has the page's name
PAGES=(02-dns-server-identity 03-dns-service 04-policies 05-client 09-wildcard-web)

# the pages' CLI tabs, once, so verify.sh can compare ZAC's configs with theirs
setup() {
  local p mdx=()
  for p in "${PAGES[@]}"; do mdx+=("$DOCS/how-to-guides/tunneled-dns/$p.mdx"); done
  doc_cli "${mdx[@]}" >"$A/cli.sh"
  grep -q 'ziti edge create' "$A/cli.sh" || { echo "no CLI tabs found in the tunneled-dns pages" >&2; exit 1; }
  cat "$A/cli.sh"
  (cd "$A" && bash -euo pipefail cli.sh)
  bash "$FLOW_DIR/host.sh"
  bash "$FLOW_DIR/verify.sh" cli
}

pass() {
  bash "$FLOW_DIR/reset.sh"
  node "$LAB/run.mjs" tunneled-dns "${PAGES[@]}"
  bash "$FLOW_DIR/host.sh"
  bash "$FLOW_DIR/verify.sh" zac
}
