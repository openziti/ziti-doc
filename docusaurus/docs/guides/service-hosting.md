---
title: Service Hosting
sidebar_label: Service Hosting
sidebar_position: 10
---

# Service Hosting

## Overview

This guide walks through a variety of ways that services can be hosted, with examples. This guide
assumes knowledge of:

* [Services and terminators](../learn/core-concepts/services/overview.mdx)
* [Policies](../learn/core-concepts/security/authorization/policies/overview.mdx)

## Edge Router Tunneler Hosting

### Single Application Endpoint

Hosting services with the edge router tunneler combination requires a service configuration. The
initial setup will be simple, with one service endpoint. Following examples will build up from
there.

The example application server is going to be on a local subnet at IP 192.168.3.136, port 8080. For
the `test` service, create an initial service configuration using the CLI as follows:

```
ziti edge create config test-host-config host.v2 '
{
    "terminators" : [
        {
            "address": "192.168.3.136",
            "port" : 8080,
            "protocol": "tcp"
        },
    ]
}
'

ziti edge create service test -c test-host-config --terminator-strategy smartrouting

ziti edge create edge-router edge-router-1 --tunneler-enabled
ziti edge create edge-router edge-router-2 --tunneler-enabled

# skipping router enrollment steps

ziti edge update identity edge-router-1 --role-attributes 'test-host'
ziti edge update identity edge-router-2 --role-attributes 'test-host'

ziti edge create service-edge-router-policy test-serp --service-roles '@test' --edge-router-roles '#all'
ziti edge create service-policy test-bind Bind --service-roles '@test' --identity-roles '#test-host'
```

This will provide basic access to the service with one or many edge routers. All edge routers are
hitting the same endpoint, so they don't need any customized configurations. Each edge router
hosting the service will create a terminator for the service and traffic will get load-balanced
across them.

### Setting Per-Identity Precedence and Cost

Cost and precedence can be used to give preference to specific identities. For example, given two
edge routers,
`edge-router-1` and `edge-router-2`, all traffic can be sent to `edge-router-1` while it's online
and available by using the `--service-precedences` flag of the `ziti edge update identity` command:

```
ziti edge update identity edge-router-1 --service-precedences test=required
```

Giving the terminator on `edge-router-2` a higher cost, so it gets used less often, can be done with
the
`--service-costs` flag:

```
ziti edge update identity edge-router-2 --service-costs test=100
```

The default cost and precedence for an identity can also be set.

```
ziti edge update identity edge-router-1 --default-hosting-precedence required --default-hosting-cost 100
```

#### Multiple Application Endpoints

Hosting configurations can support multiple application server endpoints. If a second endpoint is
added to the example configuration, traffic will be load balanced across the endpoints based on
their precedence and cost. Since in this case they have the same precedence and cost, traffic should
be routed fairly evenly across the two of them.

```
ziti edge update config test-host-config host.v2 --data '
{
    "terminators" : [
        {
            "address": "192.168.3.136",
            "port" : 8080,
            "protocol": "tcp"
        },
        {
            "address": "192.168.3.137",
            "port" : 8080,
            "protocol": "tcp"
        }
    ]
}
'
```

Now each edge router will create two terminators, one for each endpoint, for a total of four
terminators. When multiple endpoints exist, it is important to know if each endpoint is healthy, so
that traffic is routed to only to healthy endpoints. This is accomplished by adding health checks to
the configuration.

```
ziti edge update config test-host-config host.v2 --data '
{
    "terminators" : [
        {
            "address": "192.168.3.136",
            "port" : 8080,
            "protocol": "tcp",
            "portChecks" : [
                {
                    "address" : "192.168.3.136:8080",
                    "interval" : "5s",
                    "timeout" : "100ms",
                    "actions" : [
                        {
                            "trigger" : "fail",
                            "consecutiveEvents" : 3,
                            "action" : "mark unhealthy"
                        },
                        {
                            "trigger" : "pass",
                            "consecutiveEvents" : 3,
                            "action" : "mark healthy"
                        }
                ]
            }
            ]
        },
        {
            "address": "192.168.3.137",
            "port" : 8080,
            "protocol": "tcp",
            "portChecks" : [
                {
                    "address" : "192.168.3.137:8080",
                    "interval" : "5s",
                    "timeout" : "100ms",
                    "actions" : [
                        {
                            "trigger" : "fail",
                            "consecutiveEvents" : 3,
                            "action" : "mark unhealthy"
                        },
                        {
                            "trigger" : "pass",
                            "consecutiveEvents" : 3,
                            "action" : "mark healthy"
                        }
                    ]
                }
            ]
        }
    ]
}
'
```

The application servers will now be pinged every five seconds. If a the health check fails three
times in a row, the associated terminator will be marked unhealthy, which means its precedence will
be set to `failed`. If subsequently the health check passes three times in a row, its precedence
will be reset to its original value.

This example uses simple port checks, but http checks are also supported. The checks are
per-terminator, so if the network fails between `edge-router-1` and the first application endpoint,
that terminator will be marked as failed. However, if `edge-router-2` can still reach it, then that
terminator will remain in `default` or `required`, depending on how it's configured.

This configuration now has multiple edge routers and multiple application endpoints, removing all
single points of failures. This setup should work well for applications which are horizontally
scalable.

#### Active/Passive Fail-over

Configurations for environments with primary and fail-over instances are also supported. These can
be configured by setting the precedence in the config, rather than on the identity, as follows:

```
ziti edge update config test-host-config host.v2 --data '
{
    "terminators" : [
        {
            "address": "192.168.3.136",
            "port" : 8080,
            "protocol": "tcp",
            "portChecks" : [ "health check definitions not shown for brevity" ],
            "listenOptions" : {
                "precedence" : "required"
            }
        },
        {
            "address": "192.168.3.137",
            "port" : 8080,
            "protocol": "tcp",
            "portChecks" : [ "health check definitions not shown for brevity" ],
            "listenOptions" : {
                "precedence" : "default"
            }
        }
    ]
}
'
```

This example doesn't show the health checks in this example in order to highlight the important
change, namely the addition of the `listenOptions` section. The first terminator is set
to `required` and the second is set to `default`. Should the health check for the primary endpoint
fail, the terminator precedence will be dropped to `failed` and new traffic will start flowing to
the fail-over server. Should the primary recover, the health check will detect this and the
precedence will be reset to `required`.

Note that in addition to precedence, cost may also be set in the `listenOptions`.

### Standalone Tunneler Hosting

Most of the above applies to standalone tunnelers as well. The primary difference is in placement.
Generally a tunneler will be running on the same machine as the application server. This means that
there would be two tunnelers running, one on each of the hosts. The configuration could then
reference `localhost`, with only a single terminator in the host config. The configuration would
look something like the following:

:::note

Not all tunneler implementations have support for the full `host.v1` and `host.v2` configs. The Go
based tunneler, which is included in the edge router, has full support. Support in tunnelers for
other languages may be partial, or non-existent.
:::

```
ziti edge update config test-host-config host.v2 --data '
{
    "terminators" : [
        {
            "address": "localhost",
            "port" : 8080,
            "protocol": "tcp",
            "portChecks" : [
                {
                    "address" : "localhost:8080",
                    "interval" : "5s",
                    "timeout" : "100ms",
                    "actions" : [
                        {
                            "trigger" : "fail",
                            "consecutiveEvents" : 3,
                            "action" : "mark unhealthy"
                        },
                        {
                            "trigger" : "pass",
                            "consecutiveEvents" : 3,
                            "action" : "mark healthy"
                        }
                    ]
                }
            ]
        }
    ]
}
'
```

For fail-over setups, the precedence would be set on the identity, rather than in the configuration.

### SDK Hosted

SDK hosted applications do not require any configs. When they bind a service, a terminator is
created on their behalf. The SDKs have controls allowing cost and precedence to be set from the
hosting application. Finally, the connection to the edge router acts as a built-in health check. If
the SDK loses its connection to the edge router, the edge router will remove any associated
terminators. When the SDK reconnects, it will re-bind and a new terminator will be established.

### Other Health Check Options

If the health checks provided by `host.v2` configs are not adequate, there are a few options.

1. A custom proxy using one of the SDKs. This allows adjusting cost and precedence based on
   arbitrarily complex custom health checks.
2. A sidecar which runs the health checks and translates those into an HTTP health check that the
   tunnelers can understand.
