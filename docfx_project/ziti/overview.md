---
uid: zitiOverview
---

# Overview
Ziti represents the next generation of secure, open-source networking for your applications. Ziti has several components.

* The Ziti fabric provides a scalable, pluggable, networking mesh with built in smart routing
* The Ziti edge components provide a secure, Zero Trust entry point into your network
* The Ziti SDKs allow you to integrate Ziti directly into your applications
* The Ziti tunnelers and proxies allow existing applications and networks to take advantage of a Ziti deployment 

**Security Features**
* Zero Trust and Application Segmentation
* Dark Services and Routers
* End to end encryption

**Performance and Reliability**
* A scalable mesh fabric with smart routing
* Support for load balancing services for both horizontal scale and failover setups 

**Developer Focus**
* [Open source code, available with the Apache 2.0 license](https://github.com/openziti)
* Fully programable REST management APIs
* [SDKs for a variety of programming languages](~/ziti/clients/sdks.md)
* [Application specific configuration store allowing centralized management of configuration allowing you to add structured configuration specific to your application](~/ziti/config-store/overview.md)
* An extensible fabric, allowing you to add your own 
    * load balancing algorithms
    * interconnect protocols
    * ingress and egress protocols
    * metrics collections frameworks
    * control and management plane messaging and semantics   

**Easy Management**
* [A flexible and expressive policy model for managing access to services and edge routers](~/ziti/security/policies/overview.md)
* A web based admin console
* [Pre-built tunnelers and proxies for a variety of operating systems, including mobile](~/ziti/clients/tunneler.md)

Let's break some of these buzzwords down.

### Zero Trust/Application Segmentation
Many networking security solutions act like a wall around an internal network. Once you are through the wall, you have access to everything inside. Zero trust solutions enforce not just access to a network, but access to individual applications within that network. 

Every client in a Ziti system must have an identity with provisioned certificates. The certificates are used to establish secure communications channels as well as for authentication and authorization of the associated identity. Whenever the client attempts to access a network application, Ziti will first ensure that the identity has access to the application. If access is revoked, open network connections will be closed.

This model enables Ziti systems to provide access to multiple applications while ensuring that clients only get access to those applications to which they have been granted access.    

In addition to requiring cert based authentication for clients, Ziti uses certificates to authorize communication between Ziti components. 

### Dark Services and Routers
There are various levels of accessibility a network application/service can have.

1. Many network services are available to the world. The service then relies on authentication and authorization policies to prevent unwanted access. 
1. Firewalls can be used to limit access to specific IP or ranges. This increases security at the cost of flexibility. Adding users can be complicated and users may not be able to easily switch devices or access the service remotely.
1. Services can be put behind a VPN or made only accessible to an internal network, but there are some downsides to this approach.
    1. If you can access the VPN or internal network for any reason, all services in that VPN become more vulnerable to you.
    1. VPNs are not usually appropriate for external customers or users.
    1. For end users, VPNs add an extra step that needs to be done each time they want to access the service.
1. Services can be made dark, meaning they do not have any ports open for anyone to even try and connect to. 

Making something dark can be done in a few ways, but the way it's generally handled in Ziti is that services reach out and establish one or more connections to the Ziti network fabric. Clients coming into the fabric can then reach the service through these connections after being authenticated and authorized. 

Ziti routers, which make up the fabric, can also be dark. Routers located in private networks will usually be made dark. These routers will reach out of the private network to talk to the controller and to make connections to join the network fabric mesh. This allows the services and routers in your private networks to make only outbound connections, so no holes have to opened for inbound traffic.

Services can be completely dark if they are implemented with a Ziti SDK. If this is not possible a Ziti tunneler or proxy can be colocated with the service. The service then only needs to allow connections from the local machine or network, depending on how close you colocate the proxy to the service.   

### End to End Encryption
If you take advantage of Ziti's developer SDKs and embed Ziti in your client and server applications, your traffic can be configured to be seamlessly encrypted from the client application to server application. If you prefer to use tunnelers or proxy applications, the traffic can be ecnrypted for you from machine to machine or private network to private network. Various combinations of the above are also supported.

End-to-end encryption means that even if systems between the client and server are compromised, your traffic cannot be decrypted or tampered with.

## Getting started with Ziti

If you are looking to jump right in, feet first, you can follow along with one of our 
[up-and-running quickstart guides](~/ziti/quickstarts/quickstart-overview.md). These environments are perfect for evaluators to get to know 
Ziti and the capabilities it offers.  The environment was not designed for large scale deployment or for long-term usage. You can 
certainly deploy and maintain your own once you understand how to create a scalable network, that's what these guides are meant to 
provide, a start. If you are looking for a managed service to help you run a truly global, scalable network browse over to our website 
at http://netfoundry.io to learn more. 

### Contributing
The Ziti project welcomes contributions including, but not limited to, code, documentation and bug reports.

* All Ziti code is found on Github under the [OpenZiti](https://github.com/openziti) organization. 
    * [ziti](https://github.com/openziti/ziti): top level project which builds all Ziti executables
    * [edge](https://github.com/openziti/edge): edge components and model which includes identity, polices and config 
    * [fabric](https://github.com/openziti/fabric): fabric project which includes core controller and router
    * [foundation](https://github.com/openziti/foundation): project which contains library code used across multiple projects
    * SDKs
        * [ziti-sdk-c] (https://github.com/openziti/ziti-sdk-c): C SDK
        * [ziti-sdk-csharp] (https://github.com/openziti/ziti-sdk-csharp): C# SDK
        * [ziti-sdk-jvm] (https://github.com/openziti/ziti-sdk-jvm): SDK for JVM based languages
        * [ziti-sdk-swift] (https://github.com/openziti/ziti-sdk-swift): Swift SDK
        * [ziti-sdk-nodejs] (https://github.com/openziti/ziti-sdk-nodejs): NodeJS SDK
        * [sdk-golang] (https://github.com/openziti/sdk-golang): Go SDK
    * [ziti-doc](https://github.com/openziti/ziti-doc): Documention (which you are currently reading)
* A [Discourse forum](https://openziti.discourse.group/) is available 

Ziti was developed and open sourced by [NetFoundry, Inc](https://netfoundry.io). NetFoundry continues to fund and contribute to Ziti. 

## Overview of a Ziti Network

The Ziti Network (Ziti) is composed of the following building
blocks: Ziti Controller, Ziti Router, Ziti Edge Router, Ziti Edge Clients. These
components are used in conjunction to provide secure
connectivity between two points such as a client to a server. This
type of network is considered an overlay network because it
provides secure connectivity on top – or “overlaying” – existing
networking infrastructure.

Here's an overview of a network:
![image](../images/ziti-overview.svg)

### ZITI CONTROLLER

The Ziti Controller is the central function of the
Ziti Network. The Ziti Controller provides the
configuration plane. It is responsible for configuring Ziti services
as well as being the central point for managing the identities
used by users, devices and the nodes making up the Ziti Network.
Lastly but critically, the Ziti Controller is responsible for
authentication and authorization for every connection in the Ziti
network.

The Ziti Controller must be configured with public key infrastructure
(pki). The configured pki is used to create secure, mutually
authenticated TLS (mTLS) network connections between any two
pieces of the Ziti Network. The Ziti Controller does not provide its
own pki but for the Ziti Controller to sign certificate requests (CSR)
the Ziti Controller will need to be configured with a key and
certificate used for signing. (Optionally, the Ziti CLI can be used
to generate a pki if needed)

The Ziti Controller also supports using a third-party pki should the
operator of the Ziti Network have an existing pki they wish to
reuse. Utilizing a third-party CA pushes the burden of obtaining
and distributing properly signed certificates to the operator of
the Ziti network but for sophisticated customers this might make
overall management of the network easier.
The Ziti Controller uses an out of process database (Postgres) to
store the information needed to manage the network.

### ZITI FABRIC ROUTER

Ziti Fabric Routers are the fundamental building blocks of the Ziti
Network. These routers are responsible for securely and reliably
delivering traffic from one Ziti Network node to the traffic’s
destination.

Ziti Fabric Routers are linked together to form a mesh network. This mesh is
constantly being monitored for latency and the fastest paths are
used when routing traffic to the destination. The monitoring also
allows for active failover to ensure a reliable network connection
even in the case of a node failure.

### ZITI EDGE ROUTER

Another fundamental building block of the Ziti Network is the
Ziti Edge Router. The Ziti Edge Router is the entry point for Edge
Clients connecting to the Ziti Network. The Ziti Edge Router is a
specialized Ziti Router incorporating the functionality of a Ziti Router to
enable it to route traffic over the Ziti network as a Ziti Router would
to a given destination.

The Ziti Edge Router in combination with the Ziti Controller is responsible
for authenticating and authorizing Ziti Edge Clients.

### ZITI EDGE CLIENTS

Connecting to the Ziti Network requires a Ziti Edge Client. Edge
Clients are designed to work with both brownfield and greenfield
applications.

If the solution being developed includes developing new
software Ziti offers SDKs targeting various languages
and runtimes to provide fast, reliable and secure connectivity.
These SDKs provide the capabilities needed to securely connect
to the Ziti Network and are designed to be easily incorporated
into the target application.

When adding secure connectivity to an already existing solution
Ziti offers specialized Edge Clients called tunnelers
which provide seamless, secure connectivity and do not require
changes to the target application.

## USING ZITI

Once the Ziti Network is established and deployed the next step
is to configure the software-powered network. The three main
concepts necessary to configure a Ziti Network are: Identities,
Services, and Policies.

### SERVICES

A service encapsulates the definition of any resource that could
be accessed by a client on a traditional network. A Ziti Service is
defined by a strong, extensible identity, rather than by an
expression of an underlay concept. This means that services
defined on a Ziti Network have an almost limitless "namespace"
available for identifying services. A Ziti Service is defined by a
name and/or a certificate, rather than by a DNS name or an IP
address (underlay concepts). Services also declare a node where
traffic that exits the Ziti Network needs to be sent do before
exiting. It’s possible for the node traffic enters to be the same it
exits and it’s possible for traffic needing to traverse the Ziti
Network Routers to reach the correct node. Simply specifying the
node is all the end-user need do, the Ziti Network handles the
rest.

### IDENTITIES

Identities represent individual endpoints in the Ziti Network
which can establish connectivity. All connections made within the
Ziti Network are mutually authenticated using X509 Certificates.
Every Identity is mapped to a given certificate’s signature. Ziti
Edge Clients present this certificate when initiating connections
to the Ziti Network. The presented certificate is used by the Ziti
Network to authorize the client and enumerate the services the
Identity is authorized to use.

### POLICIES
Policies control how Identities, Services and Edge Routers are allowed
to interact. In order to use a service the identity must be granted
access to the service. Also, since all access to a service goes through
one more edge routers, both the service and the identity must be
granted to access to the same edge router or edge routers.  

#### ROLE ATTRIBUTES
Entities such as identities, services and edge routers can be added to 
policies explicity, either by id or name. Entities can  also be tagged 
with role attributes. Role attributes are simple strings like `sales`,
`Boston`, `us-employees` or `support`. Their meaning is decided by the 
administrator. Policies can include entities by specifying a set of role 
attributes to match.

#### SERVICE POLICIES
Service Policies encapsulate the mapping between identities and 
services in a software-powered network. In the simplest terms, 
Service Policies are a group of services and a group of identities. 
The act of adding a service to a Service Policy will grant the 
identities in that Service Policy access to the given service. 
Similarly, adding an identity to a Service Policy will grant that
identity access to the services mapped in that Service Policy.

Service policies controls both which identities may dial a service (use the service)
and which identities may bind a service (provide or host the service). 
Each Service Policy may either grant dial or bind access, but not both.  

#### EDGE ROUTER POLICIES
Edge Router Policies manage the mapping between identities and 
edge routers. Edge Router Policies are a group of edge routers 
and a group of identities. Adding an edge router to an Edge
Router Policy will grant the identities in that Edge Router 
Policy access to the given edge router. Similarly, adding an identity 
to an Edge Router Policy will grant that identity access to the 
edge routers mapped in that Edge Router Policy. 

#### SERVICE EDGE ROUTER POLICIES
Service Edge Router Policies manage the mapping between services and 
edge routers. Service Edge Router Policies are a group of edge routers 
and a group of services. Adding an edge router to a Service Edge
Router Policy will grant the services in that Service Edge Router 
Policy access to the given edge router. Similarly, adding a service 
to a Service Edge Router Policy will grant that service access to the 
edge routers mapped in that Service Edge Router Policy. 
