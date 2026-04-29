---
sidebar_label: Configuration
sidebar_position: 30
---

# Controller Configuration

### Config File

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
 
Finally, cluster-capable SDK clients use OIDC for authentication, so an OIDC endpoint must be configured.

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
