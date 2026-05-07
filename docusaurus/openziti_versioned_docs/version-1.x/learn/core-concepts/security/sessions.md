# Session Types

OpenZiti has API Session and Session types.

## API Session

API Sessions represent a client that is either partially or fully authenticated as a specific
[Identity](authentication/80-identities.md).
They are used to:

- scope [authentication](authentication/00-auth.md) and [Posture Data](authorization/posture-checks/00-overview.md)
- to make [authorization](authorization/00-auth.md) decisions.

Clients interact with API Sessions via a security token received during authentication. The token format depends on
the authentication system in use:

- **[OIDC Authentication](authentication/10-oidc.md)** (preferred) - the token is a short-lived JWT access token
  provided as an `Authorization: Bearer <token>` header. Token lifetime is governed by
  `edge.oidc.accessTokenDuration` (default 30 minutes) and is independent of `sessionTimeout`. When the access
  token expires, clients use a refresh token (valid for `edge.oidc.refreshTokenDuration`, default 24 hours) to
  obtain a new access token without re-authenticating. See
  [OIDC Authentication - Refreshing Tokens](authentication/10-oidc.md#refreshing-an-access-token) for details.
- **[Legacy Authentication](authentication/20-legacy-auth.md)** (deprecated) - the token is an opaque UUID provided
  in the `zt-session` HTTP header, received from `POST /edge/client|management/v1/authenticate`. Legacy API Sessions
  remain valid as long as they have not timed out (see [Timeout](#timeout) below).

Both token types are also presented in Edge Router connection requests initiated by OpenZiti SDKs.

An API Session:

- is represented by a JSON data structure returned from the Edge Client and Edge Management APIs
    - returned from:
        - `GET /edge/management/v1/current-api-session`
        - `GET /edge/client/v1/current-api-session`
    - also returned from legacy authenticate endpoints:
        - `POST /edge/management/v1/authenticate`
        - `POST /edge/client/v1/authenticate`
- can be referenced by an internal `id` *(legacy auth only, OIDC sessions are not tracked as API Sessions)*
    - the `id` can be used on the following endpoints:
        - `GET /edge/management/v1/api-sessions/<id>`
        - `DELETE /edge/management/v1/api-sessions/<id>`

:::note
OpenZiti does not track API Sessions for OIDC-authenticated clients. The `/edge/management/v1/api-sessions` endpoints
reflect only legacy `zt-session` based sessions. OIDC access tokens are self-contained JWTs and are not enumerable
via these endpoints.

OIDC tokens can be revoked administratively using the
[Edge Management API](/docs/openziti/reference/developer/api/edge-management-api-reference) and CLI:

- `GET /edge/management/v1/revocations` - list active revocation entries
- `GET /edge/management/v1/revocations/{id}` - get a single revocation entry
- `POST /edge/management/v1/revocations` - create a revocation entry

Revocations can target three scopes:

- **Identity** (`ziti edge create revocation identity <identityId>`) - revokes all outstanding tokens for the
  identity. The revocation entry expires at `now + max(accessTokenDuration, refreshTokenDuration)`
- **API Session** (`ziti edge create revocation api-session <apiSessionId>`) - revokes all tokens sharing the same
  session ID (`z_asid` claim). Expires at `now + refreshTokenDuration`
- **Token** (`ziti edge create revocation jti <jti>`) - revokes a single specific token by its `jti` claim. Expires
  at `now + refreshTokenDuration`

Revocation entries expire on their own. Once all tokens that could reference them have expired, the entry is
automatically cleaned up. Revocations can be issued (created) but not retracted (deleted).
:::

API Sessions are defined in the client and management Open API 2.0 specifications under `currentApiSessionDetail`.

Example `GET /edge/management/v1/current-api-session` response (legacy auth):

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

#### Full vs. partial Authentication

API Sessions may exist in two states:

- Partially Authenticated - limited API access
- Fully Authenticated - full API access

The meaning of partial authentication differs by authentication system:

**OIDC Authentication** - partial authentication occurs mid-PKCE-flow, before any token has been issued. The client
has been redirected into the OIDC login sequence but has not yet completed it (for example, a TOTP challenge is
outstanding). During this state, only the `/oidc/login/*` endpoints are accessible. No `zt-session` or JWT token
exists yet. See [OIDC Authentication - Partial Authentication](authentication/10-oidc.md#partial-authentication) for
details.

**Legacy Authentication** - partial authentication occurs when a `zt-session` has been issued but secondary
Authentication Queries remain outstanding. OpenZiti models MFA challenges as Authentication Queries. Authentication
Queries include information that can be used to display user prompts or direct users to integrating websites for SSO.
If no outstanding Authentication Queries are present for an API Session it is considered fully authenticated.

While partially authenticated under legacy auth, the API Session can only be used for a reduced set of operations:

- answering Authentication Queries
- enrolling in MFA TOTP

##### Authentication Queries

Authentication Queries are represented on an API Session the property `authQueries` which is an array. An example
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
in the client and management Open API 2.0 specifications under the label `authQueryDetail`.

#### Associated data and removal

API Sessions may be used to create ephemeral certificates called
[API Session Certificates](authentication/40-api-session-certificates.md) and Sessions for service access.
Additionally, API Sessions are used to scope [Posture Data](authorization/posture-checks/00-overview.md#posture-data).
When an API Session is removed for any reason, all associated data is also removed. As an example, when removing an
API Session used to create a [Session](#session) the [Session](#session) will also be removed. Removing a
[Session](#session) will also terminate any existing connections that used the security token associated with that
[Session](#session) and prevent it from being used to establish new connections.

Removal of an API Session occurs in the following scenarios:

- timeout
- administrative removal
- client removal (logout)

#### Timeout

**Legacy authentication only.** The `sessionTimeout` configuration applies exclusively to legacy `zt-session` based
API Sessions. OIDC access tokens have their own fixed lifetime (`edge.oidc.accessTokenDuration`, default 30 minutes)
encoded in the JWT itself and are not affected by `sessionTimeout`. When an OIDC access token expires, the client
must use its refresh token to obtain a new one without re-authenticating. See
[OIDC Authentication - Refreshing Tokens](authentication/10-oidc.md#refreshing-an-access-token) for details.

The controller maintains a last accessed at timestamp for every legacy API Session. This timestamp is used to
determine whether the timeout has been reached, signaling an API Session removal. Activities that update the
timestamp include:

- Any maintained edge router connection
- Any valid Edge Client or Edge Management API interaction

The legacy API Session timeout defaults to 30 minutes and can be configured in `edge.api.sessionTimeout` in the
controller configuration file.

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

#### Administrative removal

Through the [Edge Management API](../../../reference/developer/api/index.mdx#edge-management-api) any API Session may be
forcefully removed by calling `DELETE /edge/management/v1/api-sessions/<id>` with an empty body.

#### Client removal (logout)

A client may terminate its own API Session at any time by calling: `DELETE /edge/client/v1/current-api-session`

## Session

A Session represents access to a specific service for dialing or binding. They are scoped to the
[API Session](#api-session) that was used to create them. They are requested from the
controller by a client through the [Edge Client API](/docs/openziti/reference/developer/api/edge-client-api-reference).
The result of that request is a security token representing the Session and a list of Edge Routers that the client
may use to dial or bind the target service through.

Sessions are removed when the parent [API Session](authentication/00-auth.md#api-sessions) is removed,
[policies](authorization/policies/overview.mdx) are changed to deny access, or when [Posture
Checks](authorization/posture-checks/00-overview.md) enter an invalid state for the target service.
