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

#### Reaching the IPC socket under systemd

The OpenZiti-packaged systemd service runs the controller with `PrivateTmp=true`,
which gives the unit its own private `/tmp` namespace. The controller writes its
agent socket to `/tmp/gops-agent.<pid>.sock` inside that namespace, where commands
run from outside the namespace can't see it. `ziti agent cluster ...` invoked from
a normal shell will fail with a "could not find agent" error.

The workaround is to enter the controller's mount namespace before running the
agent command:

```
systemctl show -p MainPID --value ziti-controller.service \
  | xargs -rIPID sudo nsenter --target PID --mount -- \
    ziti agent cluster list
```

Replace `cluster list` with whatever agent command you need. The same pattern
works for any other `ziti agent ...` invocation against a controller running
under the packaged systemd unit.

If you'd rather not nsenter every time, an alternative is to run the controller
from the binary directly with a config file (no systemd), which avoids the
namespace isolation entirely. That trades operational hygiene for convenience,
and is generally only a good idea on development hosts.

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
user@node2$ ziti agent cluster add tls:ctrl1.ziti.example.com:1280
```

### Voter vs Non-Voter

By default, `ziti agent cluster add` adds the new node as a **voter** (`--voter=true`).
To add a node as a non-voter -- for example, an additional controller that exists for
regional read coverage but shouldn't participate in raft consensus -- pass
`--voter=false`:

```
ziti agent cluster add --voter=false tls:ctrl4.ziti.example.com:1280
```

See [Topology -> Voters and Non-Voters](./topology.md#voters-and-non-voters) for
guidance on when to add which.

## Shrinking the Cluster

From any node in the cluster, nodes can be removed as follows:

```
user@node1$ ziti agent cluster remove ctrl2
```

## Changing Voter Status

There is no dedicated command to promote a non-voter to a voter or demote a voter to
a non-voter. Instead, re-run `ziti agent cluster add` against the existing node with
the desired `--voter` value:

```
# promote an existing non-voter to a voter
ziti agent cluster add --voter=true tls:ctrl4.ziti.example.com:1280

# demote an existing voter to a non-voter
ziti agent cluster add --voter=false tls:ctrl4.ziti.example.com:1280
```

When the controller sees that a node with the same ID and address is already in the
cluster but with the opposite voter status, it removes the existing membership and
re-adds the node with the requested suffrage. The node itself stays running; only the
raft configuration entry changes.

If the address has changed (e.g., you've moved the node to a new host), use
`ziti agent cluster remove <id>` first, then `cluster add` the new address with the
desired voter status. Re-adding by address relies on the node already being reachable
at exactly that address.

## Restoring from Backup

Two restore paths exist, and they're complementary: `restore-from-db` is the more
versatile tool, and the `db:` config setting is a simpler way to do the same restore
at startup when you're bringing up a fresh node.

### `restore-from-db`

```
ziti agent cluster restore-from-db /path/to/backup.db
```

This is an IPC agent command, so it must be run on the same host as a controller,
and the path is interpreted by the controller process rather than the CLI. It works
in two situations:

* **Against an initialized cluster with a working leader.** The controller packages
  the snapshot into a raft command and dispatches it through raft, so the snapshot
  is applied on every controller in the cluster. Each controller replaces its bolt
  DB with the snapshot's contents and then terminates so the process manager can
  restart it cleanly -- this avoids in-memory caches drifting from the new database
  state. Use this when you want to roll a healthy cluster back to a known good
  model (e.g., reverting after a bad change).
* **Against a fresh, uninitialized controller.** When the receiving controller has
  no raft state, the command bootstraps a new single-node cluster with itself as
  leader and applies the snapshot to that single-node cluster. Use this when you're
  recovering from total cluster loss -- start a fresh controller, then run
  `restore-from-db` against it to bring up a one-node cluster from the snapshot,
  then grow the cluster with `cluster add`.

What `restore-from-db` does **not** help with is a partially-alive cluster that has
lost quorum. There's no leader to dispatch through on the existing nodes, and
pointing the command at a fresh node wouldn't help reconstitute the broken
cluster -- you'd just end up with a separate new cluster. For lost quorum without
recoverable voters, see
[Failure Scenarios -> Loss of Quorum](./failure-scenarios.md#loss-of-quorum) and
treat it as total cluster loss.

### `db:` config setting

The `db:` setting was originally added to support migrating a non-HA controller into
a cluster: in a standalone deployment, `db:` already points at the controller's
bolt database, and adding a `cluster:` section alongside it converts the controller
to HA without losing the existing model. The same mechanism doubles as a way to
seed a fresh HA controller from any bolt DB snapshot.

When you're standing up a fresh controller from a snapshot, you can skip the
`restore-from-db` step by setting `db: /path/to/backup.db` in the controller
config. On the first startup with an empty `cluster.dataDir`, the controller
detects that it's running in HA mode but isn't initialized, reads the backup, and
bootstraps a single-node cluster from it. The end state is identical to running
`restore-from-db` against a fresh node.

The `db:` setting is only consulted while raft has no state; on subsequent restarts
it's ignored, so it's safe to leave in the config.

Use whichever is more convenient: if you can edit the config before the first
startup (or you're coming from a non-HA controller that already has `db:` set),
the `db:` path is natural; if the controller is already running and you want to
seed it from a snapshot, use `restore-from-db`. Either way, follow the
[Total Cluster Loss](./failure-scenarios.md#total-cluster-loss) procedure for the
full sequence (clear `dataDir`, bring up the first controller, grow the cluster,
routers reconnect).

### Which path for which situation

| Situation | Use |
| --- | --- |
| Cluster has a leader; want to roll the data model back to a snapshot | `restore-from-db` against any cluster member |
| Bringing up a fresh deployment from an existing snapshot | `db:` config or `restore-from-db` against a fresh node -- either works |
| All controllers destroyed; restoring from off-host backup | Same as fresh deployment: `db:` config or `restore-from-db` against a fresh node |
| Quorum lost on a partially-alive cluster, voters unrecoverable | Treat as total cluster loss; see [Failure Scenarios](./failure-scenarios.md#loss-of-quorum) |

## Snapshot Application and Restarts

If a controller is out of communication for a while, it may receive a snapshot to apply, rather
than a stream of events.

If a controller receives a snapshot to apply after startup is complete, it will apply the snapshot and then
terminate. This assumes that there is a process manager to restart controller after it terminates.

This should only happen if a controller is connected to the cluster and then gets disconnected for
long enough that a snapshot is created while it's disconnected. Because applying a snapshot requires
replacing the underlying controller bolt DB, the easiest way to do that is restart. That way the 
controller don't have to worry about replacing the bolt DB underneath a running system.

## Events

All events now contain a `event_src_id` to indicate which controller emitted them.

There are some new events which are specific to clusters. See [Cluster Events](../50-events.mdx#cluster) 
for more detail.

## Metrics

In an HA system, routers will send metrics to all controllers to which they are connected. There is
a new `doNotPropagate` flag in the metrics message, which will be set to false until the router has
successfully delivered the metrics message to a controller. The flag will then be set to true. So
the first controller to get the metrics message is expected to deliver the metrics message to the
events system for external integrators. The other controllers will have `doNotPropagate` set to true,
and will only use the metrics message internally, to update routing data.

## Rate Limiting and `TooManyUpdatesError`

The controller protects itself against runaway write load with an adaptive rate limiter on the
raft command path. Under sustained heavy write activity -- large batch identity provisioning,
terminator churn from many SDK hosting apps reconnecting at once, etc. -- incoming write requests
can be rejected with the error `apierror.TooManyUpdatesError`. This is distinct from
`ClusterHasNoLeaderError`: the cluster is healthy and has a leader; it's just signalling that it
can't take on any more work right now.

Clients receiving `TooManyUpdatesError` should back off and retry. The condition is transient --
the rate limiter's adaptive window will widen again as soon as the in-flight load drops. SDKs
typically handle this transparently. If you're writing custom code against the management API,
exponential backoff with jitter is the right pattern.

Three metrics (`raft.rate_limiter.queue_size`, `raft.rate_limiter.work_timer`,
`raft.rate_limiter.window_size`) show the rate limiter's current state. See
[Monitoring and Troubleshooting -> Metrics](./monitoring-and-troubleshooting.md#metrics) for what
to watch and [the cluster config reference](../30-configuration/controller.md#cluster) for the
tuning knob (`commandHandler.maxQueueSize`).

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

The location of all three is controlled by the [cluster/dataDir](../30-configuration/controller.md#cluster) config property.

```yaml
raft:
  dataDir: /var/lib/ziti/controller/
```

When an HA controller starts up, it will first apply the newest snapshot, then any newer journal
entries that aren't yet contained in a snapshot. This means that an HA controller should start with
a blank DB that can be overwritten by snapshot and/or have journal entries applied to it. So an HA
controller will delete or rename the existing controller database and start with a fresh bolt db.

