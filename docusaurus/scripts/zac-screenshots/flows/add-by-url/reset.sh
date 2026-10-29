#!/usr/bin/env bash
# Puts the network back to the end of step 2: no signer, policies, services or lab identities.
set -uo pipefail
A=/work
pkill -f "[z]iti-edge-tunnel run-host" 2>/dev/null
for p in acme-host-bind engineering-dial hr-dial; do ziti edge delete service-policy "$p"; done
for s in eng-wiki hr-portal; do
  ziti edge delete service "$s"; ziti edge delete config "$s.intercept"; ziti edge delete config "$s.host"
done
for i in acme-host alice bob carol; do ziti edge delete identity "$i"; done
# the signer and the auth policy reference each other; point the signer at default first
ziti edge update ext-jwt-signer acme-idp --enroll-auth-policy default 2>/dev/null
ziti edge delete auth-policy acme-users
ziti edge delete ext-jwt-signer acme-idp
rm -rf "$A/users" "$A/acme-host.json" "$A/acme-host.jwt"
exit 0
