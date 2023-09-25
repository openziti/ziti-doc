# Enrollment

Enrollment is the process of some Edge client or Edge Router associating itself with a Ziti network. Client enrollment
results in the creation of an identity or associating security credentials with a pre-provisioned identity.
Ziti Router enrollment is exclusively associating security credentials with a pre-provisioned Edge Router.

## Routers

Upon creation of an Edge Router, enrollment details in the form of a JWT that acts as a one-time-token become 
available in the `enrollmentJWT` field.

**Create:**
`POST /edge/management/v1/edge-routers`
```
{
  "name": "test3"
}
```

**Get:**
`GET /edge/management/v1/edge-routers/PYvobLGzj`
```
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

Routers will automatically maintain their enrollment by refreshing their certificates seven days before they expire.

## Clients

Client enroll in one of two major categories:

- pre-provisioned - identities are created before the client attempts to run and are provided with one-time-tokens to enroll
  - OTT, OTT CA
- post-provisioned - an identity is created during enrollment
  - Auto CA

### OTT Enrollment

OTT Enrollment involves creating an identity and then delivering the enrollment JWT to client software that can then
complete enrollment.

#### Create

##### Ziti CLI

`ziti edge create identity [device|service|user] test-user10 -j ./my.token.jwt`

#### Edge Management API
`POST /edge/management/v1/identities`
```
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

### Read

#### Ziti CLI

`ziti edge list identities 'id="-ItUkLGKUE"'`

#### Edge Management API

`GET /edge/management/v1/identities/-ItUkLGKUE`
```
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

### OTT CA Enrollment

OTT CA Enrollment requires that the enrolling client also has an existing client certificate signed by a 
[3rd Party CA](./authentication/third-party-cas). When creating an identity the `id` of the target
[3rd Party CA](./authentication/third-party-cas) is specified.

#### Create

##### Edge Management API

`POST /edge/management/v1/identities`
```
{
  "name": "test-user10",
  "type": "User",
  "isAdmin": false,
  "roleAttributes": [
    "dial"
  ],
  "enrollment": {
    "ottca": "<ott-ca-id>"
  }
}
```

An enrollment JWT can be retrieved in the same manner as [OTT Enrollment](#ott-enrollment)

### Auto CA Enrollment

Auto CA enrollment allows a [3rd Party CA](./authentication/third-party-cas) to have clients enroll with a
Ziti network without first creating an identity or distributing a JWT enrollment token. Create a
[3rd Party CA](./authentication/third-party-cas) and ensure that `isAutoCaEnrollmentEnabled` is set to `true`.

The name of enrolling clients is controlled by the `identityNameFormat` of the [3rd Party CA](./authentication/third-party-cas).
The format support a number of replacement strings:

- `[caName]` - the Ziti `name` of the [3rd Party CA](./authentication/third-party-cas) that validates the enrolling certificate
- `[caId]` - the Ziti `id` of the [3rd Party CA](./authentication/third-party-cas) that validates the enrolling certificate
- `[commonName]` - the common name of the enrolling certificate
- `[requestedName]` - clients can submit a requested name during enrollment
- `[identityId]` - the `id` of the created identity

The default format is `[caName] - [commonName]`.

Identity names are unique and if a collision occurs, incrementing numbers are appended.

### Client Re-Enrollment

Clients may request to extend enrollments that generated x509 certificates if the client certificate was issued by
Ziti. If the client's certificate was issued by a [3rd Party CA](./authentication/third-party-cas), the
client certificate renewal must be handled outside of Ziti.
