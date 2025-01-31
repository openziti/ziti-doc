# Controller HA 

## Overview

:::warning

**NOTE: Controller HA is still in Beta** 

It's quite functional now, but we are continuing to test and refine before we mark it GA.
:::

### What Do Controllers Do?

OpenZiti controllers have two primary functions.

#### Data Model

Controller maintain the data model, which tracks services, routers, policies, etc. They provide
this information to sdk clients, tunnelers and routers so that those applications know what 
their capabilities are. 

#### Establish Routes

Controllers establish routes for services on the behalf of clients and routers. They also 
update routes when better paths are available or when network topology changes, i.e. a link
is broken or a router goes down.

### Why Cluster Controllers?

Every SDK client and tunneler adds load to controllers. It's important to be able to add 
controllers to ensure good performance for clients. 

Additionally, having a single controller means that the network has a single point of failure.
Having multiple controllers helps ensure that the network is available in the face up 
upgrades, hardware or network failures and other unexpected failure conditions.

Having multiple controllers also allows network operators to place controllers geographically
close to clusters of clients to reduce latency.

### For SDK Clients/Tunnelers

A controller cluster offers the following advantages:

1. Horizontal scaling of SDK client services such as
    1. Service lookups
    1. Session creation
1. Horizontal scaling of circuit creation

This means that for everything that SDK clients and tunnelers depend on, controllers
can be scaled out and placed strategically to meet user demand. 

### For Management Operations

The HA controller cluster makes the data model available on all controllers in the cluster.
This means that clients can connect to any controller and be able to function. 
Updates require coordination, so a minimum number of controllers are required to be 
up and connected for updates to work.

1. Every controller has the full data model, so reads don't require any coordination
1. If a controller is disconnected from the cluster while updates are happening, reads
   to that controller will return stale data. As soon as the controller reconnects, the
   data model on that controller will catch up the current state.
1. Update operations require that the cluster has a leader and that more than half of the
   controllers are up and able to communicate with each other.
1. Updates can be initiated on any controller, they will be forwarded to the leader to
   be applied.

### Glossary

#### Distributed Journal

OpenZiti uses a distributed journal to keep the data model in sync across controllers.

Specifically, it uses the RAFT protocol.

**Resources**

* [Raft Overview](https://raft.github.io/)
* [Understanding Raft](http://thesecretlivesofdata.com/raft/)
* [Raft Implementation used by OpenZiti](https://github.com/hashicorp/raft)

#### Leader

The cluster leader is in charge of coordinating updates to the data model. The cluster
handles leader selection on its own. The cluster will hold elections to select the
leader and leadership will move from node to node. 

If the leader goes down, a new leader will be elected. 

#### Voting

Raft Clusters have voting and non-voting members. The more voting members a cluster has, the 
more voting members can be off-line while still accepting updates.

Only voting members may be elected to cluster leader.

For example:

* A cluster with one voting member (which is allowed) can have no members down
* A cluster with three voting members can have one member down
* A cluster with five voting members can have two members down
* A cluster with seven voting members can have three members down

The general formula is that a cluster with N voting members must have (N/2)+1 voting members
up and connected in order to elect a leader and accept updates to the data model.

#### Non-Voting Members

If more voting members means better availability, why not make all members voting?

The more members a leader has to coordinate with to accept a data model update, the longer the
update may take. Once the network has enough voting members to meet the uptime SLAs, other
members add for performance reasons should be made non-voting members.

### Limitations

The following limitations currently apply:

1. Circuits are owned by a controller. If the controller goes down, the circuit 
   will remain up, but can't be re-routed for performance or if a router goes down.
   This matches the behavior of circuits on a network with a standalone controller.

1. For a controller to route circuits on a router, that router must be connected
   to that controller. This means that routers should generally be connected to
   all controllers.

Improving routing is an ongoing focus for the OpenZiti project. 
Issues related to routing improvments can be found on the [Routing Project Board](https://github.com/orgs/openziti/projects/13/views/1).
