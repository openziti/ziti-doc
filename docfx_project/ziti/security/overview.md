---
uid: zitiSecurityOverview
---

# Overview

A Ziti Network's security setup is defined by several entities defined in the Edge Management API. The following
are related to identity authentication and service access:

- [Identities](#identity) - describe a human, device, service within Ziti Edge
- Authenticators - describes the credentials of an authentication method associated with an Identity
- Enrollments - describes a set of criteria necessary to create a new Identity and associated Authenticator
- Authentication Policy - describes the methods available for Identity authentication
- API Session - a controller side security context represented by a security token (JWT, secret, etc) that represents
  Identity authentication
- Session - a controller side security context represented by a security token (JWT, secret, etc) that represents access
  to a Service
- Service Policy - describes which Identities have access to which Services and the Posture Checks that are required to
  pass for access
- Edge Router Policies - describes which Identities have access to which Edge Routers
- Posture Checks - describes additional environmental state that an Identity must have in order to obtain and maintain
  service access
- Posture Queries - describes a request for environmental information from a client
- Posture Responses - a response to a Posture Query provided by a client
- Posture Data - the current environmental state provided via Posture Responses and known information
- Authentication Queries - additional, secondary, authentication factors required after initial, primary, authentication

There is an additional policy type for Edge Routers:

- Service Edge Router Policies - determines which services can be accessed over which routers

The following is a high level overview of how these entities interact. Each interaction is further detailed in their
own separate section.

1) a client enrolls
    1) A client may enroll via a pre-shared secret defined as an Enrollment or other verifiable documents (JWTs, x509
       Certs/CAs)
    2) an Identity is created with the associated Authenticators and/or Authentication Policy
2) authentication: a client Identity attempts to authenticate
    1) the authentication credentials are verified against the Authenticators and the Authentication Policy associated
       with the principal
    2) secondary factors defined by the Authentication Policy are reported to the client (MFA TOTP, JWT)
    3) the client provides secondary factors which are verified
    4) the client receives an API Session security token
3) authorization: a client may list Services which will be either grant `dial` (client connect) or `bind` (host) access
    1) the Service Policies provide a filtered list of all services for the specific client issuing the request
    2) the Service Policies are also used to evaluate the Posture Checks associated with a Service Policy
    3) the Posture Checks are converted to Posture Queries with type and pass/fail information
    4) The Services and Posture Queries are returned to the client
4) authorization: the client submits any Posture Responses to Posture Queries as necessary
5) authorization: the client requests a Session for a specific Service
    1) (Continuous) the Service Policies are consulted for access additionally re-evaluating Posture Checks against the
       current know Posture Data, revoked as needed
    2) the list of Service Edge Router Policies and Edge Router Policies are consulted to provide a valid list Edge
       Routers the Session security token can be used on
    3) a Session security token and Edge Router list is provided to the client
6) the client attempts to connect to a target Edge Router with an API Session security token
7) the target Edge Router evaluates the credential
8) the client requests a Service connection with their Session security token
    1) the connection request is verified through Service Edge Router Policies
9) the Edge Router coordinates the service connection

# High Level Concepts

Below are the major areas of Ziti Edge's security model with a minimal description of what each area covers. The link(s)
in each section will lead to a more detailed explanation of the relevant topics.

## Identity

Ziti Edge defines a top level entity called an Identity. An Identity is a security principal that can bind (host) or 
dial (connect) to services over a Ziti Network. Read more in the [Identity](authentication/identities.md) section.

## Enrollment

Enrollment is a client initiated process where the result is the creation of an Identity that has some manner
of authenticating. Enrollments may be automated through [3rd Party Cas](authentication/third-party-cas.md) and 
[External JWT Signers](external-jwt-signers.md)  or may be completed through pre-provisioning. Read more in the 
[Enrollment](enrollment/enrollment.md) section.

## Authentication

Authentication is the process of a client proving their identity through the submission of one primary credential
and zero or more secondary credentials that are prompted by Authentication Queries. Authentication methods can be
configured through [3rd Party Cas](authentication/third-party-cas.md), [External JWT Signers](external-jwt-signers.md),
and [Authentication Policies](authentication/authentication-policies.md). Read more in the
[Authentication](authentication/authentication.md) section.

## Authorization

Authorization in Ziti is configured for Identities and Edge Routers. Edge Router authorization only covers which
services can be used over an Edge Router via Service Edge Router Policies. Identity authorization is covered by Service
Policies and Edge Router Policies.

All policies in Ziti are represented by a robust attribute based access control system (ABAC) based on `roleAttributes`
properties on entities within the Edge Management API. `roleAttributes` properties are an array of user defined strings.
Policies support attribute selector properties to determine which entities a policy interacts on. Policies themselves
are documented in [Policies](authorization/policies/overview.md) section.

Additionally, Service Policies can require additional environmental states to be satisfied by Posture Checks.
Posture Checks analyze Posture Data. Posture Data is a collection of server side information and data harvested from
Posture Responses sent by client endpoints in response to Posture Queries. More can be found in
the [Posture Check](authorization/posture-checks.md)
section.