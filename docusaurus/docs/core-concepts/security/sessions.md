---
title: Sessions
---

There are two types of session.

## Identity Session {#api-session}

API Sessions represent a client that is either partially or fully authenticated as a specific Ziti Identity. API
Sessions are used to scope [authentication](./authentication/auth.md) and [Posture Data](./authorization/posture-checks.md).
API Sessions are used to make [authorization](./authorization/auth.md) decisions. Clients interact with
API Sessions via a opaque security token value and is received during authentication via `/edge/client` or `/management/v1/authenticate`. A client may renew an API session token indefinitely.

## Session {#session}

Sessions represent a client's ability to dial (connect) or bind (host) a service.
Sessions are service and identity specific. Clients interact with them
as an opaque security token that is provided to Edge Routers during dial and bind requests.
