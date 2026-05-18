---
sidebar_label: Monitoring and Troubleshooting
sidebar_position: 90
---

# Monitoring and Troubleshooting an HA Cluster

This page is for operators of a running HA controller cluster: what to watch, what's
healthy, and what to look at first when something looks wrong.

Today the cluster exposes:

* A primary diagnostic command (`ziti agent cluster list`) that shows membership and
  health in one view.
* Cluster events emitted on state transitions (leadership changes, peer connects/
  disconnects, read-only mode entry/exit). Most cluster signals flow through here.
* Entity change events that carry a raft index, useful for external commit-lag
  tracking across controllers.
* Five operator-relevant metrics: three raft rate-limiter signals and two per-peer-
  channel heartbeat histograms.
* A health-check HTTP endpoint that reports the local controller's leadership
  status.
* Log lines on every state-changing event, useful for grep-based alerting and
  historical investigation.

Cluster monitoring works as event-driven monitoring with a small metric backbone:
you alert on cluster state transitions and a handful of key counters, and you reach
for `cluster list` and the logs when something looks wrong.

### A note on the mesh topology

In current OpenZiti releases, the controller mesh is not fully connected. Only the
leader is guaranteed to have direct connections to every follower;
follower-to-follower connections may or may not exist. As a result, a
`cluster list` taken from a follower will sometimes show other followers as
`Connected: false` even when the cluster is perfectly healthy from the leader's
perspective. The leader's view is the canonical one; follower views reflect only
what that follower can directly see.

This is expected to change in an upcoming release that moves to a fully-connected
mesh -- after that change lands, every controller will have a direct connection to
every other controller and the views will be consistent across nodes. Until then,
run `cluster list` against the leader when you need an authoritative answer.

Sections below walk through what healthy looks like, the diagnostic toolkit, common
symptoms and their causes, and the minimal set of things worth alerting on.

## What a Healthy Cluster Looks Like

Before alerting on what's wrong, it helps to know what right looks like.

### `ziti agent cluster list` on a healthy cluster

Run from the leader, the command should show every member as `Connected: true`,
exactly one node as `Leader: true`, and every node reporting the same version. For a
3-voter cluster, that's three rows with consistent state. Voter and Preferred
columns reflect your topology choices and shouldn't change without an operator
action. 

```
Id      Address                              Voter  Leader  Version  Connected  Preferred
ctrl1   tls:ctrl1.ziti.example.com:1280      true   true    v2.0.1   true       true
ctrl2   tls:ctrl2.ziti.example.com:1280      true   false   v2.0.1   true       true
ctrl3   tls:ctrl3.ziti.example.com:1280      true   false   v2.0.1   true       false
```

Running `cluster list` against a follower may show one or more other followers as
`Connected: false`. That isn't a fault on its own -- in current releases the mesh
isn't fully connected, and a follower only reports `Connected: true` for peers it
has direct connections to. As long as the leader's view shows every voter
connected, the cluster is healthy.

### Event silence

A healthy cluster is quiet on the `cluster` event namespace. Normal day-to-day
operation produces no cluster events; the only events are `peer.connected` /
`peer.disconnected` around legitimate restarts (planned upgrades, host reboots) and
the corresponding `leadership.gained` / `leadership.lost` if the leader was
involved.

If you're seeing cluster events fire without a corresponding planned action,
something's wrong.

### Log noise

The HA-specific log lines on a healthy cluster are limited to startup-time messages
(`peer connected`, `raft cluster bootstrap complete`, etc.) and the occasional
snapshot-creation message every `snapshotInterval` minutes (default: every 2
minutes if there's been enough new log entries to cross `snapshotThreshold`).

In particular, you should **not** see any of these on a healthy cluster:

* `cluster running without leader for longer than configured threshold` -- triggered
  by `warnWhenLeaderlessFor`.
* `entering read-only mode` -- version mismatch detected.
* `peer disconnected` outside of planned restarts.
* `non-preferred controller gained leadership` -- fine briefly during election,
  alarming if it sticks.

### Heartbeat metrics

The `peer.latency:<channel-id>` histograms should be stable within a small range --
single-digit milliseconds for same-AZ peers, low-tens of milliseconds for
same-region cross-AZ, low-hundreds for cross-continent. Sudden jumps in
`peer.latency` or `peer.queue_time` are usually the first hint that something's
wrong on the mesh.

One metric exists per actual peer channel. Because the mesh isn't fully connected
in current releases, expect the leader to have a full set of `peer.*` metrics
(one per voter and non-voter) while followers may have fewer. This is normal;
missing metrics on a follower correspond to peers that follower isn't directly
connected to, not to peers that are unreachable from the cluster.

Steady-state `raft.rate_limiter.queue_size` should be 0 or near-0; the
`raft.rate_limiter.window_size` should sit close to its maximum (default 250) when
the cluster is lightly loaded. A queue size that consistently sits above zero or a
shrunken window means the cluster is processing close to its commit capacity.

## The Diagnostic Toolkit

When something looks wrong, these are the tools, roughly in the order you'd reach
for them.

### `ziti agent cluster list`

First stop for any "is the cluster healthy" question. Shows every member, their
voter status, the current leader, their reported version, whether they're currently
connected, and the preferred-leader flag.

**Run it from the leader for the canonical view.** The leader is the only node
guaranteed to have direct connections to every other member (until the
fully-connected mesh change lands in an upcoming release), so the leader's
`Connected` column is the authoritative answer. A `Connected: false` entry on a
follower's view only means that follower doesn't have a direct connection to that
peer -- the peer may still be perfectly healthy and connected to the leader.

If the membership list itself (who's a member, voter status, version) disagrees
between controllers, that's still diagnostic: at least one controller has fallen
behind on applying raft commands. The `Connected` column, by contrast, varies by
mesh topology and isn't expected to agree across nodes in current releases.

### Cluster events

The cluster event namespace is the right alerting surface for state transitions.
Subscribe to the `cluster` event type in the controller's event config and route to
your observability system. The full event list is in
[Cluster Events](../50-events.mdx#cluster); the operationally important ones are:

* `state.is_leaderless` / `state.has_leader` -- leader presence transitions.
* `state.ro` / `state.rw` -- read-only mode transitions (version mismatch).
* `peer.disconnected` / `peer.connected` -- mesh connectivity changes.
* `leadership.gained` / `leadership.lost` -- per-node leadership transitions, useful
  for spotting leader churn.
* `members.changed` -- cluster size or composition changed (someone ran
  `cluster add`/`remove`).

Each event includes the raft `index` at which it occurred, so you can correlate
events across controllers and reconstruct timelines.

### Tracking commit lag externally via entity change events

Entity change events carry the raft index of the change. By default they only fire
on the leader, but with `propagateAlways: true` in the subscription's options they
fire on every controller as that controller applies the change. This lets an
external collector measure per-controller commit lag without inside-the-cluster
instrumentation.

Configure the subscription on every controller you want to track:

```yaml
events:
  commitLagTracker:
    subscriptions:
      - type: entityChange
        propagateAlways: true
    handler:
      type: file
      format: json
      path: /var/log/ziti/entity-change.json
```

Then ship the JSON streams from each controller to a central collector, track the
highest `raftIndex` you've seen from each controller (it's a field on every event),
and compare:

* `max(latest_index across controllers) - latest_index_from_controller_X` is the
  commit lag for controller X, in raft entries.
* `now - timestamp_of_latest_event_from_controller_X` is the lag in wall-clock
  time, useful when comparing controllers with very different commit rates.

A controller that's consistently behind in either dimension is the slow node. A
controller that's completely silent while others are producing events is
disconnected from the leader and isn't applying.

This pattern works because each controller applies committed raft commands locally
in its own FSM, and the entity change events fire from inside that local apply path
-- so the events are dispatched at the moment the change becomes visible on that
specific controller.

### Health-check endpoint

The `health-checks` XWeb API binding (enabled by default on HA controllers) exposes
two endpoints:

* `GET /health-checks` -- process-level health. Includes `bolt.read` (database
  connectivity). Returns HTTP 200 when healthy.
* `GET /health-checks/controller/raft` -- returns leadership status. Returns HTTP
  200 with `{ "raft": { "isRaftEnabled": true, "isLeader": true } }` on the
  leader, HTTP 429 with `isLeader: false` on followers. (The HTTP 429 follows
  Vault's convention for "not the active node.")

These are useful for liveness checks and for "which controller is currently leader"
queries from external tooling.

### Metrics

Five metrics are operationally relevant for cluster monitoring:

| Metric | Type | What it measures |
| --- | --- | --- |
| `raft.rate_limiter.queue_size` | Gauge | Number of raft commands queued for execution on this controller. Should be 0 or near-0 at rest. |
| `raft.rate_limiter.work_timer` | Timer/Histogram | Distribution of raft command execution durations. |
| `raft.rate_limiter.window_size` | Gauge | Current adaptive concurrency window (5-250). Shrinks under load when commands are timing out; recovers when load eases. |
| `peer.latency:<channel-id>` | Histogram | Heartbeat round-trip time on a specific peer channel. One per peer. |
| `peer.queue_time:<channel-id>` | Histogram | Time a message spent in the local send queue before being flushed. One per peer. |

Sustained non-zero `queue_size`, a `window_size` that's repeatedly shrinking, or a
peer-latency histogram that jumps from its baseline are all early signals that the
cluster is approaching capacity or having mesh trouble.

### Log greps

When events and metrics tell you something's wrong but not what, the logs usually
pinpoint it. Useful substrings to grep for on a controller's log:

| Log substring | Meaning |
| --- | --- |
| `cluster running without leader for longer than configured threshold` | `warnWhenLeaderlessFor` tripped. Cluster has been leaderless past the warning duration. |
| `entering read-only mode` | Version mismatch detected; cluster halted writes. |
| `exiting read-only mode` | Versions reconverged; writes resuming. |
| `peer disconnected` | A peer connection closed. Pair with `peer connected` to spot flapping. |
| `non-preferred controller gained leadership` | Election picked a non-preferred voter. Followed by a transfer attempt ~10s later. |
| `transferring leadership to preferred leader` | Auto-transfer to preferred peer initiated. |
| `leadership transfer to preferred leader failed, will try next` | Auto-transfer hit a snag; will retry against another preferred peer. |
| `no preferred leader peers are connected, retaining leadership` | Cluster couldn't find a preferred peer to transfer to; staying put. |
| `ClusterHasNoLeaderError` | Some write attempt was rejected because no leader exists. |
| `restored snapshot to initialized system, restart required` | This controller received a snapshot from the leader and is about to terminate for restart. |

## Symptom -> Cause -> Fix

Common operator-facing symptoms, what tends to cause them, and how to confirm and
remediate.

### `ClusterHasNoLeaderError` on writes

**Symptom.** REST calls that mutate the model fail with `ClusterHasNoLeaderError`.
SDK hosting apps starting up fail to register terminators with the same error.

**Likely causes**, in order of probability:

* The cluster is in the middle of a leader election (typically only a few seconds).
  Wait and retry.
* The cluster has lost quorum. `ziti agent cluster list` will show fewer than
  `(N/2)+1` voters as `Connected: true`.
* A network partition has cut this controller off from the majority. From this
  controller, `cluster list` may still show all voters but their `Connected` status
  will be wrong.

**Confirm.** Run `cluster list` on this controller and on at least one other if
reachable. Compare. Check the log for `cluster running without leader for longer
than configured threshold`.

**Fix.** If a brief election, no action needed. If quorum loss, restore enough
voters to make quorum, then writes resume automatically. See
[Failure Scenarios -> Loss of Quorum](./failure-scenarios.md#loss-of-quorum) for
the recovery procedure if voters can't be recovered.

### Cluster in read-only mode

**Symptom.** Writes fail with `unable to execute command. In a readonly state:
different versions detected in cluster`. Read traffic continues working everywhere.

**Cause.** At least one peer is reporting a different software version from the
others. Exact-string match on the version field; even a patch-level difference
triggers it. See
[Upgrading -> The Read-Only Window](./upgrading.md#the-read-only-window) for the
full mechanics.

**Confirm.** `cluster list` shows the version column for each member; the cluster
is read-only as long as those don't all match.

**Fix.** Finish the rolling upgrade so all peers are on the same version. If you
didn't intend to be upgrading, find the node with the unexpected version (probably
one you forgot to roll, or one that auto-upgraded from a package manager) and bring
it back to the cluster's version.

### Leadership flapping

**Symptom.** `leadership.gained` and `leadership.lost` events fire repeatedly, with
seconds-to-minutes between transitions. Writes occasionally fail with
`ClusterHasNoLeaderError` during the gaps.

**Likely causes:**

* Network instability between voters -- they keep losing heartbeats and
  re-electing. Look at `peer.latency:<channel>` histograms for spikes coinciding
  with the events.
* A misconfigured `preferredLeader` setup: if only one node is preferred and it's
  unreachable but flickering, leadership will keep bouncing back to it. See
  [Topology -> Steering Leadership](./topology.md#steering-leadership-with-preferredleader)
  for the mark-all-close-voters-as-preferred pattern.
* Leader getting starved out by load. Combined with elevated
  `raft.rate_limiter.queue_size` and a shrinking `raft.rate_limiter.window_size`,
  this points to the leader being unable to issue heartbeats fast enough.

**Confirm.** Cross-reference the `leadership.*` event timestamps with peer-latency
spikes and rate-limiter metrics.

**Fix.** Address the underlying network or load issue. If the topology has only one
preferred voter and that voter is flapping, expand the preferred set to include
other close voters so the cluster has a stable home for leadership.

### Peer connectivity flapping

**Symptom.** `peer.connected` / `peer.disconnected` events for the same peer in
close succession.

**Likely causes:**

* Network packet loss or instability between this pair.
* The peer is overloaded and can't respond to heartbeats within
  `CloseUnresponsiveTimeout` (default 30s) -- the channel is then closed
  deliberately. Look on the *peer's* side for evidence of resource exhaustion
  (CPU, memory, GC pauses).
* The peer is restarting unexpectedly. Check that side's process logs.

**Confirm.** The log on this side will show repeated `peer disconnected` /
`peer connected` for the peer ID. The peer-side log usually tells you why it
dropped (process exit, heartbeat timeout, etc.).

**Fix.** Address the underlying issue on the peer side. If the network is the
problem and can't be fixed quickly, increase
`ctrl.options.peerHeartbeatOptions.closeUnresponsiveTimeout` so transient blips
don't tear down the connection -- but only as a temporary workaround.

### Slow writes / high commit latency

**Symptom.** Model updates succeed but take noticeably longer than they used to --
operations that previously completed in tens of milliseconds now take seconds. No
error is returned and the cluster isn't in read-only mode; writes just feel slow.

This is distinct from:

* **Quorum loss**, where writes return `ClusterHasNoLeaderError`.
* **Version-mismatch read-only mode**, where writes return `unable to execute
  command. In a readonly state: different versions detected in cluster`.

If you're getting either of those errors, jump to the corresponding entry above.
Slow-but-successful writes have different causes.

**Likely causes:**

* The leader is geographically far from a quorum of voters, so every commit pays
  cross-region round-trip latency. Verify that leadership is on a voter close to a
  quorum's worth of other voters via `cluster list`; if it's not, the
  `preferredLeader` auto-transfer should move it within ~10s, but a misconfigured
  preferred set can leave it stuck on a distant voter.
* The controller that *received* the API call isn't the leader, and the peer
  channel between it and the leader is slow. Forwarded writes pay the peer-channel
  round trip in addition to raft commit time. Check `peer.latency:<channel-id>` on
  the receiving controller for the leader's channel.
* One or more voters in the quorum are slow to ACK AppendEntries. The leader's
  rate limiter responds by shrinking `raft.rate_limiter.window_size`. Look at
  `peer.latency:<channel-id>` on the leader for any voter that's consistently
  slow.
* Apply throughput is genuinely saturated by load. `raft.rate_limiter.work_timer`
  p99 climbing while load is high is the signal. This is rare under normal use.

**Confirm.** Use the external commit-lag recipe from
[The Diagnostic Toolkit](#tracking-commit-lag-externally-via-entity-change-events)
to check whether one specific voter is lagging behind the others. The rate-limiter
metrics distinguish "leader can't keep up with apply" from "one follower is slow to
ACK." Peer-latency metrics on the receiving controller distinguish "client
connected to a far-away controller" from "cluster itself is slow."

**Fix.** Move leadership to a low-latency voter if possible. If a specific voter is
consistently slow, investigate the host (disk, network, CPU, GC pauses). If clients
are connecting to a controller that's far from the leader, consider whether that's
by design -- for write-heavy clients, connecting to a controller close to the
leader avoids the extra peer-channel hop.

### Disk usage growing unexpectedly on a controller

**Symptom.** A controller's `cluster.dataDir` is using significantly more disk than
peers, or growing steadily.

**Likely causes:**

* The raft journal is growing because snapshots aren't being created. Check
  `snapshotInterval`, `snapshotThreshold`, and `trailingLogs` config -- defaults
  are 2m / 500 entries / 500 trailing.
* The controller is falling behind on snapshot apply and journal compaction. Look
  in the log for snapshot-creation messages; if they're absent for an extended
  period despite write activity, something's wrong.

**Confirm.** `du -sh` on `cluster.dataDir/raft.db`, `cluster.dataDir/snapshots/`
on each controller. Significant divergence between controllers is the signal.

**Fix.** Make sure `snapshotThreshold` isn't set unrealistically high. If snapshot
creation has stopped on a specific controller, the controller's logs around the
expected snapshot times will show why. Restarting the affected controller is a
reasonable last resort -- it'll catch up via snapshot from the leader.

### A new controller can't join the cluster

**Symptom.** `ziti agent cluster add` returns an error, or the new node appears in
the leader's `cluster list` with `Connected: false`. Check the leader's view
specifically -- a `Connected: false` from a follower might just be the partial
mesh that exists in current releases, not an actual join problem.

**Likely causes:**

* Certificate mismatch -- most commonly the new node's identity doesn't share the
  trust domain or doesn't match the SPIFFE ID format expected by the rest of the
  cluster. See [Bootstrapping -> Certificates](./bootstrapping/certificates.md)
  and the [Common Bootstrapping Errors](./bootstrapping/certificates.md#common-bootstrapping-errors)
  section.
* Network reachability -- the new node can't reach existing controllers on the
  advertise port, or vice versa.
* Version mismatch -- the new node is on a different version. The cluster will
  accept it but immediately enter read-only mode; subsequent writes will fail.

**Confirm.** Check the new node's log for TLS errors (`tls: error decrypting
message`, `x509: certificate signed by unknown authority`, `no certs presented
matched the CA for this node`). Check existing controllers' logs for matching
errors when the join was attempted.

**Fix.** Match the symptoms to the appropriate entry in
[Common Bootstrapping Errors](./bootstrapping/certificates.md#common-bootstrapping-errors).

## What to Alert On

A minimal alerting setup that covers the operationally important cases without
producing noise:

### Page-worthy (write the alert today)

* **Cluster has been leaderless for too long.** Either:
  - Grep the controller log for `cluster running without leader for longer than
    configured threshold` and alert on its presence (this fires after
    `warnWhenLeaderlessFor`, default 1m, configurable to as low as 10s).
  - Or consume the `cluster` event stream and alert if a `state.is_leaderless`
    event isn't followed by `state.has_leader` within your tolerance window.

  Either signal means the cluster can't accept writes right now.
* **Cluster entered read-only mode.** Alert on the `state.ro` cluster event. The
  expected duration of read-only mode is the length of a rolling upgrade; an
  unplanned occurrence (or one that lasts past your scheduled upgrade window)
  means something needs attention.
* **Loss of quorum.** Detectable in two ways: the leaderless alert above usually
  catches it, and the `members.changed` event followed by a count of
  `Connected: true` voters below `(N/2)+1` (via `cluster list` polled from the
  leader, since the leader's view is the authoritative one) is a more direct
  signal.

### Worth alerting on but not paging

* **Peer connectivity flapping.** Alert if the same peer disconnects and reconnects
  more than a few times in a short window. A burst of `peer.disconnected` /
  `peer.connected` events for one peer ID over (say) 10 minutes is the signal.
* **Leadership churn.** Alert on multiple `leadership.gained` / `leadership.lost`
  events within a short window -- leadership transitions should be rare under
  normal operation.
* **Sustained non-zero `raft.rate_limiter.queue_size` or a shrinking
  `raft.rate_limiter.window_size`.** Either suggests the cluster is approaching its
  commit-rate capacity. Not urgent, but worth investigating before it becomes
  urgent.
* **`peer.latency:<channel-id>` baseline shift.** A jump in the histogram median or
  p99 from its steady state usually points at network trouble before users notice.

### Worth tracking but not alerting

* **External commit-lag tracker** (see
  [The Diagnostic Toolkit](#tracking-commit-lag-externally-via-entity-change-events))
  -- useful in dashboards and during incident investigation, but the lag values
  themselves are noisy and rate-of-change is what matters. Set alerts based on
  sustained lag (e.g., one controller more than N entries behind for more than M
  minutes), not on instantaneous values.
* **Snapshot creation rate** -- currently only visible in the logs. A controller
  that goes too long without creating a snapshot, or one that creates them
  suspiciously often, is worth investigating; but until snapshot metrics are
  exposed directly, log-based detection is best.

### What not to alert on

* **Individual `peer.disconnected` / `peer.connected` events.** These fire on
  planned restarts (controller upgrades, host reboots) and aren't actionable in
  isolation.
* **`leadership.gained` / `leadership.lost` events one at a time.** A single
  transition is normal during planned maintenance or after a controller restart.
  Only flap behavior is worth attention.
* **Health-check endpoint returning 429 on a non-leader controller.** That's the
  *correct* response on followers (Vault convention). Alert on "no controller
  returns 200," not on "this specific controller returns 429."
