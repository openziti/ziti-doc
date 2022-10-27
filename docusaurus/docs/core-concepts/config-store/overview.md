# Service Configurations

Ziti Service Configurations, henceforth "Configs", may be associated with a service to provide metadata for the application that is being delivered by that service.

Configs are created and updated through the edge-management API and consumed by Edge SDKs through the edge-client API. Configs and Config Types are Ziti entities. Each Config is an instance of a Config Type.

## Overview

The configuration store has several components:

1. **Config Types**
    1. Config Types define a type of Config, including an optional JSON schema that the configuration data must conform to.
    1. Config Types have the following properties:
        1. A Config Type name
        1. An optional JSON schema to validate configurations of the type
        1. Standard edge entity properties: id, tags, createdAt, updatedAt
1. **Configs**
    1. Configs have the following properties:
        1. A Config name
        1. The configuration data, which is arbitrary JSON data, so long as it conforms to the type schema (if specified)
        1. Standard edge entity properties: id, tags, createdAt, updatedAt
1. **Services**
    1. Each service can be linked to multiple Configs. Services can have one linked Config for each Config Type.
1. **Identities**
    1. An identity may have a Config specified for a given service and Config. This will override the service's linked Configs.

This configuration model has the following properties:

* Different applications can have their own Configs for the same service
* Applications can have multiple Config Types for themselves where it makes sense
* There are tunneler Config Types for intercept (client) side and hosting (server) side
* Since an application can support multiple Config Types, applications can version their Config Types as their needs change

## Tunneler Config Types

The Ziti tunnelers are themselves SDK applications and so they serve as an example of how configuration data can be used.

* Tunnelers need to know what ip/dns and port(s) to intercept for services they are proxying on the intercept (client) side
* Tunnelers need to know where to forward to destination servers on the hosting (server) side

Ziti provides a handful of tunneler Config Types.

The most relevant Config Types:

* [`intercept.v1`](./tunneler-config-type-intercept.v1.md): used by a tunneler to configure itself as a proxy for a particular service
* [`host.v1`](./tunneler-config-type-host.v1.md): describes the destination server for a Ziti service hosted by a tunneler

Other Config Types:

* `host.v2`: an array of `host.v1` Configs
* `ziti-tunneler-client.v1`: predecessor of `intercept.v1`
* `ziti-tunneler-server.v1`: predecessor of `host.v1`

The tunneler Config Types' schemas are maintained [in GitHub](https://github.com/openziti/edge/tree/main/tunnel/entities).
