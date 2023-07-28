# Enrollment

Enrollment is the process of some Edge client or Edge Router associating itself with a Ziti network. Client enrollment
results in the creation of an identity or associating security credentials with a pre-provisioned identity.
Ziti Router enrollment is exclusively associating security credentials with a pre-provisioned Edge Router.

## Identity Enrollment

Enrollment is how an Edge Identity registers an authentication mechanism with the Edge Controller. Each authentication mechanism could be a client certificate, a password, or a time-based one-time password (TOTP). The authentication mechanisms are used for primary or secondary authentication. An Edge Identity must enroll a certificate or password (primary) before enrolling a TOTP (secondary).

To enroll a primary authentication mechanism, the Edge Identity must possess an enrollment token and use it before it expires. The token is parsed as a JSON Web Token (JWT) to obtain the URL of the authentication API. The URL is fetched to obtain the public key of the server certificate. The public key is used to verify the signature of the enrollment token, proving to the Edge Identity that the token is authentic for the URL in the token. A secret value from the verified token is sent with the enrollment request to prove the authenticity of the request to the Edge Controller.

### Enrolling a Primary Authentication Mechanism

The client certificate authentication method requests a client certificate from the Edge CA and its fingerprint is registered with the Edge Controller as a certificate [Authenticator](./authentication/auth.md#authenticators). The Edge Identity may [request a new client certificate](./authentication/40-certificate-management.md#client-certificate-extension) before the current certificate expires to update the Authenticator with the new SHA1 fingerprint. The password authentication method registers a password Authenticator with the Edge Controller. 

#### Create an Identity with Ziti CLI

The default authentication mechanism is a one-time token (JWT) that may be used by the Edge Identity to obtain a client authentication certificate.

`ziti edge create identity [device|service|user] test-user10 -j ./my.token.jwt`

#### Create an Identity with Edge Management API

`POST /edge/management/v1/identities`

```json
{
  "name": "test-user10",
  "type": "User",
  "isAdmin": false,
  "roleAttributes": [
    "dial"
  ],
  "enrollment": {
    "ott": true
  }
}
```

#### Find Identities with Ziti CLI

`ziti edge list identities 'id="-ItUkLGKUE"'`

#### Find Identities with Edge Management API

`GET /edge/management/v1/identities/-ItUkLGKUE`

```json
{
  "data": {
    ...
    "id": "-ItUkLGKUE",
    "tags": {},
   ...
    "enrollment": {
      "ott": {
        "expiresAt": "2022-08-09T15:37:16.619Z",
        "id": "uFtU28GKj",
        "jwt": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbSI6Im90dCIsImV4cCI6MTY2MDA1OTQzNiwiaXNzIjoiaHR0cHM6Ly8xMjcuMC4wLjE6MTI4MCIsImp0aSI6IjdjM2VmOWFkLTE2ZjAtNDk4OS05MDQ3LTNmYzFmYTE5NDgyYyIsInN1YiI6Ii1JdFVrTEdLVUUifQ.JnLlHP9wdMlfgteAf4Y-KMnxRv_00EOhEtRRmMABg_dD7xRK2RQt-bwt5rkosfgghZPR4jppuR9Prg1F1skf7JGa9Z-CmEIVvmHB8LAT6AvNnRmfkNBioD4g-Q0LP1o_xZyfePUslSxwNYPevzYYdCwgXK-TuIW34sCirX1edZ25eRtlnTUq9T0cgqMyVCEtX03WkAhb8C_TLIzhWxCwxxJTY3lgOqwuMXQEqLrWFiuG6Q1aIAA8hjh57043z5a1GQ8sUGIWP0U7YuXBWzl50VY4fenrstaaanweQLDPCZlZGPKh08mPCAGAc4Fun10hBzYaezJXGb8BpEPKXrtmLA",
        "token": "7c3ef9ad-16f0-4989-9047-3fc1fa19482c"
      }
    },
    ...
  },
  "meta": {}
}
```

Alternatively, enrollments for an identity can be reviewed at `/edge/management/v1/identities/<id>/enrollments` or
`/edge/management/v1/enrollments` or `ziti edge list enrollments`.

### Enrolling a Secondary Authentication Mechanism

To enroll a [TOTP](./authentication/70-totp.md) as a secondary authentication mechanism, the Edge Identity first performs primary authentication with a client certificate or password. Then the Edge Identity proves it received the TOTP seed by generating a valid token. Any Edge Identity may enroll a TOTP at any time, and the Edge Controller may be configured at any time to require a secondary trust factor. A session is considered [partially-authenticated](./sessions.md#full-vs-partial-authentication) if the primary factor is valid and a secondary factor is required by an [Auth Policy](./authentication/30-authentication-policies.md). The session must be fully-authenticated before the Edge Identity may discover Ziti Services.

### Enrolling a Certificate from a Third-Party CA

The Edge Controller may be configured to [trust another CA](./authentication/10-third-party-cas.md) to issue client certificates that Edge Identities may use as primary authentication mechanisms. Those client certificates' fingerprints need to be registered through an enrollment process too, and the process differs because the certificate is not being issued by Ziti's Edge CA.

### Claiming an Edge Identity without Enrolling

Ziti also supports Edge Identity "claims" that are independent of any enrolled authentication mechanisms. [A claim](./authentication/50-external-id-claims.md) allows a trusted signer, e.g., x509 CA or OIDC IdP, to issue authentication mechanisms that are valid for assuming a particular existing Edge Identity. The properties of a verifiable document from the external provider must match a pre-configured pattern, e.g., common name property of an x509 client certificate, e.g., `CN="acme id"`, may match Edge Identity `Acme Identity 01` with property `externalId: "acme id"`. This is particularly useful for mapping many short-lived trust factors to a single Edge Identity.

## Router Enrollment

Upon creation of an Edge Router, enrollment details in the form of a JWT that acts as a one-time-token become 
available in the `enrollmentJWT` field.

**Create:**
`POST /edge/management/v1/edge-routers`

```json
{
  "name": "test3"
}
```

**Get:**
`GET /edge/management/v1/edge-routers/PYvobLGzj`

```json
{
    "data": {
        ...,
        "name": "test3",
        "enrollmentJwt": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbSI6ImVyb3R0IiwiZXhwIjoxNjYwMDU4ODU5LCJpc3MiOiJodHRwczovLzEyNy4wLjAuMToxMjgwIiwianRpIjoiYjkzZjg2NTgtZGQ3ZC00NTc4LWJkYTYtMmZhZWNlZjkyMTc3Iiwic3ViIjoiUFl2b2JMR3pqIn0.UN6QiifUfCMUvzsKwjSUarl9iWyOr1zsaa_6VzNTRn7EQ_PjtHFMm9QEjj8ErtkNIbyh-vaVLZL-TPOAIZsaQX2Ye5k8-M7dbWGiQ35DbgQaJSWLMJ0xzazHYBvhZvZ9Wc5F96HKA_qTGiSq5Lsm3WraAffepEqCe_F_HwBwjBPrsgO9U23pKuoz1X8pQbAj95yoz6rBNWo63mlZDeDn7McEiJLY0i7EyPQ3paEjJ0sSntVjfmZ7aPgThoG2HCYbhvj_DkXD_HRSwMxoQHR1yIA4sW4ukdQ_S3nVMurLOG06d0VSUzlIecQSuJT8XV56AhqZ-ZNIEzp-bp2YaL1FlA",
        "enrollmentToken": "b93f8658-dd7d-4578-bda6-2faecef92177",
        ...
        "isVerified": false,
        ...
    },
    "meta": {}
}
```

To enroll a router, deliver the `enrollmentJWT` to the host that will run the Edge Router and perform enrollment via:

`ziti router enroll -j <jwt_path>`

### Router Enrollment Extension

Routers will attempt to automatically maintain their enrollment by refreshing their certificates seven days before they expire. This only works if the router's identity certificate file is writable. If it is not writable, the router will not be able to refresh its certificate and will need to orchestrated for replacement more often than router client certificates are configured to expire.

### Client Re-Enrollment

Clients may request to extend enrollments that generated x509 certificates if the client certificate was issued by
Ziti. If the client's certificate was issued by a [3rd Party CA](./authentication/10-third-party-cas.md), the
client certificate renewal must be handled outside of Ziti.
