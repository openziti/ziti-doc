# Password Management

For identities using username password (UPDB) authenticators the following actions are supported:

- administrative password resets
- client initiated password rotation

## Administrative Password Reset

Passwords may be reset via the [Edge Management API](../../api/edge-apis#edge-management-api) by an administrative client.

### Ziti CLI

`ziti edge update authenticator updb --identity <identityIdOrName> -p <newPassword>`

### Management API

`POST /edge/management/v1/authenticators/<id>`

```json
{
    "password": "<new-password>"
}
```

## Client Password Change

Passwords may be reset via the [Edge Management API](../../api/edge-apis#edge-management-api) or 
[Edge Client API](../../api/edge-apis#edge-client-api) by the currently authenticated client.

### Ziti CLI

`ziti edge update authenticator updb -c <currentPassword> -n <newPassword>`

### Client or Management API

`POST /edge/client/v1/current-identity/authenticators/<id>`

```json
{
    "password": "<new-password>"
}
```