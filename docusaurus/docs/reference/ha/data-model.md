---
sidebar_label: Data Model
sidebar_position: 80
---

# Controller HA Data Model

:::info

This document is likely most interesting for developers working on OpenZiti,
those curious about how distributed systems work in general, or curious
about how data is distributed in OpenZiti.

:::

## Model Data

### Model Data Characteristics

* All data required on every controller
* Read characteristics
    * Reads happen all the time, from every client and as well as admins
    * Speed is very important. They affect how every client perceives the system.
    * Availability is very important. Without reading definitions, can’t create new connections
    * Can be against stale data, if we get consistency within a reasonable timeframe (seconds to
      minutes)
* Write characteristics
    * Writes only happen from administrators
    * Speed needs to be reasonable, but doesn't need to be blazing fast
    * Write availability can be interrupted, since it primarily affects management operations
    * Must be consistent. Write validation can’t happen with stale data. Don’t want to have to deal
      with reconciling concurrent, contradictory write operations.
* Generally involves controller to controller coordination

Of the distribution mechanisms we looked at, Raft had the best fit.

### Raft Resources

For a more in-depth look at Raft, see

* https://raft.github.io/
* http://thesecretlivesofdata.com/raft/

### Raft Characteristics

* Writes
    * Consistency over availability
    * Good but not stellar performance
* Reads
    * Every node has full state
    * Local state is always internally consistent, but maybe slightly behind the leader
    * No coordination required for reads
    * Fast reads
    * Reads work even when other nodes are unavailable
    * If latest data is desired, reads can be forwarded to the current leader

So, the OpenZiti controller uses Raft to distribute the data model. Specifically, it uses the
[HashiCorp Raft Library](https://github.com/hashicorp/raft/).

### Updates

The basic flow for model updates is as follows:

1. A client requests a model update via the REST API.
2. The controller checks if it is the Raft cluster leader. If it is not, it forwards the request to
   the leader.
3. Once the request is on the leader, it applies the model update to the Raft log. This involves
   getting a quorum of the controllers to accept the update.
4. One the update has been accepted, it will be executed on each node of the cluster. This will
   generate create one or more changes to the bolt database.
5. The results of the operation (success or failure) are returned to the controller which received
   the original REST request.
6. The controller waits until the operation has been applied locally.
7. The result is returned to the REST client.

### Reads

Reads are always done to the local bolt database for performance. The assumption is that if
something like a policy change is delayed, it may temporarily allow a circuit to be created, but as
soon as the policy update is applied, it will make changes to circuits as necessary.

## Runtime Data

In addition to model data, the controller also manages some amount of runtime data. This data is for
running OpenZiti's core functions, i.e. managing the flow of data across the mesh, along with
related authentication data. So this includes things like:

* Links
* Circuits
* API Sessions
* Sessions
* Posture Data

### Runtime Data Characteristics

Runtime data has different characteristics than the model data does.

* Not necessarily shared across controllers
* Reads **and** writes must be very fast
* Generally involves sdk to controller or controller to router coordination

Because writes must also be fast, Raft is not a good candidate for storing this data. Good
performance is critical for these components, so they are each evaluated individually.

### Links

Each controller currently needs to know about links so that it can make routing decisions. However,
links exist on routers. So, routers are the source of record for links. When a router connects to a
controller, the router will tell the controller about any links that it already has. The controller
will ask to fill in any missing links and the controller will ensure that it doesn't create
duplicate links if multiple controllers request the same link be created. If there are duplicates,
the router will inform the controller of the existing link.

The allows the routers to properly handle link dials from multiple routers and keep controllers up
to date with the current known links.

### Circuits

Circuits were and continue to be stored in memory for both standalone and HA mode
controllers.Circuits are not distributed. Rather, each controller remains responsible for any
circuits that it created.

When a router needs to initiate circuit creation it will pick the one with the lowest response time
and send a circuit creation request to that router. The controller will establish a route. Route
tables as well as the xgress endpoints now track which controller is responsible for the associated
circuit. This way when failures or other notifications need to be sent, the router knows which
controller to talk to.

This gets routing working with multiple controllers without a major refactor. Future work will
likely delegate more routing control to the routers, so routing should get more robust and
distributed over time.

### Api Sessions, Sessions, Posture Data

API Sessions and Sessions are moving to bearer tokens. Posture Data is now handled in the routers.
