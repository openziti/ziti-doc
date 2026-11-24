# Service configurations

Ziti service configurations, henceforth "configs", may be associated with a service to provide metadata for the
application being delivered by that service.

Configs are created and updated through the edge-management API and consumed by edge SDKs through the edge-client
API. Configs and config types are OpenZiti entities. Each config is an instance of a config type.

## Overview

The configuration store has several components:

1. **Config types**
    1. Config types define a type of config, including an optional JSON schema that the configuration data must
       conform to.
    1. Config types have the following properties:
        1. A config type name
        1. An optional JSON schema to validate configurations of the type
        1. Standard edge entity properties: `id`, `tags`, `createdAt`, `updatedAt`
1. **Configs**
    1. Configs have the following properties:
        1. A config name
        1. The configuration data, which is arbitrary JSON data, so long as it conforms to the type schema (if
           specified)
        1. Standard edge entity properties: `id`, `tags`, `createdAt`, `updatedAt`
1. **Services**
    1. Each service can be linked to multiple configs. Services can have one linked config for each config type.
1. **Identities**
    1. An identity may have a config specified for a given service and config type. This will override the
       service's linked configs.

This configuration model has the following properties:

- Different applications can have their own configs for the same service.
- Applications can have multiple config types for themselves where it makes sense.
- There are tunneler config types for intercept (client) side and hosting (server) side.
- Since an application can support multiple config types, applications can version their config types as their
  needs change.

## Tunneler config types

The OpenZiti tunnelers are themselves SDK applications, so they serve as an example of how configuration data can be
used.

- Tunnelers need to know what IP/DNS name and port(s) to intercept for services they're proxying on the intercept
  (client) side.
- Tunnelers need to know where to forward to destination servers on the hosting (server) side.

OpenZiti provides a handful of tunneler config types.

The most relevant config types:

- [`intercept.v1`](./config-type-intercept-v1.md): used by a tunneler to configure itself as a proxy for a
  particular service
- [`host.v1`](./config-type-host-v1.md): describes the destination server for a Ziti service hosted by a tunneler

Other config types:

- `host.v2`: an array of `host.v1` configs
- `ziti-tunneler-client.v1`: predecessor of `intercept.v1`
- `ziti-tunneler-server.v1`: predecessor of `host.v1`

The tunneler config types' schemas are maintained
[in GitHub](https://github.com/openziti/ziti/blob/main/tunnel/entities/).
