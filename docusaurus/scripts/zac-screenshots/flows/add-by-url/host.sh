#!/usr/bin/env bash
# Enrolls the acme-host JWT that ZAC downloaded and runs it.
set -euo pipefail
cd /work
ziti-edge-tunnel enroll -j acme-host.jwt -i acme-host.json >host-enroll.log 2>&1
nohup ziti-edge-tunnel run-host -i acme-host.json -P host >host.log 2>&1 &
