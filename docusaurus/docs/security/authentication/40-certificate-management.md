# Certificate Management

x509 client and server certificates are used for client, router, and controller verification. Client authentication
is possible through other means however router and controller verification is always x509 certificates.

In order to maintain valid client and server certificates, both routers and clients have API available to them to
extend their current certificates forward. These APIs only work for the internal Ziti PKI. Routers within a Ziti
network always use the internal Ziti PKI for their certificates. Clients may be configured to other external
PKIs via [3rd Party CAs](third-party-cas). In that scenario ZIti can not provide support for certificate
management.

## Router Certificate Extension

Routers will attempt to extend their current client and server certificates one week prior to expiration. No
intervention is necessary on behalf of the network administrator. The request sent to the controller via a 
pre-authenticated connection. If a router has been disconnected from the Ziti network and their client certificates
have expired, the router will have to be [re-enrolled](../enrollment#router-enrollment-extension).

## Client Certificate Extension

Clients may determine their own client certificate extension frequency. In order to extend their current client 
certificate issued by the Ziti PKI they must issue the following RESt request to either the 
[Edge Management API](../../api/edge-apis#edge-management-api) or [Edge Client API](../../api/edge-apis#edge-client-api) 
after becoming [fully authenticated](auth#full-vs-partial-authentication).

### Client Certificate Extension

The Ziti SDKs provide helper functions for this process and issuing these requests manually should not be necessary.

The `id` necessary to extend a specific authenticator may be obtained by listing the clients current authenticators
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