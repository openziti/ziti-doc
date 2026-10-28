---
sidebar_label: 4. Services
---

# Step 4: Host the services

The lab needs one service for each IdP group, so step 6 can show that `alice` reaches only the Engineering Wiki and
`bob` reaches only the Finance Ledger.

The lab serves both services from one machine: one web page, run in two nginx containers. The page reads the
intercept hostname and shows the Engineering Wiki or the Finance Ledger.

```text
mkdir -p pages
curl -sSL \
  -o pages/index.html \
  https://openziti.io/docs/add-by-url/acme-pages/index.html

docker run \
  --detach \
  --name acme-eng-wiki \
  --publish 127.0.0.1:9781:80 \
  --volume "$PWD/pages:/usr/share/nginx/html:ro" \
  nginx:alpine

docker run \
  --detach \
  --name acme-finance-ledger \
  --publish 127.0.0.1:9782:80 \
  --volume "$PWD/pages:/usr/share/nginx/html:ro" \
  nginx:alpine
```

Create the `eng-wiki` service:

```text
ziti edge create config eng-wiki.intercept intercept.v1 \
  '{
    "protocols": ["tcp"],
    "addresses": ["eng-wiki.acme.ziti"],
    "portRanges": [{"low": 80, "high": 80}]
  }'

ziti edge create config eng-wiki.host host.v1 \
  '{
    "protocol": "tcp",
    "address": "127.0.0.1",
    "port": 9781
  }'

ziti edge create service eng-wiki \
  --configs eng-wiki.intercept,eng-wiki.host
```

Create the `finance-ledger` service:

```text
ziti edge create config finance-ledger.intercept intercept.v1 \
  '{
    "protocols": ["tcp"],
    "addresses": ["finance-ledger.acme.ziti"],
    "portRanges": [{"low": 80, "high": 80}]
  }'

ziti edge create config finance-ledger.host host.v1 \
  '{
    "protocol": "tcp",
    "address": "127.0.0.1",
    "port": 9782
  }'

ziti edge create service finance-ledger \
  --configs finance-ledger.intercept,finance-ledger.host
```

Create a host identity, and a Bind policy that lets it host both services:

```text
ziti edge create identity acme-host \
  --role-attributes host \
  -o acme-host.jwt

ziti edge create service-policy acme-host-bind Bind \
  --identity-roles '#host' \
  --service-roles '@eng-wiki,@finance-ledger'
```

Enroll the host identity and run it on the same machine:

```text
ziti-edge-tunnel enroll \
  -j acme-host.jwt \
  -i acme-host.json

ziti-edge-tunnel run-host \
  -i acme-host.json
```

## Done when

- `ziti edge list services` shows `eng-wiki` and `finance-ledger`
- `ziti edge list terminators` shows one terminator for each service
