# Certificate Management

Clients, routers, and the controller use x509 client and server certificates. Client authentication
methods include certificates, but router and controller authentication always uses certificates.

Client and Routers with certificates from the internal Edge signer PKI may request new certificates by calling the Edge API.
Routers always have certificates from the internal Edge signer PKI. Clients can also be created with certificates from external
PKIs via [3rd Party CAs](./third-party-cas). Ziti can trust certificates from a configured external CA, but can not revoke or issue those certificates.

## Router Certificate Extension

Routers will attempt to extend their current client and server certificates one week prior to expiration. No
intervention is necessary on behalf of the network administrator. The request must be sent to the controller via a 
pre-authenticated connection. If a router has been disconnected from the Ziti network and their client certificates
have expired, the router must be [re-enrolled](../enrollment#router-enrollment-extension).

## Client Certificate Extension

Clients may determine their own client certificate extension frequency. In order to extend their current client 
certificate issued by the Ziti PKI, they must issue the following REST request to either the 
[Edge Management API](/docs/reference/developer/api#edge-management-api) or [Edge Client API](/docs/reference/developer/api#edge-client-api) 
after becoming [fully authenticated](./auth.md#full-vs-partial-authentication).

### Client Certificate Extension

The Ziti SDKs provide helper functions for this process and issuing these requests manually should not be necessary.

The `id` necessary to extend a specific authenticator may be obtained by listing the client's current authenticators
with `GET edge/*/v1/current-identity/authenticators` where `*` may be `management` or `client`. The CSR provided
must be PEM encoded.

#### Request
`POST edge/client/v1/current-identity/authenticators/{id}/extend`
```json
{
  "clientCertCsr": "-----BEGIN NEW CERTIFICATE REQUEST-----\n..."
}
```

#### Response:
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
