---
sidebar_position: 95
---

# Password Management

For identities using username password (UPDB) authenticators the following actions are supported:

- administrative password resets
- client initiated password rotation

## Administrative Password reset

Passwords may be reset via the
[Edge Management API](/docs/openziti/reference/developer/api/edge-management-api-reference) by an administrative
client.

### OpenZiti CLI

`ziti edge update authenticator updb --identity <identityIdOrName> -p <newPassword>`

### Management API

`PUT /edge/management/v1/authenticators/<id>`

```json
{
    "password": "<new-password>"
}
```

## Client Password change

Passwords may be reset via the [Edge Management API](../../../../reference/developer/api/index.mdx#edge-management-api)
or [Edge Client API](../../../../reference/developer/api/index.mdx#edge-client-api) by the currently authenticated
client.

### OpenZiti CLI

`ziti edge update authenticator updb -c <currentPassword> -n <newPassword>`

### Client or Management API

`PUT /edge/client/v1/current-identity/authenticators/<id>`

```json
{
    "currentPassword": "<current-password>",
    "password": "<new-password>"
}
```
