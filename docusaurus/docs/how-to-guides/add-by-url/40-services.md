---
sidebar_label: 4. Services
---

# Step 4: Host the services

The lab serves both services from one machine: one web page, run in two nginx containers. The page reads the
intercept hostname and shows the Engineering Wiki or the Finance Ledger.

```bash
mkdir -p pages
curl -sSLo pages/index.html https://openziti.io/docs/add-by-url/acme-pages/index.html

for svc in eng-wiki:9781 finance-ledger:9782; do
  name=${svc%%:*}; port=${svc##*:}
  docker run -d --name "acme-$name" -p "127.0.0.1:$port:80" -v "$PWD/pages:/usr/share/nginx/html:ro" nginx:alpine
done
```

Create a service for each page, and a host identity that binds both:

```bash
for svc in eng-wiki:9781 finance-ledger:9782; do
  name=${svc%%:*}; port=${svc##*:}
  ziti edge create config "$name.intercept" intercept.v1 \
    "{\"protocols\":[\"tcp\"],\"addresses\":[\"$name.acme.ziti\"],\"portRanges\":[{\"low\":80,\"high\":80}]}"
  ziti edge create config "$name.host" host.v1 \
    "{\"protocol\":\"tcp\",\"address\":\"127.0.0.1\",\"port\":$port}"
  ziti edge create service "$name" --configs "$name.intercept,$name.host"
done

ziti edge create identity acme-host --role-attributes host -o acme-host.jwt
ziti edge create service-policy acme-host-bind Bind \
  --identity-roles '#host' --service-roles '@eng-wiki,@finance-ledger'
```

Enroll the host identity and run it on the same machine:

```bash
ziti-edge-tunnel enroll -j acme-host.jwt -i acme-host.json
ziti-edge-tunnel run-host -i acme-host.json
```

## Done when

- `ziti edge list services` shows `eng-wiki` and `finance-ledger`
- `ziti edge list terminators` shows one terminator for each service
