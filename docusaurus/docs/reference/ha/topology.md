---
sidebar_label: Topology
sidebar_position: 60
---

# Controller topology

This document is about how to size and place the controllers in an HA cluster. The
decisions break down into four:

* **How many voters** the cluster has -- sets failure tolerance and write latency.
* **How many non-voters** the cluster has -- scales reads and regional coverage
  without affecting write availability.
* **Where the controllers run** -- geographic placement determines how fast a write
  commits.
* **Which voters are acceptable leaders** -- controlled by the `preferredLeader`
  flag, lets you steer leadership toward a low-latency quorum.

One question that comes up often is whether to put a load balancer in front of the
cluster. The short version: don't. Routers and the enrollment flow won't work
through an LB at all, and SDK clients don't need it. There's a section below that
walks through why, with the nuances.

The rest of this page walks through each decision, with worked examples at the end.

## Picking a cluster size: 3 vs 5 vs 7 voters

Voters are the controllers that participate in raft consensus. Every model update
needs an ACK from a majority of voters before it commits, so the voter count drives
both how many voter losses the cluster tolerates and how fast writes are.

| Voters | Quorum | Voter losses tolerated | Voters that must ACK each write |
| --- | --- | --- | --- |
| 1 | 1 | 0 | 1 (just the leader) |
| 3 | 2 | 1 | 2 |
| 5 | 3 | 2 | 3 |
| 7 | 4 | 3 | 4 |

**3 voters** is the smallest cluster that actually buys you HA. It survives one
voter loss and only needs one extra ACK per write. This is the right starting point
for almost everyone.

**5 voters** survives two simultaneous voter losses. Pick this when the cost of an
outage is high enough that "one node down for maintenance + one node fails" needs to
still keep writes flowing, or when you're spreading voters across enough regions
that you expect occasional partitions to take a voter off the majority side.

**7 voters** survives three. Rarely worth it. Every additional voter adds latency
to every write because the leader has to wait for one more ACK to reach quorum, and
the failure tolerance you're buying is increasingly unlikely to be the failure mode
that actually hits you.

**Use odd voter counts.** The code doesn't enforce it, but even-sized voter
clusters are strictly worse than the next odd number down. A 4-voter cluster
tolerates only 1 loss (same as 3), but writes need 3 ACKs instead of 2. A 6-voter
cluster tolerates 2 (same as 5) and needs 4 ACKs. Stick to 3, 5, or 7.

If you need more controllers than your chosen voter count -- for read scale,
regional coverage, or both -- add them as non-voters. That's the next section.

## Voters and non-voters

A cluster has two kinds of members.

**Voters** participate in raft consensus. They vote in leader elections, can be
elected leader, and every write needs an ACK from a majority of them before it
commits.

**Non-voters** receive the journal but don't vote and can't be elected leader. They
hold the full data model and serve reads exactly like voters do.

All non-leader controllers -- voter followers and non-voters alike -- handle writes
the same way: a client request is forwarded to the current leader, the leader
commits the write through raft, and the result comes back through the controller
the client connected to. So from a client's perspective there is no functional
difference between connecting to a voter follower and connecting to a non-voter.
The voter/non-voter distinction only matters for raft itself: whether the node's
vote counts toward quorum, and whether it's eligible to be elected leader.

### When to add non-voters instead of more voters

Once your voter count meets your failure-tolerance needs, additional controllers
should be non-voters. Two reasons:

1. **Writes get slower with every voter.** The leader has to collect ACKs from a
   majority before committing. More voters means a larger majority, and if voters
   are geographically spread, the leader has to wait for the slowest member of that
   majority every time.
2. **Non-voters cost nothing on writes.** They get the journal asynchronously and
   never block a commit. You can add as many as you want without slowing writes
   down.

So the pattern is: pick a voter count for failure tolerance (3, 5, or 7), then add
non-voters wherever you need more local read capacity or regional coverage.

## Geographic placement

The leader has to wait for ACKs from a quorum of voters before every write commits.
That ACK round trip is real network time. If your voters are spread across
continents, every write pays the cost of reaching the slowest voter in the quorum.

Some ballpark numbers:

| Voter spread | Round-trip ACK to a single voter |
| --- | --- |
| Same data center | ~1 ms |
| Same region, different AZ | ~5-10 ms |
| Same continent | ~30-80 ms |
| Cross-continent | ~150-300 ms |

Those are per-write, and they add up fast when you're provisioning identities or
doing batch policy changes.

### Keep a quorum close

The trick is to put a *quorum's worth* of voters geographically close together, so
a write can commit on local-region latency. Voters beyond that quorum can be
anywhere -- they receive the journal but don't block commits.

In a 3-voter cluster, the quorum is 2. So put two voters in the same region
(ideally different availability zones so an AZ failure doesn't take both) and put
the third voter somewhere else. As long as the leader is one of the two close
voters, writes commit on intra-region latency. If the leader is the distant voter,
every write pays cross-region latency. That's where
[`preferredLeader`](#steering-leadership-with-preferredleader) comes in -- covered
in the next section.

In a 5-voter cluster, the quorum is 3. Put three voters in the same region, with
the remaining two anywhere. Same principle.

### Spread non-voters wherever clients are

Non-voters don't enter into the write-latency calculation at all, so you can put
them wherever your clients are. Each region with significant client population gets
its own non-voter (or non-voters) so that SDK clients have a low-latency controller
to talk to for reads, authentication, and circuit creation.

A region with a non-voter doesn't need a voter, and a region with a voter doesn't
need a non-voter -- the same controller does both jobs for the clients in that
region. The only reason to add non-voters in a voter region is to handle more
client load than a single controller can serve.

## Steering leadership with `preferredLeader`

Geographic placement only helps if the leader happens to be in the close-together
region. If raft picks the distant voter as leader (which it can, since any voter is
eligible by default), every write pays cross-region latency until leadership
changes.

`preferredLeader` is the knob that fixes this. Mark a voter as preferred by setting
the following in its controller config:

```yaml
cluster:
  preferredLeader: true
```

When the cluster has at least one preferred voter and a non-preferred voter is
elected leader, the cluster automatically transfers leadership to a preferred peer
about 10 seconds after the election. The end state is that leadership lives on a
preferred voter whenever one is available.

### Mark the whole close quorum, not just one node

The natural inclination is to pick one specific voter and make it preferred. Don't.
If exactly one node is preferred and that node goes down, leadership will move to a
non-preferred voter (correctly -- the cluster needs *some* leader). When the
preferred node comes back, leadership will bounce to it again. That's two
unnecessary leader transitions for what could have been zero.

Mark every voter in your close-together region as preferred instead. Leadership
will land on whichever one is up, and you won't get bounce-back churn on recovery.

Take the 3-voter cluster from the previous section: two voters in region A, one
voter in region B. Mark both region-A voters as preferred. Leadership stays in
region A as long as either of them is up. Writes always commit on intra-region
latency unless both region-A voters are simultaneously down.

### Manual transfers still work, but bounce back

If you run `ziti agent cluster transfer-leadership` to move leadership manually, the
auto-transfer logic still applies. If the target you picked isn't preferred (and a
preferred peer is up), leadership will bounce back about 10 seconds later. To park
leadership on a specific non-preferred node deliberately, you'd have to disable the
preferred flag on the others, which is more trouble than it's worth in normal
operation. See [Failure scenarios -> Leader loss and
elections](./failure-scenarios.md#leader-loss-and-elections) for the full mechanics.

## Don't front controllers with a load balancer

The cluster handles its own endpoint distribution and client failover, so it
doesn't need an external load balancer. More importantly, putting one in the path
breaks several things that depend on direct controller connectivity.

### What won't work

**Enrollment.** Enrollment JWTs are signed with each controller's server cert/key
pair. A TLS-terminating load balancer presents its own certificate to clients,
which breaks both the mTLS handshake and the JWT signature validation the SDK does
on receipt. This is the most common way operators get burned by a load balancer in
front of a cluster.

**Router-to-controller traffic.** Routers maintain persistent mTLS connections to
the controllers in their endpoints list. They use those connections for the
data-model snapshot stream, cluster membership updates, terminator changes, and
circuit creation messaging. None of that survives an LB hop, whether the LB
terminates TLS or passes it through; the control-plane protocol isn't HTTP.

**Controller-to-controller mesh.** The raft journal and command-forwarding traffic
between controllers is similarly direct, persistent, mTLS-authenticated, and not a
fit for any kind of LB.

### What could work but doesn't help

Post-enrollment SDK traffic to the edge client API would technically function
through a TLS pass-through LB (mTLS is preserved, the request is plain HTTPS, and
session tokens work cluster-wide because they're stored in raft). But SDK clients
don't need it:

* Every controller serves `GET /edge/client/v1/controllers`, which returns the live
  list of cluster members with their real addresses.
* SDK clients use that list to talk directly to controllers and fail over among
  them when one is unreachable.

So an LB in front of the edge client API adds a hop, an extra failure domain, and
a layer of state that has to be kept in sync with cluster membership, all for zero
functional gain. The cluster's own discovery mechanism is doing the same job
better.

### What to do instead

If you want a single DNS name that points clients at the cluster, use plain DNS --
round-robin records or a health-checked DNS resolver are both fine, because they
don't sit in the path of the actual connection. They give clients an initial
address to hit; from there, the cluster takes over via
`/edge/client/v1/controllers` and the router endpoints file.

## Worked examples

### Single region, three voters

Simplest production-ready layout. Three voters in the same region, in different
availability zones so an AZ failure doesn't take the cluster down.

* One in us-east-1a (voting)
* One in us-east-1b (voting)
* One in us-east-1c (voting)

No `preferredLeader` flags needed: every voter is equally acceptable as leader, so
there's nothing to steer leadership toward or away from. Writes commit at intra-AZ
latency. Tolerates one AZ failure.

If clients are concentrated in us-east, no non-voters are needed. If clients also
exist in other regions, add non-voters near them -- see the next example.

### Multi-region, six nodes

**Requirements**

1. The network should withstand the loss of one voting member.
2. Controllers should exist in the US, EU and Asia, with two in each region.

Three voters, six nodes total, with two voters in one region and the third in
another for partition resilience.

* One in us-east-1 (voting, preferred)
* One in us-west-2 (voting, preferred)
* One in eu-west-3 (voting)
* One in eu-south-1 (non-voting)
* One in ap-southeast-4 (non-voting)
* One in ap-south-2 (non-voting)

The two US voters are marked preferred, so leadership stays in the US whenever a
US voter is up. Writes only need an ACK from one other voter to reach quorum; with
the leader in us-east-1 or us-west-2, the close pairing keeps commits on
intra-continent latency. The EU voter is there to keep quorum reachable if the
entire US region partitions away. Clients in EU and Asia connect to local
non-voters for low-latency reads.

### Multi-region, tighter quorum

Same shape as the previous example, but pays for one extra controller to put the
two US voters in the same metro area. us-east-1 and us-east-2 are both voters now
(a few milliseconds apart); us-west-2 stays in the deployment but drops to
non-voting. Total node count goes from 6 to 7.

* One in us-east-1 (voting, preferred)
* One in us-east-2 (voting, preferred)
* One in us-west-2 (non-voting)
* One in eu-west-3 (voting)
* One in eu-south-1 (non-voting)
* One in ap-southeast-4 (non-voting)
* One in ap-south-2 (non-voting)

Writes only need an ACK from us-east-1 or us-east-2 (whichever isn't leader) and
complete in single-digit milliseconds. If one of the East voters goes down, writes
still work but slow to cross-continent latency (the leader has to wait for an ACK
from eu-west-3) until the missing East voter comes back. If both US voters go
down, the cluster loses quorum: eu-west-3 is the only surviving voter, and
non-voters don't count toward quorum no matter how many of them are reachable.
Recovery in that case is either to bring a US voter back or to treat it as total
cluster loss; see [Failure scenarios](./failure-scenarios.md#loss-of-quorum).

### Single region, five voters

Use this when you want intra-region write latency in the common case *and* the
ability to survive simultaneous voter losses. The classic case is a network where
a controller might be down for maintenance and another voter fails at the same
time -- a 3-voter cluster loses quorum in that scenario; a 5-voter cluster keeps
writing.

* One in us-east-1a (voting, preferred)
* One in us-east-1b (voting, preferred)
* One in us-east-1c (voting, preferred)
* One in us-west-2 (voting)
* One in eu-west-3 (voting)

Quorum is 3. With three voters in us-east-1 across AZs, leadership stays on a
preferred voter, and the quorum forms entirely within us-east-1. Writes commit at
intra-region latency in the common case.

Failure tolerance is the point of the extra voters. If two of the us-east-1 AZs
go down at once -- rare but real, especially during a regional incident -- you
still have one us-east-1 voter plus us-west-2 plus eu-west-3 (3 voters total =
quorum), so writes keep working. They'll slow to cross-region latency until the
missing us-east-1 voters come back, since the leader now has to wait for an ACK
from a distant voter, but the cluster stays available.

If the entire us-east-1 region drops off, you're left with us-west-2 and eu-west-3
(2 voters), which is below quorum. For full single-region-outage survival, you'd
want a 2+2+1 layout across three regions instead, at the cost of every write
paying cross-region latency in the common case. That trade is rarely worth it,
but if you need it, it's there.
