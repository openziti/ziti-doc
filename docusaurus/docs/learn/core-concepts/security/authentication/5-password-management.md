# Password Management

For identities using username password (UPDB) authenticators the following actions are supported:

- administrative password resets
- client initiated password rotation

## Administrative Password Reset

Passwords may be reset via the [edge management API](/reference/developer/api/02-edge-management-reference.mdx) by an administrative client.

### Ziti CLI

`ziti edge update authenticator updb --identity <identityIdOrName> -p <newPassword>`

### Management API

`POST /edge/management/v1/authenticators/<id>`

```text
{
    "password": "<new-password>"
}
```

## Client Password Change

Passwords may be reset via the [edge management API](/docs/reference/developer/api#edge-management-api) or 
[edge client API](/docs/reference/developer/api#edge-client-api) by the currently authenticated client.

### Ziti CLI

`ziti edge update authenticator updb -c <currentPassword> -n <newPassword>`

### Client or Management API

`POST /edge/client/v1/current-identity/authenticators/<id>`

```text
{
    "password": "<new-password>"
}
```
