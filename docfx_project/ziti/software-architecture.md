---
uid: zitiSoftwareArchitecture
---

# Software Architecture

This article describes the internal software architecture of Ziti. In most scenarios, this information is not essential
to deploy and operate a Ziti Network. While not strictly necessary, understanding the internal model can help operators
intuit Ziti functionality, understand design decisions, and smooth the road for intrepid contributors.

The simplest way to describe a Ziti Network is to by describing the binary outputs of the OpenZiti GitHub repositories.
If we did so the components would be: Ziti Controller, Ziti Edge Router, Ziti Fabric Router, and Ziti Clients. However,
internally the code is divided up into four main groupings:

- Fabric - https://github.com/openziti/fabric
- Edge - https://github.com/openziti/edge
- SDKs
    - https://github.com/openziti/ziti-sdk-c
    - https://github.com/openziti/ziti-sdk-jvm
    - https://github.com/openziti/ziti-sdk-py
    - https://github.com/openziti/sdk-golang
    - https://github.com/openziti/ziti-sdk-nodejs
    - https://github.com/openziti/ziti-sdk-js
    - https://github.com/openziti/ziti-sdk-csharp
    - https://github.com/openziti/ziti-sdk-swift
    - https://github.com/openziti/ziti-sdk-rb
    - ...and more
- Clients
    - https://github.com/openziti/ziti-tunnel-sdk-c
    - https://github.com/openziti/ziti-tunnel-apple
    - https://github.com/openziti/desktop-edge-win
    - ...and others

## Fabric

Each of the above build upon each other with the Fabric repository as the base. It is the only repository that can be
used on its own and have a semblance of network connectivity. From the Fabric repository alone, one can build a
fabric-only controller and router binaries. The capabilities of these components will be limited and require
low-level configuration and maintenance. If done, a mesh network will be established that can be used to send
data from any point on the network to any other through a circuit that defines the client, the destination service, and
a terminator.

Without additional code, there will be a general lack of initiation-side security (i.e., anything can connect)
and a stark lack of connectivity options both on the client and service side. The Fabric on its own does not present any
facilities that allow SDKs to connect to it. It does not know what the Edge and SDK
components can do. The Fabric is "blind" to the concepts beyond its mesh network.

The Fabric provides extension points that allow others to define additional functionality. The primary interfaces
for this are provided on the `Controller` and `Router` structs. Both expose code-level APIs that enable integrations.

`Controller` instances allow the definition and management of persistent data for services, routers, and terminators.
It also exposes extension points via the following interfaces:

- `xctrl` - allows the definition of messages and message handlers that can be sent on the control plane between a
  controller and router
- `xmgmt` - allows the definition of messages and message handlers that can be sent on management connections
- `xweb` - allows the definition of HTTP Web APIs, which the controller uses to expose the Fabric API and HealthCheck
  API

`Router` instances present an API that allows circuits to be setup and destroyed. It also exposes extension points via
the following interfaces:

- `xctrl` - allows the definition of messages and message handlers that can be sent on the control plane between a
  controller and router
- `xweb` - allows the definition of HTTP Web APIs, which the router uses to expose the HealthCheck API
- `xgress` - allows the definition of initiating and terminating connection capabilities

Additionally, routers and controllers allow other components to inspect the static file configuration used to start an
instance. The modules `xctrl`, `xweb`, and `xgress` make use of this to add configuration sections. These configuration
sections allow type-specific custom configuration.

## Edge

The Fabric provides several extension points. The main consumer of those extension points is the
Edge. The Edge extends controllers and routers to add additional security controls and enable SDK connectivity.
The Edge adds the concepts of endpoint identities, which represent Ziti SDKs that can connect to a Ziti Network. This
concept acts as a springboard for an entire suite of identity life cycle and access management features. Below are the
Fabric extension points and what Edge features they enable.

- `xctrl` - adds API Session/Session control and enforcement to the controller and router
- `xweb` - exposes the Edge Management & Client REST APIs on the controller
- `xgress` - defines a new protocol, `xgress_edge`, that enables SDKs to connect to routers to act as service clients
  and hosts

The Edge also exposes a configuration extension point for SDKs. An SDK developer can define
configuration types with JSON schemas. This configuration can be stored at the service, identity, or identity+service
specific level and delivered to connecting applications upon request. This mechanism allows SDK applications to
define and distribute configuration to power advanced application features. The pre-built Ziti clients
use this feature to power features such as DNS/IP intercept addresses.

## SDKs

The Ziti SDKs come in a variety of languages. Where appropriate, they are wrappers around the Ziti C SDK. The SDKs
make use of the Edge Client REST API on the controller and the `xgress_edge` protocol on the router to extend a Ziti
Network beyond the mesh network of routers and into applications and devices. The SDKs rely on the Edge to enable
service connectivity over a Ziti Network. The SDKs do not directly interact with the Fabric. They act as a
fulcrum to leverage the power of a Ziti Network.

The SDKs expose an API that allows endpoints to enroll, authenticate, list services, receive centralized configuration,
and connect or host services based on security access configuration.

## Clients

Ziti clients are any code that uses a Ziti SDK to connect to a Ziti Network. The OpenZiti project can provide these
applications or be custom-built by any software developer. They rely directly upon a Ziti SDK, indirectly
on the Edge, and subsequently the Fabric. They can serve as the initiating client or terminating host for
services. Clients may or may not expose extension points - it is at the author's discretion.

