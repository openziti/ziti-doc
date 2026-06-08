---
sidebar_label: Topology
sidebar_position: 60
---

# Controller Topology

This document discusses cluster size and member placement.

## Number of Controllers

### Management

The first consideration is how many controllers the network should be able to lose without losing
functionality. A cluster of size N needs (N/2) + 1 voting members connected to be able
to take model updates, such as provisioning identities, adding/changes services and updating policies.

Since a two node cluster will lose some functionality if either node becomes unavailable, a minimum
of 3 nodes is recommended.

### Clients

The functionality that controllers provide to clients doesn't require any specific number of controllers.
A network manager will want to scale the number controllers based on client demand and may want to 
place additional controllers geographically close to clients for better performance.

## Voting vs Non-Voting Members

Because every model update must be approved by a quorum of voting members, adding a large number of voting
members can add a lot of latency to model changes. A three node cluster in the same data center would 
likely need a few 10s of milliseconds. A cluster with a quorum on a single continent might take a hundred
milliseconds, and one that had to traverse large portions of the globe might take half a second.

If the network has enough voting members to meet availability needs, then additional controllers added
for performance reasons should be added as non-voting members.

Additionally, having a quorum of controllers be geographically close will reduce latency without necessarily
reducing availability.

### Example

**Requirements**

1. The network should be able to withstand the loss of one voting member.
1. Controllers should exist in the US, EU and Asia, with two in each region. 

To be able to lose one voting member, we need three voting nodes, with six nodes total.

We should place 2 voting members in the same region, but in different availability zones/data centers.
The third voting member should be in a different region. The rest of the controllers should be non-voting.

**Proposed Layout**

So, using AWS regions, the network might have:

* One in us-east-1 (voting)
* One in us-west-2 (voting)
* One in eu-west-3 (voting)
* One in eu-south-1 (non-voting)
* One in ap-southeast-4 (non-voting)
* One in ap-south-2 (non-voting)

Assuming the leader is one of us-east-1 or us-west-2, model updates will only need to be accepted by 
one relatively close node before being accepted. All other controllers will recieve the updates as well,
but updates won't be gated on communications with all of them.

**Alternate**

For even faster updates at the cost of an extra controller, two controllers could be in the US Eastern DC: one in us-east-1
and one in us-east-2. The third member could be in the EU. Updates would now only need to be approved by two 
very close controllers. If one of them went down, updates would slow down, since updates would need to be done
over longer latencies, but they would still work.

* One in us-east-1 (voting)
* One in us-east-2 (voting)
* One in us-west-2 (non-voting)
* One in eu-west-3 (voting)
* One in eu-south-1 (non-voting)
* One in ap-southeast-4 (non-voting)
* One in ap-south-2 (non-voting)


