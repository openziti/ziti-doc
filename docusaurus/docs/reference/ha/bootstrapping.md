---
sidebar_label: Bootstrapping
sidebar_position: 10
---

# Bootstrapping A Cluster 

To bring up a controller cluster, one starts with a single node. 

## Controller Configuration

### Certificates

Each controller requires appropriate certificates. The certificates for clustered controllers 
have more requirements than those for a standalone server. See the [Certificates Reference](./certificates.md)
for more information. 

### Config File

The controller requires a `raft` section.

```yaml
raft:
  dataDir: /path/to/data/dir
```
The `dataDir` will be used to store the following:

* `ctrl-ha.db` - the OpenZiti data model bbolt database
* `raft.db` - the raft bbolt database
* `snapshots/` - a directory to store raft snapshots

Controller use the control channel listener to communicate with each other. Unlike
routers, they need to know how to reach each other, so an advertise address must
be configured.

```yaml
ctrl:
  listener: tls:0.0.0.0:6262
  options:
    advertiseAddress: tls:192.168.1.100:6262
```
 
Finally, for sessions to work across controllers, JWTs are used. To enable these
an OIDC endpoint should be configured.

```yaml
web:
  - name: all-apis-localhost
    bindPoints:
      - interface: 127.0.0.1:1280
        address: 127.0.0.1:1280
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

## Initializing the Controller

Once properly configured, the controller can be started.

```shell
ziti controller run ctrl1.yml
```

Once the controller is up and running, it will see that it is not yet initialized, and will pause
startup, waiting for initialization. While waiting it will periodically emit a message:

```
[   3.323] WARNING ziti/controller/server.(*Controller).checkEdgeInitialized: the 
Ziti Edge has not been initialized, no default admin exists.  Add this node to a 
cluster using 'ziti agent cluster add tls:localhost:6262' against an existing 
cluster member, or if this is the bootstrap node, run 'ziti agent controller init' 
to configure the default admin and bootstrap the cluster
```

As this is the first node in the cluster, we can't add any nodes to it yet. Instead, run:

```
ziti agent controller init <admin username> <admin password> <admin identity name>
```

This initializes an admin user that can be used to manage the network.
 
## Managing the Cluster

There are four commands which can be used to manage the cluster.

```bash
# Adding Members
ziti agent cluster add <other controller raft address>

# Listing Members
ziti agent cluster list

# Removing Members
ziti agent cluster remove <controller id>

# Transfer Leadership
ziti agent cluster transfer-leadership [new leader id]
```

These are also available via the REST API, and can be invoked through the CLI.

```bash
$ ziti ops cluster --help
Controller cluster operations

Usage:
  ziti ops cluster [flags]
  ziti ops cluster [command]

Available Commands:
  add-member          add cluster member
  list-members        list cluster members and their status
  remove-member       remove cluster member
  transfer-leadership transfer cluster leadership to another member

Flags:
  -h, --help   help for cluster

Use "ziti ops cluster [command] --help" for more information about a command.
```

## Growing the Cluster

Once a single node is up and running, additional nodes can be added to it. They should be 
configured the same as the initial node, though they will have different addresses.

The first node, as configured above, is running at `192.168.1.100:6262`. 

If the second node is running at `192.168.1.101:6262`, then it can be added to the 
cluster in one of two ways. 

### From An Existing Node

From a node already in the cluster, in this case our initial node, we can add the 
new node as follows:

```bash
user@node1$ ziti agent cluster add tls:192.168.3.101
```

### From A New Node

We can also ask the new node, which is not yet part of the cluster, to reach
out to an existing cluster node and request to be joined.

```
user@node2$ ziti agent cluser add tls:192.168.3.100
```

## Shrinking the Cluster

From any node in the cluster, nodes can be removed as follows:

```
user@node1$ ziti agent cluster remove tls:192.168.3.101
```
