# Authentication Policies

Authentication Policies restrict the [primary authentication](./authentication.md#primary-authentication) methods available to 
identities and may enforce additional [secondary authentication](./authentication.md#secondary-authentication) factors. Ziti is
deployed with a default authentication policy that has the id `default`. This authentication policy may be updated,
but not deleted. This default authentication policy is used when identities are created and an authentication
policy is not specified.


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
        "requireExtJwt": ""
    }
}
```


# Sections

An authentication policy is split into two separate major sections:

- primary - initial authentication to establish the authenticating principal
- secondary - additional MFA authentication challenges

## Primary

The primary section allow or disposals various authentication mechanisms used to establish the initial principal
(identity) authenticating. A viable authentication policy must allow at least one primary authentication mechanism.

- cert - x509 certificate based authentication
- extJwt - externally signed JWT bearer tokens
- updb - "username password database" which power traditional username/password authentication

### Certificate (cert)

Fields:
- allowed - enables/disabled x509 certificate authentication
- allowExpiredCerts - allows expired client certificates to authenticate

When certificate authentication is `allowed`, client certificates issued by the Ziti PKI and any verified and enabled
[3rd Party CAs](./third-party-cas.md) become valid authentication paths. When disabled an identity will not be able
to authenticate with any client certificate.

If `allowExpiredCerts` is true, client certificate expiration will be ignored during validation. This setting is 
useful in scenarios where client are running software that has lapsed and cannot be re-enrolled or their client
certificates cannot be updated. Clients do have an API available to them to roll existing Ziti PKI issued client 
certificates forward. Client certificates issued by a [3rd Party CAs](./third-party-cas.md) must have an external
process to maintain client certificate validity if `allowExpiredCerts` is false.


### External JWT Signers (extJwt)

Fields:

- allowed - whether external JWTs may be used for authentication
- allowedSigners - the ids of valid [External JWT Signers](./external-jwt-signers.md)

If `allowed` is true the [External JWT Signers](./external-jwt-signers.md) specified in the `allowedSigners` field
may be used for authentication.

### Username Password (updb)

- allowed - whether UPDB may be used for authentication
- maxAttempts - the maximum number of invalid logins allowed before an identity is locked for `lockoutDurationMinutes`, 0 for never
- lockoutDurationMinutes - the number of minutes to lock identities after `maxAttempts` is reached, 0 for forever

## Secondary

The secondary section contain only two top-level configuration values:

- requireTotp - if true authenticating clients must have [MFA TOTP](./totp.md) enabled
- requireExtJwt - if set to an id of an [External JWT Signer](./external-jwt-signers.md) every request must have a valid JWT in the HTTP `Authentication` header