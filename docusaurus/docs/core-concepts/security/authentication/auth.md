---
title: Authentication
---

# Authentication

Authentication in Ziti Edge occurs when a client wishes to interact with the Ziti Edge Controller. Authentication
has begun when the client receives and API Session and is  complete when the API Session is fully authenticated.
API Sessions are a high level security context that represents an authenticated session with either the Ziti [Edge Client API](/api/rest/edge-apis#edge-client-api)
or the Ziti [Edge Management API](/api/rest/edge-apis#edge-management-api).

- Clients that are powered by a Ziti SDK that access services will authenticate with the [Edge Client API](/api/rest/edge-apis#edge-client-api)
- Clients that are managing a Ziti Network will authenticate with the [Edge Management API](/api/rest/edge-apis#edge-management-api)

# Authentication Flow

Below is diagram showing initial authentication for some client. The same model is used between the [Edge Client API](/api/rest/edge-apis#edge-client-api)
and [Edge Management API](/api/rest/edge-apis#edge-management-api).

[![](https://mermaid.ink/img/pako:eNp1kUtPwzAQhP_KyudW3HMApU1fFxQaHoK4B1Mv1CJZR34IRUn-O46bCiGVm9f6ZmY97thRS2QJ-zSiOcFjxiktn0h4d0Jy6igcygPM57d94d9r5SA3qhamhaVBORKisj0sumdRKXk3cFqMMCzLex1lkF6usvIV7YFTFqdVmQszqqsW0j9hnFaRWHeplMopTaKKCDx4NArtmLKOyGayPE_bMZPTNg79Hp03BGm-gwKtDTbwfaMvHj28lWt_LXzzr_xF_e7Qw66cCtmjbTTZuMjuvDmbsRpNLZQMxXacADgLKTVyloSjFOaLM05D4HwjQ_AqPFQblnyENnHGQvu6aOnIEmc8XqBMifBJ9UQNP7yGlbE)](https://mermaid-js.github.io/mermaid-live-editor/edit#pako:eNp1kUtPwzAQhP_KyudW3HMApU1fFxQaHoK4B1Mv1CJZR34IRUn-O46bCiGVm9f6ZmY97thRS2QJ-zSiOcFjxiktn0h4d0Jy6igcygPM57d94d9r5SA3qhamhaVBORKisj0sumdRKXk3cFqMMCzLex1lkF6usvIV7YFTFqdVmQszqqsW0j9hnFaRWHeplMopTaKKCDx4NArtmLKOyGayPE_bMZPTNg79Hp03BGm-gwKtDTbwfaMvHj28lWt_LXzzr_xF_e7Qw66cCtmjbTTZuMjuvDmbsRpNLZQMxXacADgLKTVyloSjFOaLM05D4HwjQ_AqPFQblnyENnHGQvu6aOnIEmc8XqBMifBJ9UQNP7yGlbE)

In the above a client has provided primary authentication credentials (certificate, JWT, username password) and then
subsequently provided any secondary credentials necessary (JWT, TOTP, etc). The secondary credentials are requested 
via Authentication Queries and enable multifactor authentication to occur.

The goal of authentication is to obtain an API Session. API Sessions are used to interact with the Ziti Controller 
and Ziti Edge Routers. API Sessions for clients are represented by opaque tokens that are provided as headers in HTTP 
requests and by values in protobuf messages for the Edge protocol between routers and SDKs. API Sessions represent a 
security context that is used to determine authorization in the rest of the Ziti network.

## API Sessions

API Sessions are represented by opaque strings and are provided in the HTTP header `zt-session` and in Edge Router
connection requests initiated by Ziti SDKs. API Sessions remain valid as long they have not timed out.

An API Sessions:

- can and are represented by a JSON data structure returned from the Client and Management APIs
  - returned from:
    - `POST /edge/management/v1/authenticate`
    - `GET /edge/management/v1/current-api-session`
    - `POST /edge/client/v1/authenticate`
    - `GET /edge/client/v1/current-api-session`
- can be referenced by an internal `id` and a security token that is in the format of a UUID
  - the `id` can be used on the following endpoints:
    - `GET /edge/management/v1/api-sessions/<id>`
    - `DELETE /edge/management/v1/api-sessions/<id>`

API Sessions are defined in the Client and Management Open API 2.0 specifications under `currentApiSessionDetail`.

Example `POST /edge/management/v1/authenticate` response:

```json
{
  "data": {
    "_links": {
      "self": {
        "href": "./api-sessions/cl4zptpgqcrinn0hhgm7ek5ve"
      },
      "sessions": {
        "href": "./api-sessions/cl4zptpgqcrinn0hhgm7ek5ve/sessions"
      }
    },
    "createdAt": "2022-06-29T14:51:07.946Z",
    "id": "cl4zptpgqcrinn0hhgm7ek5ve",
    "tags": {},
    "updatedAt": "2022-06-29T14:51:07.946Z",
    "authQueries": [
      {
        "format": "alphaNumeric",
        "httpMethod": "POST",
        "httpUrl": "./authenticate/mfa",
        "maxLength": 6,
        "minLength": 4,
        "provider": "ziti",
        "typeId": "MFA"
      }
    ],
    "authenticatorId": "vxtlfvUj6",
    "cachedLastActivityAt": "2022-06-29T14:51:07.945Z",
    "configTypes": [],
    "identity": {
      "_links": {
        "auth-policies": {
          "href": "./auth-policies/default"
        },
        "authenticators": {
          "href": "./identities/vxtlfvUj6/authenticators"
        },
        "edge-router-policies": {
          "href": "./identities/vxtlfvUj6/edge-routers"
        },
        "enrollments": {
          "href": "./identities/vxtlfvUj6/enrollments"
        },
        "failed-service-requests": {
          "href": "./identities/vxtlfvUj6/failed-service-requests"
        },
        "posture-data": {
          "href": "./identities/vxtlfvUj6/posture-data"
        },
        "self": {
          "href": "./identities/vxtlfvUj6"
        },
        "service-policies": {
          "href": "./identities/vxtlfvUj6/service-policies"
        }
      },
      "entity": "identities",
      "id": "vxtlfvUj6",
      "name": "Default Admin"
    },
    "identityId": "vxtlfvUj6",
    "ipAddress": "127.0.0.1",
    "isMfaComplete": false,
    "isMfaRequired": true,
    "lastActivityAt": "2022-06-29T14:51:07.945Z",
    "token": "44a20395-1a0e-469d-ad9b-80df8dbbf8c4",
    "expirationSeconds": 1800,
    "expiresAt": "2022-06-29T15:21:07.945Z"
  },
  "meta": {}
}
```

### Full vs Partial Authentication

API Sessions may exist in two states:

- Partially Authenticated - limited API access
- Fully Authenticated - full API access

Partial authentication occurs when a primary authentication method has been passed, but secondary Authentication Queries
remain outstanding. Ziti Edge models MFA challenges as Authentication Queries. Authentication Queries include information
that can be used to display user prompts or direct users to integrating websites for SSO. If no outstanding 
Authentication Queries are present for an API Session it is considered fully authenticated.

While partially authenticated, the API Session can only be used for a reduced set of operations:

- answering Authentication Queries 
- enrolling in MFA TOTP


#### Authentication Queries

Authentication Queries are represented on an API Session the property `authQuries` which is an array. An example 
MFA challenge represented as an Authentication Query is provided below.

```json
{
  "authQueries": [
    {
      "format": "alphaNumeric",
      "httpMethod": "POST",
      "httpUrl": "./authenticate/mfa",
      "maxLength": 6,
      "minLength": 4,
      "provider": "ziti",
      "typeId": "MFA"
    }
  ]
}
```

The existence of any Authentication Query on an API Session represents a partial authentication state. API Sessions
in this state will have reduced access to their target API. The data structure for Authentication Queries is defined
in the Client and Management Open API 2.0 specifications under the label `authQueryDetail`.

### Associated Data & Removal

API Sessions, may be used to create ephemeral certificates called [API Session Certificates](./api-session-certificates) 
and sessions for service access. Additionally, API Sessions are used to scope [Posture Data](../authorization/posture-checks#posture-data). 
When an API Session is removed for any reason, all associated data is also removed. As an example, when removing an 
API Session used to create a Session the Session will also be removed. Removing a Session will also terminate any 
existing connections that used the security token associated with that Session and prevent it from being used to 
establish new connections.

Removal of an API Session occurs in the following scenarios:

- timeout
- administrative removal
- client removal (logout)


### Timeout

The controller maintains a last accessed at timestamp for every API Session. This timestamp is used to determine whether
the session timeout has been reached, signaling an API Session removal. Activity that move the last accessed at timestamp
includes:

- Any maintained Edge Router connection
- Any valid Client or Management API interaction

The API Session timeout defaults to 30 minutes and can be configured in `edge.api.sessionTimeout` in the controller
configuration file.

```yaml
edge:
  api:
  ...
    # sessionTimeout - optional, default 30m
    # The number of minutes before an Edge API session will time out. Timeouts are reset by
    # API requests and connections that are maintained to Edge Routers
    sessionTimeout: 30m
    ...
```

### Administrative Removal

Through the [Edge Management API](/api/rest/edge-apis#edge-management-api) any API Session may be forcefully removed
by calling `DELETE /edge/management/v1/api-sessions<id>` with an empty body. 

### Client Removal (Logout)

A client may terminate its own API Session at any time by calling: `DELETE /edge/client/v1/current-api-session`

# Primary Authentication

Primary authentication in Ziti establishes and API Sessions identity principal and enabled Ziti to determine which
secondary authentication factors are necessary for an API Session to become fully authenticated. If no secondary
authentication factors are required the API Session becomes fully authenticated immediately without any further
interaction with the Client or Management API.

Primary authentication factors include:

- x509 certificates
- JWTs
- Username/password

Valid primary authentication methods can be restricted via [Authentication Policies](./authentication-policies).
An Identity can have one [Authentication Policies](./authentication-policies) associated with it. 
This association is defined by the `authPolicyId` property on the identity. If no[Authentication Policy](./authentication-policies) 
is set for an Identity, a special system defined [Authentication Policy](./authentication-policies) 
with the id of `default` will be used.

## Authenticators

Some primary authentication mechanisms (x509, username/password) need to store per identity credentials. When necessary
these are stored as authenticators. Manipulating authenticators is used to perform [password management](./password-management) 
and [certificate management](./certificate-management)

Authenticators may be listed via the CLI:

`ziti edge list authenticators`

or via the [Edge Management API](/api/rest/edge-apis#edge-management-api):

```
GET /edge/management/v1/authenticators
```

## x509 Certificate Primary Authentication

x509 authentication requires the client to initiate a HTTPs authentication request using a x509 client certificate that
is associated to the target Identity on an Authenticator. The client certificate can be issued by the Ziti Edge 
Controller's internal PKI or an external PKI. If an external PKI is being used, it must be registered as a 
[3rd Party CA](./third-party-cas) via the Ziti [Edge Management API](/api/rest/edge-apis#edge-management-api), verified, and
have authentication enabled. The client certificate must pass signature and CA chain-of-trust validation. All client, 
intermediate CA, and root CA functionality supports RSA and EC keys.

Please note that intermediate CA certificates may be provided during authentication if necessary. The client certificate
should be in index zero and intermediate CA certificates in subsequent indexes in any order.

To associate a client certificate with an Identity and Authenticator see the [Enrollment](../enrollment) 
section.

Expired client certificates may be allowed via [Authentication Policies](./authentication-policies) if desired.


## JWT Primary Authentication

JWT authentication requires that an [External JWT Signer](./external-jwt-signers) be added via the Ziti Edge Management 
API. The definition of [External JWT Signer](./external-jwt-signers) allows configuration of which JWT claim should be
used as a value to map against the unique `externalId` or `id` property on Identities. This mapping of JWT claim to 
`externalId`/`id` is used to determine which Identity is authenticating.

The JWT must be provided in the HTTP request in the `Authentication` header with a value in the format of 
`Bearer <jwt>`. The JWT provided must pass signature, expiration, issuer, and audience validation as configured
on the [External JWT Signer](./external-jwt-signers).

## Username/password

An internal username/password authentication system is provided for smaller deployments of Ziti. It is highly suggested
that all username/password authenticators be replaced by x509 certificate/JWT authentication mechanisms. Passwords
are stored individually salted and one-way cryptographically hashed using [Argon2id](https://en.wikipedia.org/wiki/Argon2).

Password policies may be enforced via [Authentication Policies](./authentication-policies). Administrative [management
of passwords](./password-management) is also available.

Username/password authentication, while supported, is only suggested to be used for testing and R&D activities. For
production environments JWT and X509 authentication is recommended.

# Secondary Authentication

Secondary authentication is represented by a series of [Authentication Queries](#authentication-queries) on an API
Session in the `authQueries` property. At present the following secondary authentication mechanisms are supported:

- TOTP - Time-Based One-Time Password (aka Authenticator Apps)
- JWT - JSON Web Tokens

## TOTP: Time-Based One-Time Password

Ziti supports all authenticator application that implement [RFC6238](https://datatracker.ietf.org/doc/html/rfc6238)
which includes all major and popular TOTP applications such as Google Authenticator, Microsoft Authenticator, Authy, and
many others.

TOTP is configured per-identity and must be client initiated due to the symmetric key exchange that must take place.
Administrators can enforce TOTP usage through [Authentication Policies](./authentication-policies) and 
[Posture Checks](../authorization/posture-checks). [Authentication Policy](./authentication-policies) enforcement 
stops the client from transitioning between [partially authenticated](#full-vs-partial-authentication) and
[fully authenticated](#full-vs-partial-authentication) status. This stops a client from accessing any service information
or connect to any service. [Posture Check](../authorization/posture-checks) enforcement allows a client to
[fully authenticate](#full-vs-partial-authentication), but based on [Service Policy](../authorization/policies/overview 
restrict connection to specific services.

## JWT

Similar to JWT primary authentication, a valid JWT must be present in the `Authentication` header in the format of
`bearer <jwt` on every request.


# Authentication Requests

### Example UPDB Authentication Request

`POST /edge/client/v1/authenticate?method=password`
```json
{
  "username": "my-name",
  "password": "my-password"
}
```

### Example Client Certificate Request

Note: The TLS connection to the controller MUST use a valid client certificate

`POST /edge/management/v1/authenticate?method=cert`
```json
{}
```

### Example JWT Authentication Request

`POST /edge/client/v1/authenticate?method=ext-jwt`
HTTP Header: `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cC...`
```json
{}
```

### Example TOTP Authentication Query Response:

`POST /edge/client/v1/authenticate/mfa`
```json
{
  "code": "123456"
}
```
