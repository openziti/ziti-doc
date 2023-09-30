---
sidebar_label: Session Diagram
---

# Sessions and Connections Sequence Diagram

OpenZiti has a number of different connection and session types.  It is important to understand the different scopes and uses of these connections in working with the project, developing, operating, and most importantly, troubleshooting.

```textermaid
sequenceDiagram
title Ziti Sessions and Connections

participant Client Application
participant SDK 1
participant Edge Router 1
participant Network Controller
participant Edge Router 2
participant SDK 2
participant Application Server

par Control Plane
	SDK 1 ->> Network Controller: API Session
and 
	SDK 2 ->>Network Controller: API Session
and 
	Edge Router 1 ->> Network Controller: API Session
and 
	Edge Router 2 ->> Network Controller: API Session
end

par Edge Control Plane
	SDK 1 ->> Network Controller: 
and 
	SDK 2 ->>Network Controller: Session (per service)
and 
	Edge Router 1 ->> Network Controller: Session (per service)
and 
	Edge Router 2 ->> Network Controller: Session (per service)
end

par Data Plane (TCP)
	Client Application ->> SDK 1 : TCP Connection
and
	Server Application ->> SDK 2 : TCP Connection
end

par Data Plane (Edge)
	SDK 1 ->> Edge Router 1: Conn
and 
	Edge Router 2 ->> SDK 2: Conn
end

Edge Router 1 ->> Edge Router 2: Circuit
```

## Control Plane

1. The API Session is the first and primary session between and endpoint and the OpenZiti network instance.  This session is created during attachment, after validating the certificates in both directions, and the endpoint name.  This makes the endpoint present on the network, and all endpoints and routers have API sessions to the Controller(s)
2. The Session is created with the API Session authorization, and is specific to each service configured for the endpoint.  The Session object holds information such as the service policies, parent API Session, service ID, and other information the endpoint and network require to properly service each given service.
3. Channels are formed between the endpoint and each Edge Router available and within the policies.  These channels are monitored for latency to select best path, and are the control connections for incoming connections for hosted services.
4. Links connect Edge Routers logically.  Edge Routers can advertise a listener socket, which is distributed during client initialization to other Edge Routers.  All Edge Routers will attach to all others in a mesh, provided the policy dictates/allows it.  Each pair of routers will have one link per link type (TLS, WSS, etc.)  Links are a split connection, having both control plane and data plane messaging.

## Data Plane

  1. The TCP connections at either end of an OpenZiti connection are dependent on the implementation model.  If Tunnelers, or Edge Router with embedded Tunnelers are used, and the end device makes a TCP connection to gain entry to the OpenZiti network.  If the endpoints, both dialing and binding, or either one, is fully embedded via the SDK, these connections will not exist.
  2. The Connection is the flow specific connection between the endpoint and the initial Edge Router.  Each service invocation will create an independent Connection, and data will flow over this to the Edge Router
  3. The Fabric Circuit is the path in the OpenZiti Network from initial to terminating Edge Router, comprised of one more more Edge Routers, and zero or more Links. (An initiating Edge Router may have a local terminator for the service) 

These terms in their full and abbreviated forms appear in logs, metrics, and software, and are therefore critical terminology to understand OpenZiti Networks.
