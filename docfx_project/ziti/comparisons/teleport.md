---
uid: TeleportVsZiti
---

# Teleport vs. OpenZiti

Teleport strives to be the "easiest, most secure way to access infrastructure". It focuses on improvement credential
distribution and management and access management for DevOps use cases. It has a specific set of use cases for accessing 
servers via SSH, Kubernetes clusters, web applications, databases, and Windows RDP. Overtime it is expected to 
expand its use cases to support additional types of infrastructure access.

OpenZiti provides secure connectivity across a broader set of scenarios...<something>

In terms of DevOps connectivity, both OpenZiti and Teleport provide solutions with their own unique approach. Teleport
is honed  in on the DevOps use cases while OpenZiti solves a wide array of network access beyond DevOps. Due
to this, Teleport has a clearer message while OpenZiti has broader applications and a larger message.

Comparison Matrix

|                       | OpenZiti                       | Teleport                     |
|-----------------------|--------------------------------|------------------------------|
| Overlay Type          | Mesh                           | Point-to-Point               |
| Fabric/Routing        | Smart Routing                  | Internet/Network Best Effort |
| Open Source           | Yes                            | Yes                          |
| Paid SaaS             | Yes - NetFoundry               | Yes - Teleport               |
| End-to-End Encryption | Yes                            | Yes                          |
| Access  Control       | ABAC                           | RBAC                         |
| IdP Integration       | Yes, JWT/PKI                   | Yes,                         |
| MFA                   | Yes                            | Yes                          |
| Client SDK            | Yes, various languages         | No                           |
| Extendable            | Custom Clients, Config         | No                           |
| Client Required       | Variable                       | Variable                     |
| Management API        | JSON Web API                   | gRPC                         |
| Service Addressing    | Custom, DNS, IP                | IP, DNS                      |
| Pricing               | Free self-hosted               | Free self-hosted             |
|                       | Free hosted up to 10 endpoints |                              |
|                       | Hosted $10US/endpoint/mo       |                              |
|                       | Hosted Enterprise quoted       | Hosted Enterprise quoted     |



## Initial Setup

To set up Teleport you will need an Auth Service, Proxy Service, and one Nodes. The Proxy service is the only services
that needs to be publicly available, but needs to have connectivity to the Auth Service and Node. The Proxy service
will broker connectivity based on authorization from the Auth Service to the setup Nodes. The Nodes service that act 
as reverse proxies to the target service. Teleport provides one binary that can fulfill all roles.

To set up OpenZiti you will need a Controller, one Router, and one client. The controller acts as a point of authentication
and authorization, while Routers act as on ramps to the overlay network. OpenZiti in its most basic use case With OpenZiti, a client can be one of the
provided clients such as a Linux, Windows, macOS, iOS, or Android tunneler or a purpose built application

## Authentication & Enrollment
- mfa, sso
- security token formats: ssh certificates, x509 certificates, jwt

## Access Control
 - rbac va abac
 - trust clusters vs 

## Auditing
- audit logs
- session recording

## Addressing Support
- ip dns vs ip/dns intercepts + custom naming/custom tlds

## Service Support
- host intercept on tunnelers, embedded inside client/server apps, network bridging vs client -> server

## Embedded Support
- SDK information

## Fabric/Routing

## Conclusion

Las Updated: 4/5/2022