---
sidebar_position: 95
---

# Password Management

For identities using username password (UPDB) authenticators the following actions are supported:

- administrative password resets
- client initiated password rotation

## Administrative Password Reset

Passwords may be reset via the [Edge Management API](../../../../reference/developer/api/02-edge-management-reference.mdx) by an administrative client.

### OpenZiti CLI

`ziti edge update authenticator updb --identity <identityIdOrName> -p <newPassword>`

### Management API

`PUT /edge/management/v1/authenticators/<id>`

```text
{
    "password": "<new-password>"
}
```

## Client Password Change

Passwords may be reset via the [Edge Management API](../../../../reference/developer/api/index.mdx#edge-management-api) or 
[Edge Client API](../../../../reference/developer/api/index.mdx#edge-client-api) by the currently authenticated client.

### OpenZiti CLI

`ziti edge update authenticator updb -c <currentPassword> -n <newPassword>`

### Client or Management API

`PUT /edge/client/v1/current-identity/authenticators/<id>`

```text
{
    "currentPassword": "<current-password>",
    "password": "<new-password>"
}
```
