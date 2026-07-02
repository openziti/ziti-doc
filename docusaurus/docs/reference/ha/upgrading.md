---
sidebar_label: Upgrading
sidebar_position: 75
---

# Upgrading an HA controller cluster

Upgrading a running HA cluster is a node-by-node rolling operation. There's no special
cluster-wide procedure; you bring each controller down, replace its binary, and bring
it back up, then move to the next one. Routers and SDK clients stay connected
throughout, falling over to other controllers as nodes cycle.

The one thing that's different from upgrading a standalone controller is that the
cluster will be in
[version-mismatch read-only mode](./failure-scenarios.md#read-only-mode-version-mismatch)
for the duration of the rolling upgrade. Reads continue to work; writes (model
updates, terminator creation) are blocked until every node is on the new version. The
window is bounded by how long the upgrade takes overall, not by which node you
upgrade first.

At a glance:

1. Take a database snapshot from a controller.
2. Pick a node. If it's the leader, run `transfer-leadership` first.
3. Stop the controller, replace its binary, start it again.
4. Wait for the cluster to recognize it as healthy.
5. Repeat for each remaining node.

The rest of this page walks through each step, then covers routers and SDK clients,
the Helm chart, and what to do if the upgrade goes wrong.

## Before you upgrade: Snapshot the cluster

Take a database snapshot before any controller binary upgrade. The controller will
apply schema migrations on startup the first time the new binary runs, and that
schema change is one-way. If the upgrade goes badly, the only way back to the
previous version is to restore from a snapshot taken before the migration ran.

The snapshot is always created on the controller you're talking to, using whichever
of its peers' state that controller currently has. **Take the snapshot from the
cluster leader** so the snapshot is as up-to-date as possible. Identify the leader
with `ziti agent cluster list` (or `ziti ops cluster list` over REST).

There are two equivalent ways to trigger the snapshot.

**Via the IPC agent**, on the same host as the leader controller:

```
ziti agent controller snapshot-db /var/lib/ziti/controller/backups/pre-upgrade.db
```

**Via the management REST API**, from anywhere the `ziti` CLI is logged in against
the leader:

```
ziti fabric db snapshot /var/lib/ziti/controller/backups/pre-upgrade.db
```

Either way:

* The path argument is interpreted by the controller process, not the CLI, so the
  directory must be writable from the controller's perspective. (For REST, the CLI
  just passes the path through; nothing is written on the client.)
* The output is a bolt DB snapshot in the format the
  [Total cluster loss](./failure-scenarios.md#total-cluster-loss) recovery paths
  consume.
* You only need one snapshot per upgrade -- the cluster's model is consistent across
  all controllers, so snapshotting more than one node is redundant.

Keep both the snapshot and the previous controller binary somewhere safe until
you've confirmed the upgrade is working. They're the two ingredients of a rollback.

## The procedure: Rolling upgrade

Once you have a snapshot, upgrade controllers one at a time. Pick whichever node you
want to upgrade first; the order doesn't change the read-only window or the end
result. A small step that's worth taking for the current leader is to move
leadership off it before stopping it, so the cluster does a controlled handoff
instead of waiting for an election to fire.

Per node:

1. **If this is the leader, transfer leadership off it.**

   ```
   ziti agent cluster transfer-leadership
   ```

   Without a target argument, the cluster picks an eligible voter (preferring any
   node marked `preferredLeader: true`). You don't strictly have to do this -- if
   you just stop the leader, the surviving voters will elect a new one in a few
   seconds -- but a clean transfer avoids the short `ClusterHasNoLeaderError`
   window during the election.

2. **Stop the controller.**

   With systemd, `systemctl stop ziti-controller`. Otherwise, send the process a
   `SIGTERM` and wait for it to exit cleanly.

3. **Replace the binary.**

   Install the new version of `ziti` (or the controller-specific package, depending
   on how you deploy). The on-disk state in `cluster.dataDir` and the PKI directory
   don't change.

4. **Start the controller.**

   `systemctl start ziti-controller` or your equivalent. On startup the new binary
   will detect any pending schema migration and apply it before opening listeners.

5. **Confirm the node has rejoined the cluster.**

   From any controller, `ziti agent cluster list` should show the upgraded node as
   `Connected: true` and reporting the new version. Wait until you see that before
   moving to the next node -- it confirms the node is back in the mesh and has
   caught up on any journal entries it missed during the restart.

Repeat for each remaining controller. When the last node finishes its upgrade and
reports the new version, the cluster automatically exits read-only mode and writes
work again.

### Don't worry about order

Two notes about ordering that come up:

* **It doesn't matter whether you upgrade the leader first or last.** The read-only
  mode kicks in as soon as any peer is at a different version, and clears only when
  all peers match. The total read-only window is the duration of the rolling
  upgrade, not the duration after the leader is touched.
* **It doesn't matter which non-leader node you do first.** Pick the most
  convenient.

The leadership-transfer step in (1) is purely about avoiding a brief leaderless
window, not about ordering correctness.

## The read-only window

The cluster enters read-only mode the moment any peer reports a different version
from the local controller's, and stays there until every peer reports the same
version. During this window:

* **Reads work normally on every controller.** Clients can authenticate, look up
  services, and create circuits.
* **Writes return an error.** Specifically, write attempts get `unable to execute
  command. In a readonly state: different versions detected in cluster`. This
  includes the easy-to-miss case: terminator creation, which fires whenever an SDK
  hosting application connects or restarts. Hosting apps that come up during the
  window will fail to register; their services won't be reachable until you finish
  the upgrade.

Some details that surprise people:

### Exact version-string match

The version comparison is exact-string equality on the build-time version, not
semver-aware. `v1.6.5` and `v1.6.6` mismatch. `v2.0.0` and `v2.0.1` mismatch.
`v2.0.1` and `v2.0.1-rc1` mismatch. Dev builds (`v0.0.0`) only match other dev
builds.

This means any rolling upgrade triggers the read-only window, including a patch
release. There's no "safe within a patch series" carve-out.

### Plan SDK hosting work around the window

The single most disruptive effect of the window is on SDK hosting apps that need to
register terminators during the upgrade. If you have hosting apps that restart
frequently or that depend on terminator registration succeeding within a few seconds
of startup, schedule the rolling upgrade for a window where you can tolerate failed
registrations, or stage the hosting-app restarts to before or after.

Existing terminators stay in place across the upgrade; the read-only mode only
blocks *new* writes, not previously-committed ones. So already-running hosting apps
with terminators in place keep serving connections fine.

### The window can't be shortened by order

As covered in the previous section: which node you upgrade first doesn't change the
total read-only duration. The window starts when the first upgraded peer joins and
ends when the last unupgraded peer is replaced. The only way to make it shorter is
to make the rolling upgrade itself faster.

## Routers and SDK clients

Routers and SDK clients have no hard version gate with controllers. An older router
can connect to a newer controller and vice versa; the connection succeeds and
features that the older side doesn't understand simply aren't used. The same is
true for SDK clients. So you can upgrade controllers without coordinating router or
SDK versions, and you can upgrade routers without first upgrading controllers.

### SDK compatibility is the strongest contract

Of the three components, the SDK has the strongest backward-compatibility
commitment. Once an SDK is shipped into client applications, it can be effectively
impossible to upgrade (mobile apps, embedded devices, 3rd-party integrations), so
the project treats SDK API breakage as a serious bug. You should generally be able
to upgrade controllers and routers without touching the SDK side at all.

### Routers and controllers: keep the skew small

Router-controller compatibility is shimmed, not gated. An older router talking to a
newer controller (or vice versa) connects fine and falls back to whatever feature
set both sides understand. A small version gap during a rolling upgrade is normal
and expected.

A larger skew is best avoided. Bugs that only show up when the router and
controller are far apart in version do creep in occasionally, and the
regression-test coverage is naturally weaker for distant version pairs. Keep router
upgrades within a release or two of the controller version you're running, and
avoid leaving multi-major-version gaps in place for long.

### Router upgrade procedure

Routers upgrade independently. Stop the router, replace the binary, start it.
Established circuits flowing through the router will be torn down on restart and
re-created against the surviving routers; that's the same behavior as a router
restart for any other reason. There's no cluster-wide coordination needed.

If you have many routers and want to minimize circuit churn, upgrade them one at a
time so most of the data plane is always available, and let SDK clients fail over
to other paths as each router cycles.

### Draining a hosting router before upgrade

If the router you're upgrading is hosting terminators for services, you can drain
it before the restart so existing traffic finishes cleanly while new traffic
prefers other paths. On the host running the router:

```
ziti agent router quiesce
```

This marks every terminator on this router as failed in the controller's data
model. The terminator records aren't deleted; they're flagged so that the
controller stops picking them for new circuit creation as long as some other
healthy terminator for the service exists. Existing circuits keep flowing.

Once new traffic has moved off, stop and upgrade the router. If you change your
mind before the restart, the operation is reversible with `ziti agent router
dequiesce`.

**After the upgrade, run `dequiesce` on the restarted router.** SDK-hosted
terminators heal automatically when the hosting application reconnects, because the
SDK creates fresh terminators on connect. Most other terminators need an explicit
dequiesce:

* **Manually created terminators** (created via the REST API and bound to a
  specific router) aren't recreated on restart, so without dequiesce they stay in
  the failed state and the service stays unreachable through that router.
* **Edge-router-tunneler terminators** are also generally left in place rather than
  recreated. The router caches terminator IDs so that on reconnect it can tell the
  controller "these terminators are still good" instead of re-registering them --
  which is great for normal restarts, but it also means a quiesced terminator stays
  quiesced through the restart and needs an explicit dequiesce afterward.

Running dequiesce post-upgrade is safe in all cases. If every terminator on the
router has already healed on its own, dequiesce is a no-op.

Future versions of OpenZiti will likely extend quiesce to also raise the router's
routing cost to its maximum, so the router stops being used for transit traffic as
well as for terminator hosting; dequiesce will then drop the cost back to its
previous value. The drain pattern shown here is forward-compatible with that change
-- you'll get a broader drain "for free" when the feature lands.

Quiesce only helps if there's another router available to host the same service. A
single hosting router has nowhere to drain to, so quiesce on it will just stop new
connections from being accepted until the upgrade finishes and the terminators come
back.

## Helm chart upgrades

The official OpenZiti Helm chart (`openziti/helm-charts/charts/ziti-controller`)
deploys an HA cluster as **one Helm release per controller node**, not one release
with multiple replicas. Each release is a single-replica Deployment with
`strategy: Recreate`, backed by a per-release PVC for `cluster.dataDir`. There is
no orchestration in the chart that ties the releases together for upgrade
purposes -- `helm upgrade` against one release cycles exactly one pod and waits for
it to come back. Cross-release coordination is the operator's job.

A few specific things that matter when upgrading a Helm-deployed cluster.

### Snapshot first; the chart doesn't do it for you

The chart has no `pre-upgrade` hook that takes a database snapshot. You have to do
it yourself before running `helm upgrade`. From a shell with `kubectl` access:

```
kubectl exec -n <namespace> <leader-pod> -- \
  ziti agent controller snapshot-db /persistent/pre-upgrade.db
```

The snapshot lands on the controller's PVC inside the pod. Copy it out
(`kubectl cp`) and keep it alongside the previous chart version somewhere you can
get to without the cluster.

### Roll through releases one at a time

Upgrade each Helm release sequentially, waiting between them:

```
helm upgrade ziti-controller1 openziti/ziti-controller -f ctrl1-values.yaml --wait
# confirm the cluster sees ctrl1 at the new version
kubectl exec -n <namespace> <other-pod> -- ziti agent cluster list

helm upgrade ziti-controller2 ... --wait
# confirm again, then
helm upgrade ziti-controller3 ... --wait
```

`--wait` blocks only on the local release's pod becoming `Ready`, not on the
cluster as a whole being healthy. The intermediate `cluster list` is the only
signal that the upgraded node has rejoined the mesh and caught up.

### Pin the chart major version

The chart's version and the app version are loosely coupled and chart-level
breaking changes do happen. The v2 -> v3 transition consolidated PKI (separate
ctrl-plane / web roots merged into one edge-signer root) and made `cluster.mode` a
required value. Major-version chart upgrades typically need additional steps beyond
just `helm upgrade` -- re-issuing routers' enrollments, restarting deployments,
removing orphaned cert-manager resources. Pin to a major version in your Helm
dependency (`^3.0.0`) so you don't get one of these silently as part of a routine
update.

### Don't change `clientApi.advertisedHost`

The `clientApi.advertisedHost` value becomes part of every router and identity
enrollment that goes through that controller. Changing it on a running release
causes cert-manager to reissue the controller's cert with the new SAN, and existing
routers and SDK identities will then fail to reach the controller because they were
enrolled against the old FQDN. If you need to add a new DNS name, add it to
`clientApi.dnsNames` or `clientApi.altDnsNames` ahead of time so it's part of the
cert before any client needs it.

### Existing operator-targeted upgrade procedure

The chart's `README.md` covers the chart-version-specific steps in more detail.
Skim it before any chart major-version upgrade, in particular the "Breaking Change"
notes if they apply to your version transition.

## Rollback

If the upgrade is going wrong and you want to back out, the procedure depends on
how far you've gotten.

### Before any node finishes its first migration

If you've upgraded a node, started the new binary, but the schema migration hasn't
yet run to completion, you can stop the new binary, replace it with the previous
version, and start that -- the on-disk state is still in the old schema and the old
binary will pick it up.

In practice this is a narrow window, because the migration runs early in startup
and is usually fast. Don't count on being able to catch the upgrade here.

### After at least one node has migrated

Once the new binary has run its schema migration, the on-disk state is in the new
schema and the old binary won't understand it. The migration is one-way. Rollback
means restoring from the pre-upgrade snapshot you took in
[Before you upgrade](#before-you-upgrade-snapshot-the-cluster), following the
[Total cluster loss](./failure-scenarios.md#total-cluster-loss) procedure with the
previous binary installed on each host.

You'll lose anything written to the journal between when the snapshot was taken
and when you started the upgrade. That's why the snapshot at the start of the
upgrade procedure matters -- it's the recovery point for this scenario.

### When to actually roll back

Rollback is real cluster downtime followed by a re-bootstrap; it's not a step to
take lightly. Some heuristics:

* **A single node failing to start on the new binary** is usually a config or
  environment problem, not a reason to roll back the whole cluster. Investigate the
  failure on that node before rolling back. The other nodes are still on the old
  version and the cluster is in read-only mode but otherwise functional.
* **The whole cluster behaving incorrectly after every node has been upgraded**
  (e.g., wrong API responses, leadership flapping, routers unable to enroll) is a
  stronger signal. If you can't isolate the problem within a short window, rolling
  back to the snapshot is a reasonable next step.
* **Schema-level data corruption** is the strongest signal. If something in the
  migration produced bad on-disk state, you can't fix it forward; the snapshot is
  the only path back to a known-good model.
