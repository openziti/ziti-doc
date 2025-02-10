---
sidebar_label: Operations
sidebar_position: 50
---

# Operating a Controller Cluster

## Cluster Management APIs 

A cluster can be managed via the REST endpoint and via the IPC agent. 

### REST Operations

The REST operations can be invoked remotely using the `ziti` CLI as long as the 
the CLI is logged in.


```
$ ziti ops cluster 
Controller cluster operations

Usage:
  ziti ops cluster [flags]
  ziti ops cluster [command]

Available Commands:
  add                 add cluster member
  list                list cluster members and their status
  remove              remove cluster member
  transfer-leadership transfer cluster leadership to another member

Flags:
  -h, --help   help for cluster

Use "ziti ops cluster [command] --help" for more information about a command.
```

### IPC Operations

The IPC versions can be invoked via the CLI and don't require any authentication,
but need to be run on the same machine as the controller, by a user with access
to the IPC pipe.

```
$ ziti agent cluster
Manage an HA controller cluster using the IPC agent

Usage:
  ziti agent cluster [flags]
  ziti agent cluster [command]

Available Commands:
  add                 adds a node to the controller cluster
  init                Initializes a cluster with a default administrator
  list                lists the nodes in the controller cluster
  remove              removes a node from the controller cluster
  restore-from-db     Restores a cluster to the state in the given database snapshot
  transfer-leadership triggers a new leader election in the controller cluster, optionally selecting a new preferred leader

Flags:
  -h, --help   help for cluster

Use "ziti agent cluster [command] --help" for more information about a command.
```

## Growing the Cluster

After at least one controller is running as part of a cluster and initialized, 
additional nodes may be added to the cluster. Additional nodes should be configured 
similarly to the initial node, though advertise addresses will vary.

Assume a network where the first node has been initialized, and is available at `ctrl1.ziti.example.com:1280`.

If the second node is running at `ctrl2.ziti.example.com:1280`, then it can be added to the 
cluster in one of two ways. 

### From An Existing Node

From a node already in the cluster, in this case the initial node, the new node can be added as follows:

```
user@node1$ ziti agent cluster add tls:ctrl2.ziti.example.com:1280
```

### From A New Node

The new node, which is not yet part of the cluster, can also be directed to reach
out to an existing cluster node and request to be joined.

```
user@node2$ ziti agent cluser add tls:ctrl1.ziti.example.com:1280
```

## Shrinking the Cluster

From any node in the cluster, nodes can be removed as follows:

```
user@node1$ ziti agent cluster remove ctrl2
```

## Restoring from Backup

To restore from a database snapshot, use the following CLI command:

```
ziti agent controller restore-from-db /path/to/backup.db
```

As this is an agent command, it must be run on the same machine as the controller. The path
provided will be read by the controller process, not the CLI.

The controller will apply the snapshot and then terminate. All controllers in the cluster will
terminate and expect to be restarted. This is so in memory caches won't be out of sync with
the database which has changed.

## Snapshot Application and Restarts

If a controller is out of communcation for a while, it may receive a snapshot to apply, rather
than a stream of events.

If a controller receives a snapshot to apply after startup is complete, it will apply the snapshot and then
terminate. This assumes that there is a process manager to restart controller after it terminates.

This should only happen if a controller is connected to the cluster and then gets disconnected for
long enough that a snapshot is created while it's disconnected. Because applying a snapshot requires
replacing the underlying controller bolt DB, the easiest way to do that is restart. That way the 
controller don't have to worry about replacing the bolt DB underneath a running system.

## Events

All events now contain a `event_src_id` to indicate which controller emitted them.

There are some new events which are specific to clusters. See [Cluster Events](../events#cluster) 
for more detail.

## Metrics

In an HA system, routers will send metrics to all controllers to which they are connected. There is
a new `doNotPropagate` flag in the metrics message, which will be set to false until the router has
successfully delivered the metrics message to a controller. The flag will then be set to true. So
the first controller to get the metrics message is expected to deliver the metrics message to the
events system for external integrators. The other controllers will have `doNotPropage` set to true,
and will only use the metrics message internally, to update routing data.

## Open Ports

Controllers now establish connections with each other, for two purposes.

1. Forwarding model updates to the leader, so they can be applied to the distributed journal
2. distributed journal communication

Both kinds of traffic flow over the same connection.

These connections do not require any extra open ports as the controller uses the control channel listener
to listen to both router and controller connections. As part of the connection process the
connection type is provided and the appropriate authentication and connection setup happens based on
the connection type. If no connection type is provided, it's assumed to be a router.

## System of Record

In a controller that's not configured for HA, the bolt database is the system of record. In an HA
setup, the distributed journal (managed via RAFT) is the system of record. The raft journal is 
stored in two places, a snapshot directory and a bolt database of raft journal entries.

So a non-HA setup will have:

* ctrl.db

An HA setup will have:

* raft.db - the bolt database containing Raft journal entries
* snapshots/ - a directory containing Raft snapshots. Each snapshot is snapshot of the controller
  bolt db
* ctrl.db - the controller bolt db, with the current state of the model

The location of all three is controlled by the [cluster/dataDir](../configuration/controller#cluster) config property.

```yaml
raft:
  dataDir: /var/lib/ziti/controller/
```

When an HA controller starts up, it will first apply the newest snapshot, then any newer journal
entries that aren't yet contained in a snapshot. This means that an HA controller should start with
a blank DB that can be overwritten by snapshot and/or have journal entries applied to it. So an HA
controller will delete or rename the existing controller database and start with a fresh bolt db.

