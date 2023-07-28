# API Session Certificates

API Session Certificates are ephemeral short-lived x509 certificates that can be created through a CSR process after
an API Session is [fully authenticated](../sessions.md#full-vs-partial-authentication). 

## Lifecycle & Scope

The certificates are scoped by the "valid before" and "valid after" dates in addition to the API Session. If an [API Session](../sessions.md#api-session) is 
removed (expiration, logout, etc.) the API Session Certificates created by that API Session are no longer valid.

API Session Certificates may only be used by the [API Session](../sessions.md#api-session) that created them. Attempting to use an [API Session](../sessions.md#api-session)
Certificate to connect to and Edge Router without the matching [API Session](../sessions.md#api-session) security token will be rejected.

## Use

API Session Certificates are useful for identities that do not use x509 certificates as a primary authentication mechanism.
API Sessions that use x509 certificates during primary authentication can use that  certificate for connections to
Edge Routers. For non-x509 primary authentication mechanisms (JWT, UPDB, etc.) API Session Certificates must be used
as no certificates will be available for use to connect to Edge Routers.

## Creation

API Session Certificates can be created by `POST /edge/client/v1/current-api-session/certificates`. The payload
needs to be a valid PEM-encoded CSR in the `csr` field. The CSR should contain at minimum subject information.
Sensitive fields such as key usage will be ignored. Additional Ziti-specific SANs
may be added.

### Request Payload

```json
{
  "csr": "-----BEGIN CERTIFICATE REQUEST-----\nMIICij...\n-----END CERTIFICATE REQUEST-----"
}
```

### Response Payload

```json
{
    "data": {
        "_links": {
            "self": {
                "href": "./current-api-session/certificates/URjzX9U1U"
            }
        },
        "id": "URjzX9U1U",
        "cas": "\n-----BEGIN CERTIFICATE-----\nMII...\n-----END CERTIFICATE-----\n",
        "certificate": "-----BEGIN CERTIFICATE-----\nMII...\n-----END CERTIFICATE-----\n"
    },
    "meta": {}
}
```

## List & Detail

API Session Certificates for the current [API Session](../sessions.md#api-session) may be: 

- listed: `GET /edge/client/v1/current-api-session/certificates`
- detailed: `GET /edge/client/v1/current-api-session/certificates/<id>`

## Delete

API Session Certificates may be removed via `DELETE /edge/client/v1/current-api-session/certificates/<id>`