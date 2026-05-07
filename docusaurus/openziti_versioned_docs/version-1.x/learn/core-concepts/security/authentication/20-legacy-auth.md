---
title: Legacy Authentication
sidebar_position: 20
---

:::warning[Deprecated]
Legacy authentication is deprecated and will be removed in a future release. New clients and SDKs should use
[OIDC authentication](10-oidc.md). Existing clients using legacy authentication should migrate to OIDC.
:::

Legacy authentication is the original authentication system for the OpenZiti edge APIs. Clients submit credentials
directly to the Edge Client or Edge Management API and receive an opaque `zt-session` token. This token is then included
in subsequent API requests in the `zt-session` HTTP header.

The same legacy authentication endpoints and `zt-session` mechanism apply to both the
[Edge Client API](/docs/openziti/reference/developer/api/edge-client-api-reference) and the
[Edge Management API](/docs/openziti/reference/developer/api/edge-management-api-reference).

## Authentication endpoint

All legacy authentication is submitted to a single endpoint, with the authentication method specified as a query
parameter:

```http
POST /edge/client/v1/authenticate?method=<method>
POST /edge/management/v1/authenticate?method=<method>
```

Supported `method` values: `cert`, `password`, `ext-jwt`

A successful response returns an [API Session](../sessions.md#api-session) object containing the `token` field.
This token value is the `zt-session` and is used on all subsequent requests.

## Primary Authentication

### x509 Certificate

Certificate authentication requires the HTTP connection to the controller to use a client TLS certificate
associated with the target identity. The request body is empty. The controller reads the certificate from the
TLS handshake.

`POST /edge/client/v1/authenticate?method=cert`

```json
{}
```

The client certificate must be issued by the OpenZiti PKI or a registered and enabled
[3rd Party CA](30-third-party-cas.md). Intermediate CA certificates may be included in the TLS handshake if
necessary. The client certificate must be at index zero with intermediates in subsequent positions.

### Username/Password (UPDB)

`POST /edge/client/v1/authenticate?method=password`

```json
{
  "username": "my-identity",
  "password": "my-password"
}
```

Password policies and account lockout behavior are configured via
[Authentication Policies](50-authentication-policies.md).

### External JWT

JWT authentication requires a valid JWT from a configured [External JWT Signer](70-external-jwt-signers.mdx)
in the `Authorization` header.

`POST /edge/client/v1/authenticate?method=ext-jwt`

HTTP Header: `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cC...`

```json
{}
```

The JWT must pass signature, expiration, issuer, and audience validation as configured on the matching
External JWT Signer. The signer's `claimsProperty` maps a claim in the JWT to the `id` or `externalId` on an
identity to determine which identity is authenticating.

## Authentication response

A successful authentication returns an [API Session](../sessions.md#api-session) object.
The `token` field is the `zt-session` value.

```json
{
  "data": {
    "id": "cl4zptpgqcrinn0hhgm7ek5ve",
    "token": "44a20395-1a0e-469d-ad9b-80df8dbbf8c4",
    "expiresAt": "2022-06-29T15:21:07.945Z",
    "expirationSeconds": 1800,
    "authQueries": [],
    "identity": {
      "id": "vxtlfvUj6",
      "name": "Default Admin"
    }
  },
  "meta": {}
}
```

When `authQueries` is non-empty, the [API Session](../sessions.md#api-session) is
[partially authenticated](#partial-authentication) and secondary factors must be
satisfied before full access is granted.

## Using the zt-session Token

Include the `zt-session` token in all subsequent API requests:

```http
zt-session: 44a20395-1a0e-469d-ad9b-80df8dbbf8c4
```

The [API Session](../sessions.md#api-session) remains valid until it times out due to
inactivity, is removed administratively, or the client explicitly logs out. The default
session timeout is 30 minutes and is reset by any API activity or maintained edge router
connection.

Logout:

```http
DELETE /edge/client/v1/current-api-session
```

## Secondary Authentication

If the identity's [Authentication Policy](50-authentication-policies.md) requires secondary factors, the
authentication response includes an `authQueries` array listing the outstanding challenges. The session is
[partially authenticated](#partial-authentication) until all queries are satisfied.

### TOTP

`POST /edge/client/v1/authenticate/mfa`

```json
{
  "code": "123456"
}
```

### External JWT (per-request)

When an Authentication Policy requires a secondary External JWT, the JWT must be included in the `Authorization`
header on every API request:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cC...
```

The controller validates the secondary JWT on each request. If it is missing, expired, or invalid, the request
returns `401 Unauthorized` with a `WWW-Authenticate` header identifying the required signer.

## Partial Authentication

A legacy API Session is **partially authenticated** when primary credentials have been accepted but one or more
`authQueries` remain outstanding. During partial authentication the following operations are available:

- Submitting secondary authentication factor responses (`POST /edge/client/v1/authenticate/mfa`, etc.)
- Enrolling in MFA TOTP (`POST /edge/client/v1/current-identity/mfa`)
- Reading the current API session (`GET /edge/client/v1/current-api-session`)

All other operations require a fully authenticated session. Attempts to call other endpoints while partially
authenticated return `401 Unauthorized`.

Once all `authQueries` are satisfied, the session becomes fully authenticated.
The same token is used for all subsequent requests.
