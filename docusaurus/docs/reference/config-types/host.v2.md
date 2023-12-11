---
sidebar_label: host.v2
sidebar_position: 20
---

# The `host.v2` Config Type

The `host.v2` configuration type defines how edge routers or tunnelers can make outgoing connections
for associated services. The config type also allows specifying health checks for the service. An
endpoint in a `host.v2` config can be specified explicitly or can be configured to use information
passed through from a tunneler intercepting traffic, allowing it to forward traffic.

The `host.v2` type allows defining multiple host endpoints. If only a single endpoint is required,
consider using the simpler [`host.v1`](./host.v1.md) config type instead.

## Endpoint Configuration

Each config can define one or more endpoints. If a service is hosted by multiple servers, the
configuration can have an endpoint defined for each hosting server.

Each endpoint defined will result in a terminator for each router or tunneler hosting the
application.

A `host.v2` configuration only has one field.

* `terminators` - an array of [`host.v1`](./host.v1.md) entries, one per endpoint

**Example**

This service is hosted by two application servers.

```json
{
  "terminators": [
    {
      "address": "192.168.100.1",
      "port": 80,
      "protocol": "tcp"
    },
    {
      "address": "192.168.100.2",
      "port": 80,
      "protocol": "tcp"
    }
  ]
}
```

See the [`host.v1`](./host.v1.md) specification for what can be done with each entry.

