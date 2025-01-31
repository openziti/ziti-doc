# Controller HA 

## Overview

Ziti controllers can be run in a cluster for high availablity and performance scaling.

:::danger

**NOTE: Controller HA is still in Beta** 

It's quite functional now, but we are continuing to test and refine before we mark it GA.
:::


### For SDK Clients/Tunnelers

A controller cluster offers the following advantages:

1. Horizontal scaling of SDK client services such as
    1. Service lookups
    1. Session creation
1. Horizontal scaling of circuit creation

This means that for everything that SDK clients and tunnelers depend on, controllers
can be scaled up and placed strategically to meet user demand. 

The following limitations currently apply:

1. Circuits are owned by a controller. If the controller goes down, the circuit 
   will remain up, but can't be re-routed for performance or if a router goes down.
2. For a controller to route circuits on a router, that router must be connected
   to that controller. This means that routers should generally be connected to
   all controllers.

### For Network Operations

The HA controller cluster uses a distributed journal [Raft](https://raft.github.io/) to 
keep the data model synchronized across controllers. This has the following ramifications:

1. Read operations will work on any controller that is up. If the controller is 
   disconnected from the cluster, the reads may return data that is out of date.
2. Update operations require that the cluster has a leader and that a quorum of nodes
   is available. A quorum for a cluster of size N is (N/2)+1. This means that a 3 node 
   cluster can operate with 2 nodes and a 5 node cluster can operate with 3 nodes, and 
   so on. 
3. Updates can be initiated on any controller, they will be forwarded to the leader to
   be applied.
4. The cluster may have non-voting members. 
