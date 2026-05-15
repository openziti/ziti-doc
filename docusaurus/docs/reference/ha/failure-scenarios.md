---
sidebar_label: Failure Scenarios
sidebar_position: 70
---

# Failure Scenarios

This page walks through what a controller cluster does when things go wrong: a node
crashes, the network splits, the leader disappears, two nodes die at once. The goal is
to give operators a clear picture of what still works in each case and what to do about
it.

## The Short Version

In a controller cluster:

* **Reads always work locally.** Every controller has the full data model, so SDK
  clients, tunnelers and routers can keep reading services, policies and identities
  from any reachable controller, even if it's the only one left standing. Reads from a
  disconnected controller may be stale until it rejoins.
* **Circuit creation works as long as any controller is reachable.** SDK clients and
  tunnelers can ask any controller they can reach to create a circuit. However, a
  controller can only route a circuit using routers that are connected to **it**. If
  your routers aren't connected to every controller, losing a controller can shrink
  the set of routers a surviving controller is able to use for new circuits. For this
  reason, routers should generally be connected to all controllers in the cluster.
* **Writes (model updates) need a leader and a quorum of voters.** This is the obvious
  case: provisioning identities, changing policies, etc. It also catches an
  easy-to-miss case: **creating a terminator is a write**, and SDK hosting
  applications create terminators routinely as they connect or restart. So a cluster
  that has lost write availability won't just stop accepting admin changes; SDK
  hosting apps that come up during the outage will fail to register and won't accept
  connections until writes work again.
* **Existing data-plane traffic is not gated on the controller cluster.** Established
  circuits keep flowing data through routers regardless of controller state.

Most failure scenarios reduce to one of those statements.

## Voter Failure Tolerance

The number of voting members the cluster has determines how many can be offline and
still accept writes. Non-voting members don't count toward this calculation.

| Voting members | Quorum | Voter losses tolerated |
| --- | --- | --- |
| 1 | 1 | 0 |
| 3 | 2 | 1 |
| 5 | 3 | 2 |
| 7 | 4 | 3 |

Even-sized voter counts get no benefit over the next odd number down: a 4-voter cluster
still tolerates 1 loss, same as 3 voters, but writes need 3 voter ACKs instead of 2.
Stick with odd voter counts.

Non-voting members can come and go freely without affecting write availability. They
catch up via raft log replay or snapshot when they reconnect.

## Single Voter Lost

The common case in a 3-voter cluster.

* **Writes:** still accepted. The two surviving voters form a quorum.
* **Reads:** unaffected on every surviving controller.
* **Leader election:** if the lost node was the leader, the surviving voters hold an
  election. With default timeouts (`electionTimeout: 5s`, `heartbeatTimeout: 3s`) a new
  leader is typically seated within a few seconds.
* **Routers:** notice their preferred (lowest-latency) controller is unreachable and
  fall back to the next-best controller for circuit creation. Terminator updates wait
  until they can reach the new leader.
* **Recovery:** bring the controller back up, or remove it from the cluster with
  `ziti agent cluster remove <id>` and add a replacement.

You are now running at zero spare voters. Plan to replace the lost member before the
next failure.

## Loss of Quorum

This is the case the cluster sizing decision is really about. In a 3-voter cluster,
losing two voters; in a 5-voter cluster, losing three; and so on.

* **Reads:** still work locally on every surviving controller. Clients can authenticate
  with cached data, look up services, and reach existing routers.
* **Writes:** fully unavailable. The surviving controllers can't elect a leader and
  can't commit anything to the journal. Update attempts return
  `ClusterHasNoLeaderError`.

:::warning
"Writes unavailable" doesn't just mean admins can't make changes. It also blocks
terminator creation, which happens any time an SDK hosting application connects or
restarts. Hosting apps that come up during a quorum outage cannot register their
terminators, and the services they offer won't be reachable until quorum is restored.
:::

This is **not** a read-only state. The cluster is fully unavailable for management
operations. The read-only state described later in this page is a different,
version-mismatch-driven mode.

Recovery options:

1. **Bring lost voters back online.** If the voter nodes are recoverable (machine
   reboot, network issue resolved, etc.), restoring quorum lets the cluster resume
   writes with no further action. This is the preferred recovery.
2. **Restore the cluster from a backup.** If the lost voters are unrecoverable, there
   is currently no in-place way to shrink the voter set without a quorum.
   `cluster remove` requires a leader to commit the membership change, and
   `restore-from-db` against the surviving cluster also requires a leader to dispatch
   the snapshot through raft. Treat this as total cluster loss and rebuild from your
   most recent backup; see [Total Cluster Loss](#total-cluster-loss).

The takeaway is that quorum is a hard line. The bigger your voter count, the more
failures it takes to cross it, but every additional voter also adds latency to every
write. See [Topology](./topology.md) for the trade-off, and take backups frequently
enough that the recovery-point cost of falling back to a snapshot is acceptable.

## Network Partitions

A partition divides the voters into a majority side and a minority side (or several
minority sides).

* **Majority side:** keeps or elects a leader; writes continue normally.
* **Minority side:** can't elect a leader, can't accept writes. Reads still work
  locally and may serve slightly stale data, since updates committed on the majority
  side haven't reached it.
* **Even split (no majority):** writes fail on both sides. This is the quorum-loss case
  above.

When the partition heals, the minority side catches up by replaying journal entries it
missed (or applying a snapshot if it fell too far behind, see below). Split-brain isn't
possible: raft guarantees only one leader per term, and a partition with no quorum
can't elect one.

## Leader Loss and Elections

Once a leader is elected, it stays leader as long as it can reach a quorum of voters.
The cluster does not hold elections on a schedule, and leadership does not migrate on
its own. Leadership only changes when:

* the leader becomes unreachable (process exit, network failure, host crash) and
  followers time out waiting for heartbeats;
* the leader voluntarily steps down because it can't reach a quorum (governed by
  `leaderLeaseTimeout`, default 3s);
* an operator runs `ziti agent cluster transfer-leadership`;
* a non-preferred leader automatically transfers leadership to a preferred peer (see
  below).

When the leader becomes unreachable, the remaining voters hold an election. With
default timeouts:

* Followers wait `heartbeatTimeout` (3s) without a leader heartbeat before suspecting
  trouble.
* A follower then waits a randomized portion of `electionTimeout` (5s) before becoming
  a candidate and starting an election.
* A new leader is typically chosen within a few seconds of the old one going away.

During the election, write attempts return `ClusterHasNoLeaderError`. Once a leader is
elected, writes resume.

In a heterogeneous cluster, the [`preferredLeader`](./topology.md) flag lets you steer
leadership toward a chosen voter. After an election, a non-preferred leader will
automatically transfer leadership to a preferred peer about 10 seconds later, so the
cluster converges on running the leader where you want it.

A consequence: if exactly one node is preferred and you manually move leadership
elsewhere, leadership will bounce back about 10 seconds later. The feature is doing
what you told it to do; you just can't park leadership on a non-preferred node by
hand.

If you'd rather have leadership land anywhere within a set of acceptable nodes, mark
them all as preferred. This is usually what you want anyway, because the reason to
prefer a leader in the first place is "this node can commit writes quickly," and any
node close to a quorum's worth of other voters is equally good.

For example, take a 3-voter cluster with two voters in one region and a third on
another continent. The leader needs an ACK from one other voter to commit a write. If
a same-region voter is leader, that ACK comes back at intra-region latency and writes
are fast. If the far-away voter is leader, every commit has to wait for an ACK from
one of the same-region voters across the continent, so writes happen at cross-
continent latency. Marking both same-region voters as preferred keeps leadership in
the close region without pinning it to a specific machine.

You can also force a leadership change at any time:

```
ziti agent cluster transfer-leadership [target-id]
```

This is useful for planned maintenance (stop the leader after transferring leadership
off it, so the cluster doesn't have to hold an election) or for moving leadership
closer to the operator before a long batch of updates.

## Read-Only Mode (Version Mismatch)

This is a distinct mode from "lost quorum." The cluster transitions to read-only when
voters running different software versions are present in the cluster.

* **Trigger:** any peer's reported version differs from the local controller's version.
* **Effect:** write attempts return `unable to execute command. In a readonly state:
  different versions detected in cluster`. Reads continue normally everywhere.
* **Recovery:** the cluster automatically exits read-only mode once all peers report
  the same version.

This mode is a safety mechanism for upgrades. It prevents a mixed-version cluster from
committing entries that a node at the wrong version might mis-interpret. It is normal
and expected during a rolling upgrade.

Once the first upgraded node rejoins, the cluster stays read-only until every node is
on the new version. You can't make that window shorter than the rolling upgrade itself
takes, and the order in which you upgrade nodes doesn't change it. If you're upgrading
the current leader, run `ziti agent cluster transfer-leadership` first so the cluster
does a controlled handoff instead of waiting out an election timeout, but that's the
only ordering concern.

Operationally, you'll see this as the cluster being read-write, then read-only for
the duration of the rolling upgrade, then read-write again.

## Lagging or Disconnected Controllers

A controller that's out of touch for a while will lag the journal. When it reconnects,
one of two things happens:

* **Short absence:** the leader streams the missed journal entries and the controller
  catches up in place.
* **Longer absence:** if a snapshot was created while the controller was disconnected,
  the leader sends a snapshot to apply. Applying a snapshot replaces the underlying
  bolt DB, which the controller cannot do under itself while serving traffic. The
  controller terminates (or, if `cluster.restartSelfOnSnapshot: true`, restarts itself
  in-process) about 5 seconds after applying the snapshot. A process manager is
  expected to restart it.

This is normal recovery behavior, not a failure. The controller restart that follows a
snapshot apply is the system's way of cleanly swapping the database underneath itself.

## Existing Circuits When a Controller Goes Down

Circuits are owned by the controller that created them. When that controller goes
down:

* The existing circuit stays up. Routers keep forwarding traffic; there is no
  interruption to data-plane flows.
* The circuit cannot be re-routed. If a router on the path goes down or a better link
  becomes available, the circuit will not adapt; it just keeps using its current path
  until it ends naturally or fails.
* New circuits created after the controller is gone are created by some other
  controller and are owned by that controller for their lifetime.

This is identical to the standalone-controller behavior. See the
[Overview](./overview.md#limitations) and the
[Routing Project Board](https://github.com/orgs/openziti/projects/13/views/1) for the
ongoing work to make circuit management more resilient.

## Router Behavior During Failures

Routers connect to all controllers they know about (via their endpoints file). When a
controller becomes unreachable:

* The router uses the next-best controller by latency for new circuit creation.
* Terminator changes (which must go through the leader) wait until the router can
  reach the current leader. If the leader has just changed, controllers will tell the
  router which peer is now leader.
* When the controller cluster membership changes, the leader notifies routers and they
  update their endpoints file. The file is read at startup and rewritten on change;
  see [Routers](./routers.md#endpoints-file).

If a router loses contact with every controller, existing circuits keep flowing
traffic, but the router can't create new circuits or update terminators until at
least one controller becomes reachable again.

## Total Cluster Loss

If every controller in the cluster is lost (e.g., destroyed underlying storage on all
of them), you recover from a database snapshot. This requires that you've been taking
backups: see [Operations -> Restoring from Backup](./operations.md#restoring-from-backup)
and the [Backup guide](../../guides/deployments/10-linux/10-controller/60-backup.mdx).

Either of two recovery paths gets you back. Both start the same way: bring up a fresh
controller process with `cluster.dataDir` empty (no `raft.db`, no `snapshots/`, no
`ctrl.db`).

**Path A: `db:` setting in the controller config.** Add a `db: /path/to/backup.db`
entry to the controller config and start the controller. It sees that it's running in
HA mode but isn't initialized yet, reads the backup, and bootstraps a new single-node
cluster from it. The `db:` setting is only consulted while raft has no state; once
the cluster is initialized it's ignored on subsequent starts, so it's safe to leave
in the config.

**Path B: `ziti agent cluster restore-from-db`.** Start the controller as an
uninitialized HA controller (no `db:` setting in the config). Then run
`ziti agent cluster restore-from-db /path/to/backup.db` on that host. The controller
bootstraps a new single-node cluster with itself as leader and applies the backup.

After either path:

1. **Grow the cluster.** Use `ziti agent cluster add` to bring up additional
   controllers and reach the voter/non-voter layout you want.
2. **Routers reconnect automatically.** They'll pick up the new endpoints as the
   cluster announces them.

The recovery point is the moment of the most recent snapshot. Anything committed to
the journal after that snapshot is lost.

## What to Monitor

A short list of signals worth alerting on:

* `warnWhenLeaderlessFor` triggers a controller log warning when no leader has been
  seen for the configured duration (default 1m). Treat this as a quorum-health alert.
* Cluster events (`peer.connected`, `peer.disconnected`, `leadership.gained`,
  `state.has_leader`, `members.changed`) are emitted by the controller's event system.
  See [Cluster Events](../50-events.mdx#cluster).
* The `ziti agent cluster list` command shows each member's voter status, leader flag,
  version, and connectivity. It's the fastest way to confirm cluster health from a
  single command.
