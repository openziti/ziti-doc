---
---
# Create your first service

You have an overlay running from the [quickstart](../index.mdx). Now let's secure something with it. Rather than stand up
a new server, we'll put a zero trust service in front of something already running on your quickstart machine: the
controller's own REST API on `127.0.0.1:1280`. By the end you will reach that API through the overlay, with no port
exposed to the network.

The quickstart's router runs on the same machine as the controller, so it can host the service and offload traffic to
`127.0.0.1:1280` for you. You only need to bring one more thing: a tunneler on whatever machine you want to reach the
service from.

## Prerequisites

- A running overlay from the [quickstart](../index.mdx).
- A tunneler installed on the client machine. The router hosts the service, but to consume it you need a tunneler to
  intercept the service address and put that traffic onto the overlay. Follow
  [install a tunneler](../../how-to-guides/tunnelers/index.mdx) if you do not have one yet.

## 1. Log in

Point the CLI at your controller. Use the password you set with `--password`, or `admin` if you kept the default.

```bash
ziti login localhost:1280 --username admin --password admin
```

## 2. Describe the service

A service is made of two configs. The `intercept.v1` config tells the client-side tunneler which address to catch and
put onto the overlay. The `host.v1` config tells the hosting side where to send that traffic when it comes back off the
overlay, which here is the controller's API on `127.0.0.1:1280`.

```bash
# what the client tunneler intercepts
ziti create config first-service.intercept.v1 intercept.v1 \
  '{"protocols":["tcp"],"addresses":["first-service.ziti"],"portRanges":[{"low":1280,"high":1280}]}'

# where the host offloads to
ziti create config first-service.host.v1 host.v1 \
  '{"protocol":"tcp","address":"127.0.0.1","port":1280}'

# tie the two configs together into a service
ziti create service first-service --configs first-service.intercept.v1,first-service.host.v1
```

## 3. Let the router host it

Authorize the quickstart router to bind (host) the service. The router named `router-quickstart` already runs with
tunneling enabled, so this is all it takes to have it offload to the controller.

```bash
ziti create service-policy first-service.bind Bind \
  --service-roles "@first-service" \
  --identity-roles "@router-quickstart"
```

The quickstart already created the edge-router policies that let identities and services use that router, so there is
nothing else to wire up on the routing side.

## 4. Create a client identity and let it dial

Create an identity for your client and give it a role attribute, then authorize identities with that attribute to dial
the service.

```bash
# create the identity and write its enrollment token to a file
ziti create identity my-first-client -a first-service-clients -o my-first-client.jwt

# authorize the client to dial the service
ziti create service-policy first-service.dial Dial \
  --service-roles "@first-service" \
  --identity-roles "#first-service-clients"
```

## 5. Enroll the identity in your tunneler

Add `my-first-client.jwt` to the tunneler you installed. Each tunneler enrolls a little differently, so follow
[the tunneler guide for your platform](../../how-to-guides/tunnelers/index.mdx). Enrollment consumes the token and
leaves the tunneler holding a permanent identity for the overlay.

## 6. Reach the service

With the tunneler running and the identity enrolled, `first-service.ziti` now resolves on the overlay. Ask the
controller's API for its version through it:

```bash
curl -k https://first-service.ziti:1280/edge/client/v1/version
```

You should get a JSON response from the controller. The `-k` flag is there because the controller presents its own
certificate, which is issued for its real address rather than for `first-service.ziti`.

That traffic never touched an exposed port. The client tunneler caught `first-service.ziti`, carried it across the
overlay, and the router offloaded it to `127.0.0.1:1280`. Anything you can reach on a host running a tunneler or router
can be served this same way, whether it is an API, a database, SSH, or an internal web app.

## Manage it in the console

If you ran the quickstart with `--zac`, open `https://localhost:1280/zac/` to see the configs, service, identity, and
policies you just created, and to manage them from a UI.
