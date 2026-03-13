---
title: OpenZiti Security
---

A network's security setup is defined by several entities defined in the
[Edge Management API](../../../reference/developer/api/index.mdx#edge-management-api). The following are related to
identity authentication and service access:

- [Identities](#identity) - describe a human, device, or service within the edge
- [Authenticators](authentication/00-auth.md#authenticators) - describes the credentials of an authentication method
  associated with an Identity
- [Enrollments](enrollment.mdx) - describes a set of criteria necessary to create a new Identity and associated
  Authenticator
- [Authentication Policy](authentication/50-authentication-policies.md) - describes the methods available for
  Identity authentication
- [3rd Party CAs](authentication/30-third-party-cas.md) - allows external x509 PKIs to be used for authentication
- [External JWT Signers](authentication/70-external-jwt-signers.mdx) - allows external JWT signers to be used for
  authentication
- [API Session](./sessions.md) - a security context represented by a security token (JWT, secret, etc) that represents
  Identity authentication
- [Session](./sessions.md) - a security context represented by a security token (JWT, secret, etc) that represents
  access to a Service
- [Service Policy](./authorization/policies/overview.mdx) - describes which Identities have access to which Services
  and the Posture Checks that are required to pass for access
- [Edge Router Policies](./authorization/policies/overview.mdx) - describes which Identities have access to which
  edge routers
- [Posture Checks](authorization/posture-checks/00-overview.md) - describes additional environmental state that an
  Identity must have in order to obtain and maintain service access
- [Posture Queries](authorization/posture-checks/00-overview.md#posture-data) - describes a request for
  environmental information from a client
- [Posture Responses](authorization/posture-checks/00-overview.md#posture-data) - a response to a Posture Query
  provided by a client, submitted to the controller (legacy) or each connected edge router (OIDC)
- [Posture Data](authorization/posture-checks/00-overview.md#posture-data) - the current environmental state
  provided via Posture Responses
- [Authentication Queries](./sessions.md#authentication-queries) - additional, secondary, authentication factors
  required after initial, primary, authentication

There is an additional policy type for edge routers:

- [Service Edge Router Policies](./authorization/policies/overview.mdx) - determines which services can be accessed
  over which routers

Additionally, connection security document is provided on the [Connection Security](connection-security.md) page. 

## Authentication and Authorization high level flow

The following is a high level overview of how these entities interact. Each interaction is further detailed in their
own separate section.

1. a client enrolls
   1. A client may enroll via a pre-shared secret defined as an Enrollment or other verifiable documents (JWTs, x509
        Certs/CAs)
   2. an Identity is created with associated Authenticators and Authentication Policies
2. authentication: a client Identity attempts to authenticate
    1. the authentication credentials are verified against the Authenticators, 3rd Party CAs, External JWT Signers,
       and/or Authentication Policy associated with the principal
    2. secondary factors defined by the Authentication Policy are reported to the client (MFA TOTP, JWT) as
       Authentication Queries
    3. the client provides secondary factors
    4. the client receives an API Session security token without unanswered Authentication Queries
3. authorization: a client may list Services which will be either grant `dial` (client connect) or `bind` (host) access
    1. the Service Policies provide a filtered list of all services for the specific client issuing the request
    2. the Service Policies are also used to evaluate the Posture Checks associated with a Service Policy
    3. the Posture Checks are converted to Posture Queries with type, pass/fail state, and criteria information
    4. The Services and Posture Queries are returned to the client 
    5. (Continuous) the client submits Posture Responses to the controller (legacy sessions) or to each connected
       edge router (OIDC sessions)
4. authorization: the client requests a Session for a specific Service
    1. (Continuous) the Service Policies are consulted for access additionally re-evaluating Posture Checks against the
       current know Posture Data
    2. the list of Service Edge Router Policies and Edge Router Policies are consulted to provide a valid list edge
       routers the Session security token may be used on
    3. a Session security token and edge router list is provided to the client
5. the client attempts to connect to a target edge router with an API Session security token
6. the target edge router evaluates the credential
7. the client requests a Service connection with their Session security token
    1. the connection request is verified through Service Edge Router Policies
8. the edge router coordinates the service connection

## High level concepts

Below are the major areas of the edge security model with a minimal description of what each area covers. The link(s)
in each section will lead to a more detailed explanation of the relevant topics.

### Identity

The edge defines a top level entity called an [Identity](authentication/80-identities.md). An Identity is a security
principal that can bind (host) or dial (connect) to services over a network. Read more in the
[Identity](/learn/core-concepts/identities/overview.mdx) section.

### Enrollment

Enrollment is a client initiated process where the result is the creation of an Identity that has some manner
of authenticating. Enrollments may be automated through [3rd Party Cas](authentication/30-third-party-cas.md) and
[External JWT Signers](authentication/70-external-jwt-signers.mdx) or may be completed through pre-provisioning.
Read more in the [Enrollment](enrollment.mdx) section.

### Authentication

[Authentication](authentication/00-auth.md) is the process of a client proving their identity through the submission
of one primary credential and zero or more secondary credentials that are prompted by Authentication Queries.
Authentication methods can be configured through [3rd Party Cas](authentication/30-third-party-cas.md),
[External JWT Signers](authentication/70-external-jwt-signers.mdx), and
[Authentication Policies](authentication/50-authentication-policies.md). Read more in the
 [Authentication](authentication/00-auth.md) section.

### Authorization

[Authorization](authorization/00-auth.md) in OpenZiti is configured for identities and edge routers. Edge router
authorization only covers which services can be used over an edge router via Service Edge Router Policies. Identity
authorization is covered by Service Policies and Edge Router Policies.

All policies in OpenZiti are represented by a robust
[attribute based access control system (ABAC)](https://en.wikipedia.org/wiki/Attribute-based_access_control) based on
`roleAttributes` properties on entities within the
[Edge Management API](../../../reference/developer/api/index.mdx#edge-management-api). `roleAttributes` properties
are an array of user defined strings.
Policies support attribute selector properties to determine which entities a policy interacts on. Policies themselves
are documented in [Policies](./authorization/policies/overview.mdx) section.

Additionally, Service Policies can require additional environmental states to be satisfied by Posture Checks.
Posture Checks evaluate Posture Data. Posture Data is environmental state collected by the client and submitted as
Posture Responses. For legacy sessions posture evaluation occurs at the controller and for OIDC sessions it occurs
at each edge router. More can be found in the [Posture Checks](authorization/posture-checks/00-overview.md) section.

Read more in the [Authorization](authorization/00-auth.md) section.
