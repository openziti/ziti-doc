---
sidebar_position: 60
---

# Certificate Management

Clients, routers, and the controller use x509 client and server certificates. Client authentication
methods include certificates, but router and controller authentication always uses certificates.

Client and Routers with certificates from the internal signer PKI may request new certificates.
Routers always have certificates from the internal signer PKI. Clients can also be created with certificates from
external PKIs via [3rd Party CAs](30-third-party-cas.md). OpenZiti can trust certificates from a configured external
CA, but cannot revoke or reissue them.

:::warning
When a client certificate issued by a 3rd Party CA expires, OpenZiti cannot renew it. Authentication will fail until the
certificate is renewed externally and re-presented. If certificate expiry is a concern and renewal cannot be guaranteed,
set `allowExpiredCerts: true` on the [Identity's](80-identities.md)
[Authentication Policy](50-authentication-policies.md) to allow expired certificates to authenticate. The external CA
remains responsible for managing the certificate lifecycle.
:::

## Router Certificate extension

Routers will attempt to extend their current client and server certificates one week prior to expiration. No
intervention is necessary on behalf of the network administrator. The request must be sent to the controller via a
pre-authenticated connection. If a router has been disconnected from the OpenZiti network and their client certificates
have expired, the router must be [re-enrolled](../enrollment.mdx#router-enrollment-extension).

## Client Certificate extension

This section applies only to client certificates issued by the OpenZiti internal PKI. Certificates issued by a
[3rd Party CA](30-third-party-cas.md) must be renewed externally.

Clients may determine their own client certificate extension frequency. In order to extend their current client
certificate, they must issue the following REST request to either the
[Edge Management API](/docs/openziti/reference/developer/api/edge-management-api-reference) or
[Edge Client API](/docs/openziti/reference/developer/api/edge-client-api-reference)
after becoming [fully authenticated](../../security/sessions.md#full-vs-partial-authentication).

### Client Certificate extension

The OpenZiti SDKs provide helper functions for this process and issuing these requests manually should not be necessary.

The `id` necessary to extend a specific authenticator may be obtained by listing the client's current authenticators
with `GET /edge/*/v1/current-identity/authenticators` where `*` may be `management` or `client`. The CSR provided
must be PEM encoded.

#### Request
`POST /edge/client/v1/current-identity/authenticators/{id}/extend`
```json
{
  "clientCertCsr": "-----BEGIN NEW CERTIFICATE REQUEST-----\n..."
}
```

#### Response

A new CA bundle and client certificate will be returned PEM encoded.

```json
{
  "data": {
      "ca": "-----BEGIN CERTIFICATE-----\nMIICZTCCAeygAwIBAgIUOoTKiY",
      "clientCert": "-----BEGIN CERTIFICATE-----\nMIICZTCCAeygAwIBAgIUOoTKiY"
  },
  "meta": {}
}
```
