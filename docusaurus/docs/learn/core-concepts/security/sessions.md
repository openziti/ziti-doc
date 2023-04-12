# Session Types

## API Session

API Sessions represent a client that is either partially or fully authenticated as a specific Ziti Identity.
They are used to:

- scope [authentication](authentication/auth.md) and [Posture Data](authorization/posture-checks)
- to make [authorization](authorization/auth.md) decisions.

Clients interact with API Sessions via an opaque security token value and is received during authentication via `/edge/client|management/v1/authenticate`.

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

#### Full vs Partial Authentication

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
in the Client and Management Open API 2.0 specifications under the label `authQueryDetail`.

#### Associated Data & Removal

API Sessions, may be used to create ephemeral certificates called [API Session Certificates](authentication/20-api-session-certificates.md)
and sessions for service access. Additionally, API Sessions are used to scope [Posture Data](authorization/posture-checks.md#posture-data-posture-data).
When an API Session is removed for any reason, all associated data is also removed. As an example, when removing an
API Session used to create a [Session](#session) the [Session](#session) will also be removed. Removing a [Session](#session) will also terminate any
existing connections that used the security token associated with that [Session](#session) and prevent it from being used to
establish new connections.

Removal of an API Session occurs in the following scenarios:

- timeout
- administrative removal
- client removal (logout)

#### Timeout

The controller maintains a last accessed at timestamp for every API Session. This timestamp is used to determine whether
the timeout has been reached, signaling an API Session removal. Activities that update the timestamp include:

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

#### Administrative Removal

Through the [Edge Management API](/docs/reference/developer/api#edge-management-api) any API Session may be forcefully removed
by calling `DELETE /edge/management/v1/api-sessions<id>` with an empty body.

#### Client Removal (Logout)

A client may terminate its own API Session at any time by calling: `DELETE /edge/client/v1/current-api-session`

## Session

Session represent access to a specific service for dialing or binding. They are scoped to the
[API Session](#api-session) that was used to create them. They are requested from the
controller by a client through the Edge Client API. The result of that request is a security token representing
the Session and a list of Edge Routers that the client may use to dial or bind the target service through.

Sessions are removed when the parent [API Session](authentication/auth.md#api-sessions) is removed,
[policies](authorization/policies/overview.mdx) are changed to deny access, or when [Posture Checks](authorization/posture-checks.md) enter an
invalid state for the target service.