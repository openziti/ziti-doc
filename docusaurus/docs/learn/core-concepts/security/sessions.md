# Session Types

## API Session

API Sessions represent a client that is either partially or fully authenticated as a specific Ziti Identity.
They are used to:

- scope [authentication](./authentication/auth.md) and [Posture Data](./authorization/posture-checks)
- to make [authorization](./authorization/auth.md) decisions.

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

## Session

Session represent access to a specific service for dialing or binding. They are scoped to the
[API Session](#api-sessions) that was used to create them. They are requested from the
controller by a client through the Edge Client API. The result of that request is a security token representing
the session and a list of Edge Routers that the client may use to dial or bind the service through.

Sessions are removed when the parent [API Session](../authentication/auth.md#api-sessions) is removed,
[policies](policies/overview.mdx) are changed to deny access, or when [Posture Checks](posture-checks.md) enter an
invalid state for the target service.