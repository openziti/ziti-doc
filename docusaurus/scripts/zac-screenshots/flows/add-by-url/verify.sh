#!/usr/bin/env bash
# Fails unless alice, bob and carol can each dial a service and the host identity has terminators.
set -euo pipefail
ziti edge list identities
for u in alice bob carol; do
  ziti edge policy-advisor identities -q "$u" | grep -q OKAY || { echo "verify: $u has no OKAY service" >&2; exit 1; }
done
for _ in $(seq 1 30); do [[ $(ziti edge list terminators 'limit 5' | grep -c router-instance-1) -ge 2 ]] && break; sleep 1; done
[[ $(ziti edge list terminators 'limit 5' | grep -c router-instance-1) -ge 2 ]] || { echo "verify: no terminators" >&2; exit 1; }
echo "verify: alice, bob, carol OKAY; both services hosted"
