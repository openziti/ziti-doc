# 3rd Party CAs

3rd Party CAs allow external private key infrastructures (PKIs) to be imported into Ziti and used for client enrollment
and authentication. Ziti does not allow external private keys from PKIs to be imported for 3rd party CAs. Creation and
distribution of client certificates must be handled outside of Ziti.

3rd Party CAs represent x509 Certificate chains that have the `CA:true` constraint. It is worth noting
that adding a x509 certificate as a 3rd Party CA will treat it as a trust anchor even if it is an intermediate CA.
3rd Part CAs validate partial chains back to a registered 3rd Party CA. If full chain validation is required, ensure
that the root CA is added as a 3rd Party CA and ensure authenticating clients provide their client certificate in
index zero and any required intermediate certificates afterwards.

## Usage 

3rd Party CAs can be used in the following manners:

- allows clients to enroll and authenticate automatically for at-scale network boarding - [Auto CA Enrollment](../enrollment.md#auto-ca-enrollment)
- allows clients to enroll pre-created identities - [OTT CA Enrollment](../enrollment.md#ott-ca-enrollment)
- allows clients to map to pre-created identities using `externalId` and [X509 Claims](../authentication/50-external-id-claims.md#claiming-an-edge-identity-with-a-client-x509-certificate-from-an-external-signer)

## Create

Creating a 3rd Party CA has various option that will determine how the 3rd Party CA will be used and how client
certificates will be validated. The following fields configure client authentication:

- `isAutoCaEnrollmentEnabled` - allows client certificates of the CA to automatically enroll when encountered
- `isOttCaEnrollmentEnabled` - allows client certificates of the CA to enroll if an identity with an `ottca` enrollment was created
- `isAuthEnabled` - allows client certificates of the CA to attempt to enroll
- `externalIdClaim` - configuration used to pull values out of the x509 client certificate used to match identity `externalId`, see [External Id & x509 Claims](../authentication/50-external-id-claims.md#claiming-an-edge-identity-with-a-client-x509-certificate-from-an-external-signer)

For [Auto CA Enrollment](../enrollment#auto-ca-enrollment) an identity is created on first authentication. 
The following fields allow configuration of newly created identities:

- `identityRoles` - the identity roles to give to automatically enrolling identities
- `identityNameFormat` - the identity name format used to name [automatically enrolling identities](../enrollment#auto-ca-enrollment)

On initial creation of a 3rd Party CA it will be in an unverified stated and must undergo [verification](#verification).
The following fields relate to [verification](#verification):

- `isVerified` - read only field of whether this CA has been verified
- `verificationToken` - read only displaying the verification token required to verify the CA

All other fields are for informational purposes:

- `name` - the name of the given CA
- `fingerprint` - read only field of the sha1 fingerprint of the provided x509 certificate
- `certPem` - PEM encoded version of the CA

## Verification 

In order for a 3rd Party CA to be used authentication and enrollment it must first be verified. While in an unverified
state `isVerfieid` will be false and `verificationToken` will contain a random security token. In order to verify
the 3rd Party CA a certificate with the `verificationToken` set as the common name must be signed by the certificate
provided for the 3rd Party CA.

### Ziti CLI

The Ziti CLI can assist with creating a verification certificate in two ways. It can create the verification certificate
and submit it or submit an already created certificate.

#### Create Verification Certificate & Submit

Access to the CA's certificate and private key is required.

`ziti edge verify ca <name> --cacert <signingCaCert> --cakey <signingCaKey> [--password <caKeyPassword>]`

#### Submit Verification Certificate

Access to a certificate with the `verifiationToken` set as the common name and signed by the 3rd Party CA is required

`ziti edge verify ca <name> --cert <pemCertFile>`

### Edge Management API

The [Edge Management API](/docs/reference/developer/api#edge-management-api) accepts and `id` in the URL path and x509 certificate PEM
as the body:

`POST /edge/management/v1/cas/<id>/verify`

```pem
—–BEGIN CERTIFICATE—–
MIIDdTCCAl2gAwIBAgILBAAAAAABFUtaw5QwDQYJKoZIhvcNAQEFBQAwVzELMAkG
...
HMUfpIBvFSDJ3gyICh3WZlXi/EjJKSZp4A==
—–END CERTIFICATE—–
```

## Managing Edge Identities for 3rd Party CA Enrollment

### OTT CA Enrollment

OTT CA Enrollment requires that the enrolling client also has an existing client certificate signed by a verified 3rd Party CA. When creating an identity the `id` of the target 3rd Party must be specified. This is not yet supported by the Ziti CLI.

#### Create an Identity for a 3rd Party CA with Edge Management API

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
    "ottca": "<ott-ca-id>"
  }
}
```

The enrollment JWT can be retrieved by fetching the created identity by ID and parsing out the `enrollment.ottca.jwt` field. 

### Auto CA Enrollment

Auto CA enrollment allows a 3rd Party CA to have clients enroll with a Ziti network without first creating an identity. A signed, reusable JWT token is required for the Edge Identity to discover the client API URL and to authenticate the server certificate. 

Create a 3rd Party CA and ensure that `isAutoCaEnrollmentEnabled` is set to `true`.

The name of enrolling clients is controlled by the `identityNameFormat` of the 3rd Party CA. The format support a number of replacement strings:

- `[caName]` - the Ziti `name` of the 3rd Party CA that validates the enrolling certificate
- `[caId]` - the Ziti `id` of the 3rd Party CA that validates the enrolling certificate
- `[commonName]` - the common name of the enrolling certificate
- `[requestedName]` - clients can submit a requested name during enrollment
- `[identityId]` - the `id` of the created identity

The default format is `[caName] - [commonName]`.

Identity names are unique and if a collision occurs, incrementing numbers are appended.
