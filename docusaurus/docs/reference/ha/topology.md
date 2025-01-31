---
sidebar_label: Topology
sidebar_position: 60
---

# Controller Topology

This document discuss considerations for how many controllers a network might 
need and how to place them geographically.

## Number of Controllers

### Management

The first consideration is how many controllers the network should be able to lose without losing
functionality. A cluster of size N needs (N/2) + 1 controllers active and connected to be able
to take model updates, such as provisioning identities, adding/changes services and updating policies.

Since a two node cluster will lose some functionality if either node becomes unavailable, a minimum
of 3 nodes is recommended.

### Clients

The functionality that controllers provide to clients doesn't require any specific number of controllers.
A network manager will want to scale the number controllers based on client demand and may want to 
place additional controllers geographically close to clusters of clients for better performance.

## Voting vs Non-Voting Members

Because every model update must be approved by a quorum of voting members, adding a large number of voting
members can add a lot of latency to model changes. 

If more controllers are desired to scale out to meet client needs, only as many controllers as are needed
to meet availability requirements for mangement needs should be made into voting members.

Additionally a having a quorum of controllers be geographically close will reduce latency without necessarily
reducing availability.

### Example

**Requirements**

1. The network should be able to withstand the loss of 1 voting member
1. Controllers should exist in the US, EU and Asia, with 2 in each region. 

To be able to lose one voting member, we need 3 voting nodes, with 6 nodes total.

We should place 2 voting members in the same region, but in different availability zones/data centers.
The third voting member should be in a different region. The rest of the controllers should be non-voting.

**Proposed Layout**

So, using AWS regions, we might have:

* 1 in us-east-1 (voting)
* 1 in us-west-2 (voting)
* 1 in eu-west-3 (voting)
* 1 in eu-south-1 (non-voting)
* 1 in ap-southeast-4 (non-voting)
* 1 in ap-south-2 (non-voting)

Assuming the leader is one of us-east-1 or us-west-2, model updates will only need to be accepted by 
one relatively close node before being accepted. All other controllers will recieve the updates as well,
but updates won't be gated on communications with all of them.

**Alternate**

For even faster updates at the cost of an extra controller, two controllers could be in us-east, one in us-east-1
and one in us-east-2. The third member could be in the eu. Updates would now only need to be approved by two 
very close controllers. If one of them went down, updates would slow down, since updates would need to be done
over longer latencies, but they would still work.

* 1 in us-east-1 (voting)
* 1 in us-east-2 (voting)
* 1 in us-west-2 (non-voting)
* 1 in eu-west-3 (voting)
* 1 in eu-south-1 (non-voting)
* 1 in ap-southeast-4 (non-voting)
* 1 in ap-south-2 (non-voting)


