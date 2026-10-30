#!/usr/bin/env bash
# The CLI tabs of steps 2-5 and 9, as the pages show them. setup runs this once, so the CLI tabs are tested too and
# verify.sh has the CLI's configs to compare ZAC's against.
set -euo pipefail
cd /work

# step 2
ziti edge create identity dnslab-pihole \
  --role-attributes dnslab-hosts \
  -o dnslab-pihole.jwt

# step 3
ziti edge create config dnslab-dns-intercept intercept.v1 \
  '{
    "protocols": ["tcp", "udp"],
    "addresses": ["192.168.1.53"],
    "portRanges": [{"low": 53, "high": 53}]
  }'

ziti edge create config dnslab-dns-host host.v1 \
  '{
    "address": "127.0.0.1",
    "port": 53,
    "forwardProtocol": true,
    "allowedProtocols": ["tcp", "udp"]
  }'

ziti edge create service dnslab-dns \
  --configs dnslab-dns-intercept,dnslab-dns-host \
  --role-attributes dnslab-dns

# step 4
ziti edge create service-policy dnslab-dns-bind Bind \
  --service-roles '#dnslab-dns' \
  --identity-roles '#dnslab-hosts'

ziti edge create service-policy dnslab-dns-dial Dial \
  --service-roles '#dnslab-dns' \
  --identity-roles '#dnslab-clients'

# step 5
for c in win linux android; do
  ziti edge create identity "dnslab-client-$c" \
    --role-attributes dnslab-clients \
    -o "dnslab-client-$c.jwt"
done

# step 9
ziti edge create config dnslab-web-intercept intercept.v1 \
  '{
    "protocols": ["tcp"],
    "addresses": ["*.home.lan"],
    "portRanges": [{"low": 8443, "high": 8443}]
  }'

ziti edge create config dnslab-web-host host.v1 \
  '{
    "protocol": "tcp",
    "forwardAddress": true,
    "allowedAddresses": ["*.home.lan"],
    "forwardPort": true,
    "allowedPortRanges": [{"low": 8443, "high": 8443}]
  }'

ziti edge create service dnslab-web \
  --configs dnslab-web-intercept,dnslab-web-host \
  --role-attributes dnslab-web

ziti edge create service-policy dnslab-web-bind Bind \
  --service-roles '#dnslab-web' \
  --identity-roles '#dnslab-hosts'

ziti edge create service-policy dnslab-web-dial Dial \
  --service-roles '#dnslab-web' \
  --identity-roles '#dnslab-clients'
