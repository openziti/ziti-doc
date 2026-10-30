#!/usr/bin/env bash
# Deletes everything steps 2-5 and 9 create.
set -uo pipefail
pkill -f "[z]iti-edge-tunnel run-host" 2>/dev/null
for p in dnslab-dns-bind dnslab-dns-dial dnslab-web-bind dnslab-web-dial; do ziti edge delete service-policy "$p"; done
for s in dnslab-dns dnslab-web; do
  ziti edge delete service "$s"; ziti edge delete config "$s-intercept"; ziti edge delete config "$s-host"
done
for i in dnslab-pihole dnslab-client-win dnslab-client-linux dnslab-client-android; do ziti edge delete identity "$i"; done
rm -f /work/dnslab-*.jwt /work/dnslab-*.json
exit 0
