---
sidebar_label: 4. Services
---

# Step 4: Host the services

![The services on the controller highlighted, one for each IdP group.](/img/add-by-url/step-04-services.svg)

The lab needs one service for each IdP group, so step 6 can show that `alice` reaches only the Engineering Wiki and
`bob` reaches only the HR Portal.

The lab serves both services from one machine, each from its own nginx container with its own page. Each page names
the container that serves it, so a request routed to the wrong container shows the wrong page.

Save these two pages in the current directory:

- [`eng-wiki.html`](pathname:///add-by-url/acme-pages/eng-wiki.html)
- [`hr-portal.html`](pathname:///add-by-url/acme-pages/hr-portal.html)

Then start the two containers:

```text
docker run \
  --detach \
  --name acme-eng-wiki \
  --publish 127.0.0.1:9781:80 \
  --volume "$PWD/eng-wiki.html:/usr/share/nginx/html/index.html:ro" \
  nginx:alpine

docker run \
  --detach \
  --name acme-hr-portal \
  --publish 127.0.0.1:9782:80 \
  --volume "$PWD/hr-portal.html:/usr/share/nginx/html/index.html:ro" \
  nginx:alpine
```

Before going on, check that each port serves its own page:

```text
curl -s http://127.0.0.1:9781 | grep 'served by'
curl -s http://127.0.0.1:9782 | grep 'served by'
```

The first line contains `served by acme-eng-wiki`, the second `served by acme-hr-portal`.

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

Create the `hr-portal` service:

```text
ziti edge create config hr-portal.intercept intercept.v1 \
  '{
    "protocols": ["tcp"],
    "addresses": ["hr-portal.acme.ziti"],
    "portRanges": [{"low": 80, "high": 80}]
  }'

ziti edge create config hr-portal.host host.v1 \
  '{
    "protocol": "tcp",
    "address": "127.0.0.1",
    "port": 9782
  }'

ziti edge create service hr-portal \
  --configs hr-portal.intercept,hr-portal.host
```

Create a host identity, and a Bind policy that lets it host both services:

```text
ziti edge create identity acme-host \
  --role-attributes host \
  -o acme-host.jwt

ziti edge create service-policy acme-host-bind Bind \
  --identity-roles '#host' \
  --service-roles '@eng-wiki,@hr-portal'
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

- `ziti edge list services` shows `eng-wiki` and `hr-portal`
- `ziti edge list terminators` shows one terminator for each service
