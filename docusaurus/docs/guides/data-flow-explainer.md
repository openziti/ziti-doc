---
title: Data Flow Explainer
sidebar_label: Data Flow Explainer
sidebar_position: 30
---

# Data Flow Explainer

This explainer walks through how data flow is established in an OpenZiti network.

## Baseline

This diagram shows the components of the example network.

![image](/img/data-flow/baseline.png)

It has the following components:

* An OpenZiti controller
* Two OpenZiti routers that are available via the public internet
* Two private networks, each containing a router and an application server
    * The application servers are serving up the same application. There are multiple servers, so
      that load can be spread across them. They are in separate regions to ensure that the
      application can still be accessed, even if a datacenter becomes unavailable.
* An SDK application which wants to access the application hosted by the application servers

## Control Channels

When a router starts up it will attempt to make a connection to the controller(s) in its
configuration file. This establishes the control plane, which allows controllers to update router
state as needed and allows routers to report changes, metrics and events back to the controller.

![image](/img/data-flow/ctrl-to-router.png)

## Data Links

Once a router is connected to the controller, the controller will inform the router of other routers
along with information about if and how those routers are listening for data links connections. The
router will then attempt to establish data links to other routers, so it can participate in the data
mesh.

![image](/img/data-flow/router-links.png)

## Terminators/Last Hop

Data links establish inter-router connectivity, but a way to establish connectivity to the
application servers is still needed. The service definition on its own doesn't specify how to
connections to the application servers should be made. Connectivity to the application servers is
handled by terminators.

![image](/img/data-flow/terminators.png)

There are three common ways in which this is done.

### Static Terminators

A static terminator can be created by an OpenZiti admin. The terminator will specify the address to
dial. Statically created terminators will exist until they are deleted or their related service or
router is deleted.

### SDK Hosted

When an SDK application hosts (or binds, in OpenZiti terms) a service, it will first connect to one
or more edge routers. It can then request those edge routers to create terminators on its behalf.
When the SDK app disconnects from the edge router, the terminator will automatically be cleaned up.

The SDK application may handle incoming connections itself, or if it's acting as a reverse proxy, it
may bridge the connection to another application server. The OpenZiti tunneler applications can do
this and will use the `host.v1` or `host.v2` configurations to define how and where connections are
forwarded to and what kind of health checks to run.

### Edge Router Hosted

Edge routers running in tunneler mode (ER/T) can also host services by acting as a reverse proxy.
They will also use the `host.v1` and `host.v2` configurations, same as the SDK based tunnelers. An
ER/T will create and delete terminators as services, configurations and policies are created,
updated or deleted.

## Client Connections

When an SDK wants to connect to an OpenZiti hosted service, it will initiate the following sequence
of events:

1. Authenticate to the controller
2. Create a service session for the desired service
3. Connect to one or more edge routers
4. Send a Dial request to the selected edge router
5. The edge router will send a create circuit request to the controller
6. The controller will find the least expensive path
7. The controller will send route updates to non-terminal elements of the path
8. The controller will instruct the terminating router to dial the service
9. Once the circuit is established, data can begin to flow

### Authentication

As a first step, the SDK must be authenticated to the controller. The result of a successful
authentication is an API Session. The SDK will use the API Session to make additional requests to
the control and to authenticate with edge routers. In order for edge routers to be able to verify
API Sessions from connecting SDKs, the controller must inform routers of each new API Session as they are
created.

![image](/img/data-flow/client-api-session.png)

An API Session can be extended, so a single API Session can generally be used for the lifetime of
the application. A new API Session may be required if the application is unable to reach the
controller for an extended period of time.

### Create Service Session

The SDK must now create service session. When creating a service session, the controller will verify
that the identity used by the SDK has permission to access the service. The controller will also see
which edge routers can be used to access the session. The set of edge routers will be returned along
with the session token.

![image](/img/data-flow/client-session.png)

### Connect to Edge Routers

The returned session contains the edge routers that can be used for this service along with the
address or addresses that each router is listening on for SDK connections. The SDK will connect to
the edge routers and use whichever one connects the fastest. The edge router connections are not
per-service, but will be shared by all services. If the connections are already made, the SDK will
prefer connections with lower latency.

The connection is made with mutual TLS. The SDK will also provide the API Session token to the edge
routers, allowing them to validate the connection. When the API Session becomes invalid, edge
routers will be notified and connections associated with that API Session will be terminated.

![image](/img/data-flow/edge-router-connect.png)

### Dial the Service

The SDK will pick an edge router and send it a Dial request for desired service along with the
service session token. The edge router selected is known as the initiating router. The edge router
will translate this into a 'create circuit' request to the controller. The controller will select a
path and will message the routers in the path, so they can update their routing tables and/or make
connections to application servers as necessary.

The path will be selected based on the cost of the terminators available on that service, plus the
cost of the routers and links from the initiating router to the terminator's router. The last router
in the path is called the terminating router.

* Router costs can be set via the management API. There is also a configurable minimum router cost.
  A minimum cost will prevent paths from adding unnecessary hops or from bouncing between two
  similar paths.
* Link costs are currently based on the link's round-trip latency
* Terminators have a static cost which can be managed via the management API for static
  terminators, or via the SDK for dynamic terminators.
* Terminators also have a dynamic cost. The more circuits on a terminator, the higher the cost. As
  circuits are torn down, the cost goes back down. Dial failures will also temporarily raise the
  dynamic terminator cost.

![image](/img/data-flow/dial.png)

### Established Circuit

Once the routing and connection to the application server are established, the circuit is made. The
controller notifies the initiating router and data can now flow between the SDK and the application
server.

![image](/img/data-flow/circuit.png)

