---
sidebar_position: 50
---

# Authentication Policies

Authentication Policies restrict the [primary authentication](00-auth.md#primary-authentication) methods available to
[Identities](80-identities.md) and may enforce additional
[secondary authentication](00-auth.md#secondary-authentication)
factors. OpenZiti is deployed with a default [Authentication Policy](#) that has the id `default`. This Authentication
Policy may be updated,
but not deleted. This default Authentication Policy is used when Identities are created and an Authentication
Policy is not specified.


Example: Authentication Policy
```json
{
    "createdAt": "2022-05-20T14:02:53.359Z",
    "id": "default",
    "tags": {},
    "updatedAt": "2022-05-20T14:02:53.359Z",
    "name": "Default",
    "primary": {
        "cert": {
            "allowExpiredCerts": true,
            "allowed": true
        },
        "extJwt": {
            "allowed": true,
            "allowedSigners": null
        },
        "updb": {
            "allowed": true,
            "lockoutDurationMinutes": 0,
            "maxAttempts": 0
        }
    },
    "secondary": {
        "requireTotp": false,
        "requireExtJwtSigner": ""
    }
}
```


## Sections

An Authentication Policy is split into two separate major sections:

- `primary` - initial authentication to establish the authenticating principal
- `secondary` - additional MFA authentication challenges

### Primary

The primary section allow or disposals various authentication mechanisms used to establish the initial principal
(identity) authenticating. A viable Authentication Policy must allow at least one primary authentication mechanism.

- `cert` - x509 certificate based authentication
- `extJwt` - externally signed JWT bearer tokens
- `updb` - "username password database" which power traditional username/password authentication

#### Certificate (cert)

Fields:
- `allowed` - enables/disabled x509 certificate authentication
- `allowExpiredCerts` - allows expired client certificates to authenticate

When certificate authentication is `allowed`, client certificates issued by the OpenZiti PKI and any verified and
enabled [3rd Party CAs](30-third-party-cas.md) become valid authentication paths. When disabled an identity will
not be able to authenticate with any client certificate.

If `allowExpiredCerts` is true, client certificate expiration will be ignored during validation. This setting is 
useful in scenarios where client are running software that has lapsed and cannot be re-enrolled or their client
certificates cannot be updated. Clients do have an API available to them to roll existing OpenZiti PKI issued client 
certificates forward. Client certificates issued by a [3rd Party CAs](30-third-party-cas.md) must have an external
process to maintain client certificate validity if `allowExpiredCerts` is false.


#### External JWT Signers (extJwt)

Fields:

- `allowed` - whether external JWTs may be used for authentication
- `allowedSigners` - the ids of valid [External JWT Signers](70-external-jwt-signers.mdx). When `null` or empty, all
  configured and enabled External JWT Signers are permitted

If `allowed` is true, authentication is accepted from the External JWT Signers listed in `allowedSigners`. If
`allowedSigners` is `null`, any enabled External JWT Signer may be used.

#### Username Password (updb)

- `allowed` - whether UPDB may be used for authentication
- `maxAttempts` - the maximum number of invalid logins allowed before an identity is locked for
  `lockoutDurationMinutes`, 0 for never
- `lockoutDurationMinutes` - the number of minutes to lock identities after `maxAttempts` is reached, 0 for forever

### Secondary

The secondary section contain only two top-level configuration values:

- `requireTotp` - if true authenticating clients must have [MFA TOTP](90-totp.md) enabled
- `requireExtJwtSigner` - if set to an id of an [External JWT Signer](70-external-jwt-signers.mdx), every request
  must have a valid JWT in the HTTP `Authorization` header

## Creating and updating


Authentication policies are managed via the
[Edge Management API](/docs/openziti/reference/developer/api/edge-management-api-reference).

### Create

`POST /edge/management/v1/auth-policies`
```json
{
  "name": "require-totp",
  "primary": {
    "cert": {
      "allowed": true,
      "allowExpiredCerts": false
    },
    "extJwt": {
      "allowed": false,
      "allowedSigners": null
    },
    "updb": {
      "allowed": true,
      "maxAttempts": 5,
      "lockoutDurationMinutes": 10
    }
  },
  "secondary": {
    "requireTotp": true,
    "requireExtJwtSigner": ""
  }
}
```

### Update

`PATCH /edge/management/v1/auth-policies/<id>`
```json
{
  "secondary": {
    "requireTotp": true
  }
}
```

`PUT /edge/management/v1/auth-policies/<id>` replaces the full policy. `PATCH` updates only the supplied fields.

## Effect on existing Sessions


Authentication Policy changes take effect on **new authentications only**. Existing fully authenticated
[API Sessions](../sessions.md) are not re-evaluated when a policy changes. Clients that are already authenticated
continue to operate under the policy that was in effect when they authenticated. To force re-authentication, the
existing [API Sessions](../sessions.md) must be terminated administratively via
`DELETE /edge/management/v1/api-sessions/<id>` (legacy) or by issuing a
[revocation](../sessions.md#api-session) (OIDC).