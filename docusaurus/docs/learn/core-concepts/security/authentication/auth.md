---
title: Authentication
---

Authentication in Ziti Edge occurs when a client wishes to interact with the Ziti Edge Controller. Authentication
has begun when the client receives and API Session and is  complete when the API Session is fully authenticated.
API Sessions are a high level security context that represents an authenticated session with either the Ziti [edge client API](docs/reference/developer/api/01-edge-client-reference.mdx)
or the Ziti [edge management API](docs/reference/developer/api/02-edge-management-reference.mdx).

- Clients that are powered by a Ziti SDK that access services will authenticate with the [edge client API](docs/reference/developer/api/01-edge-client-reference.mdx)
- Clients that are managing a network will authenticate with the [edge management API](docs/reference/developer/api/02-edge-management-reference.mdx)

## Authentication Flow

Below is diagram showing initial authentication for some client. The same model is used between the [edge client API](docs/reference/developer/api/01-edge-client-reference.mdx)
and [edge management API](docs/reference/developer/api/02-edge-management-reference.mdx).

```mermaid
graph TD
A[Unauthenticated] -->|Submit Primary Credentials| B{Valid?}
B --> C[No] --> A
B --> D[Yes]
D --> E[Partially Authenticated]
E --> F{Additional Auth Queries?}
F --> G[Yes]
F --> H[No]
H --> |Return API Session w/o Queries| Z[Fully Authenticated]
G --> |Return API Session With Queries| I[Submit Responses]
I --> F
```

In the above a client has provided primary authentication credentials (certificate, JWT, username password) and then
subsequently provided any secondary credentials necessary (JWT, TOTP, etc). The secondary credentials are requested 
via Authentication Queries and enable multifactor authentication to occur.

The goal of authentication is to obtain an API Session. API Sessions are used to interact with the controller 
and edge routers. API Sessions for clients are represented by opaque tokens that are provided as headers in HTTP 
requests and by values in protobuf messages for the Edge protocol between routers and SDKs. API Sessions represent a 
security context that is used to determine authorization in the rest of the Ziti network.

### API Sessions

API Sessions are represented by opaque strings and are provided in the HTTP header `zt-session` and in Edge Router
connection requests initiated by Ziti SDKs. API Sessions are subject to timeouts based on activity and have data removal implication. See the full
API Session documentation.

### Primary Authentication

Primary authentication in Ziti establishes and API Sessions identity principal and enabled Ziti to determine which
secondary authentication factors are necessary for an API Session to become fully authenticated. If no secondary
authentication factors are required the API Session becomes fully authenticated immediately without any further
interaction with the client or Management API.

Primary authentication factors include:

- x509 certificates
- JWTs
- Username/password

Valid primary authentication methods can be restricted via [Authentication Policies](30-authentication-policies.md).
An Identity can have one [Authentication Policies](30-authentication-policies.md) associated with it. 
This association is defined by the `authPolicyId` property on the identity. If no[Authentication Policy](30-authentication-policies.md) 
is set for an Identity, a special system defined [Authentication Policy](30-authentication-policies.md) 
with the id of `default` will be used.

### Authenticators

Some primary authentication mechanisms (x509, username/password) need to store per-identity credentials. When necessary,
these are stored as authenticators. Authenticators are manipulated using [password management](5-password-management.md) 
and [certificate management](40-certificate-management.md).

Authenticators may be listed via the CLI:

`ziti edge list authenticators`

or via the [edge management API](docs/reference/developer/api/02-edge-management-reference.mdx):

```
GET /edge/management/v1/authenticators
```

### x509 Certificate Primary Authentication

x509 authentication requires the client to initiate a HTTPs authentication request using a x509 client certificate that
is associated to the target Identity on an Authenticator. The client certificate can be issued by the Ziti Edge 
Controller's internal PKI or an external PKI. If an external PKI is being used, it must be registered as a 
[3rd Party CA](10-third-party-cas.md) via the Ziti [edge management API](docs/reference/developer/api/02-edge-management-reference.mdx), verified, and
have authentication enabled. The client certificate must pass signature and CA chain-of-trust validation. All client, 
intermediate CA, and root CA functionality supports RSA and EC keys.

Please note that intermediate CA certificates may be provided during authentication if necessary. The client certificate
should be in index zero and intermediate CA certificates in subsequent indexes in any order.

To associate a client certificate with an Identity and Authenticator see the [Enrollment](/learn/core-concepts/security/enrollment.md) 
section.

Expired client certificates may be allowed via [Authentication Policies](30-authentication-policies.md) if desired.

### JWT Primary Authentication

JWT authentication requires that an [External JWT Signer](50-external-jwt-signers.md) be added via the Ziti edge management 
API. The definition of [External JWT Signer](50-external-jwt-signers.md) allows configuration of which JWT claim should be
used as a value to map against the unique `externalId` or `id` property on Identities. This mapping of JWT claim to 
`externalId`/`id` is used to determine which Identity is authenticating.

The JWT must be provided in the HTTP request in the `Authentication` header with a value in the format of 
`Bearer <jwt>`. The JWT provided must pass signature, expiration, issuer, and audience validation as configured
on the [External JWT Signer](50-external-jwt-signers.md).

### Username/password

An internal username/password authentication system is provided for smaller deployments of Ziti. It is highly suggested
that all username/password authenticators be replaced by x509 certificate/JWT authentication mechanisms. Passwords
are stored individually salted and one-way cryptographically hashed using [Argon2id](https://en.wikipedia.org/wiki/Argon2).

Password policies may be enforced via [Authentication Policies](30-authentication-policies.md). Administrative [management
of passwords](5-password-management.md) is also available.

Username/password authentication, while supported, is only suggested to be used for testing and R&D activities. For
production environments JWT and X509 authentication is recommended.

### Secondary Authentication

Secondary authentication is represented by a series of [Authentication Queries](/learn/core-concepts/security/sessions.md#authentication-queries) on an 
API Session in the `authQueries` property. At present the following secondary authentication mechanisms are supported:

- TOTP - Time-Based One-Time Password (aka Authenticator Apps)
- JWT - JSON Web Tokens

#### TOTP: Time-Based One-Time Password

Ziti supports all authenticator application that implement [RFC6238](https://datatracker.ietf.org/doc/html/rfc6238)
which includes all major and popular TOTP applications such as Google Authenticator, Microsoft Authenticator, Authy, and
many others.

TOTP is configured per-identity and must be client initiated due to the symmetric key exchange that must take place.
Administrators can enforce TOTP usage through [Authentication Policies](30-authentication-policies.md) and 
[Posture Checks](/learn/core-concepts/security/authorization/posture-checks.md). [Authentication Policy](30-authentication-policies.md) enforcement 
stops the client from transitioning between [partially authenticated](/learn/core-concepts/security/sessions.md#full-vs-partial-authentication) and
[fully authenticated](/learn/core-concepts/security/sessions.md#full-vs-partial-authentication) status. This stops a client from accessing any service information
or connect to any service. [Posture Check](/learn/core-concepts/security/authorization/posture-checks.md) enforcement allows a client to
[fully authenticate](/learn/core-concepts/security/sessions.md#full-vs-partial-authentication), but based on [Service Policy](/learn/core-concepts/security/authorization/policies/overview.mdx) 
restrict connection to specific services.

#### JWT

Similar to JWT primary authentication, a valid JWT must be present in the `Authentication` header in the format of
`bearer <JWT>` on every request.

### Authentication Requests

#### Example UPDB Authentication Request

`POST /edge/client/v1/authenticate?method=password`

```text
{
  "username": "my-name",
  "password": "my-password"
}
```

#### Example Client Certificate Request

Note: The TLS connection to the controller MUST use a valid client certificate

`POST /edge/management/v1/authenticate?method=cert`

```text
{}
```

#### Example JWT Authentication Request

`POST /edge/client/v1/authenticate?method=ext-jwt`
HTTP Header: `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cC...`

```text
{}
```

#### Example TOTP Authentication Query Response

`POST /edge/client/v1/authenticate/mfa`

```text
{
  "code": "123456"
}
```
