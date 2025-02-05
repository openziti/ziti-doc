---
sidebar_label: Operations
sidebar_position: 50
---

# Operating a Controller Cluster

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

If a controller receives a snapshot to apply after starting up, it will apply the snapshot and then
terminate. This assumes that there is a restart script which will bring the controller back up after
it terminates.

This should only happen if a controller is connected to the cluster and then gets disconnected for
long enough that a snapshot is created while it's disconnected. Because applying a snapshot requires
replacing the underlying controller bolt DB, the easiest way to do that is restart. That way we
don't have to worry about replacing the bolt DB underneath a running system.

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

These connections do not require any extra open ports as we are using the control channel listener
to listen to both router and controller connections. As part of the connection process the
connection type is provided and the appropriate authentication and connection setup happens based on
the connection type. If no connection type is provided, it's assumed to be a router.

## System of Record

In controller that's not configured for HA, the bolt database is the system of record. In an HA
setup, the distributed journal (managed via RAFT) is the system of record. The raft journal is 
stored in two places, a snapshot directory and a bolt database of raft journal entries.

So a non-HA setup will have:

* ctrl.db

An HA setup will have:

* raft.db - the bolt database containing raft journal entries
* snapshots/ - a directory containing raft snapshots. Each snapshot is snapshot of the controller
  bolt db
* ctrl.db - the controller bolt db, with the current state of the model

The location of all three is controlled by the raft/dataDir config property.

```yaml
raft:
  dataDir: /var/ziti/data/
```

When an HA controller starts up, it will first apply the newest snapshot, then any newer journal
entries that aren't yet contained in a snapshot. This means that an HA controller should start with
a blank DB that can be overwritten by snapshot and/or have journal entries applied to it. So an HA
controller will delete or rename the existing controller database and start with a fresh bolt db.


