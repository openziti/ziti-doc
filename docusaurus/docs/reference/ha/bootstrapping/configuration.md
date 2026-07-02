---
sidebar_label: Configuration
sidebar_position: 30
---

# Controller configuration

### Config file

The controller requires a `cluster` section.

```yaml
cluster:
  dataDir: /path/to/data/dir
```

The `dataDir` will be used to store the following:

* `ctrl-ha.db` - the OpenZiti data model bbolt database
* `raft.db` - the Raft bbolt database
* `snapshots/` - a directory to store Raft snapshots

Controllers use the control channel listener to communicate with each other. Unlike
routers, they need to know how to reach each other, so an advertise address must
be configured.

```yaml
ctrl:
  listener: tls:0.0.0.0:1280
  options:
    advertiseAddress: tls:ctrl1.ziti.example.com:1280
```
 
Finally, cluster-capable SDK clients authenticate via OIDC, so the `edge-oidc` API
binding must be exposed on at least one web listener. As of recent controller
versions, **if you forget to add `edge-oidc` explicitly, the controller will
auto-bind it onto the edge-client listener and log a warning**, so a missing
binding is no longer a hard failure. Declaring it explicitly is still recommended
so the config matches what's actually running.

```yaml
web:
  - name: all-apis-localhost
    bindPoints:
      - interface: 0.0.0.0:1280
        address: ctrl1.ziti.example.com:1280
    options:
      minTLSVersion: TLS1.2
      maxTLSVersion: TLS1.3
    apis:
      - binding: health-checks
      - binding: fabric
      - binding: edge-management
      - binding: edge-client
      - binding: edge-oidc
```

If you want to opt out of the auto-binding (e.g., to enforce that the config is
authoritative), set `edge.api.disableOidcAutoBinding: true` in the controller
config.
