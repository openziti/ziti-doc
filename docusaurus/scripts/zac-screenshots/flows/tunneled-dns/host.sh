#!/usr/bin/env bash
# Enrolls the dnslab-pihole JWT and runs it, so the services get terminators. Nothing listens behind them; the lab
# checks the overlay side only.
set -euo pipefail
cd /work
ziti-edge-tunnel enroll -j dnslab-pihole.jwt -i dnslab-pihole.json >host-enroll.log 2>&1
nohup ziti-edge-tunnel run-host -i dnslab-pihole.json >host.log 2>&1 &
