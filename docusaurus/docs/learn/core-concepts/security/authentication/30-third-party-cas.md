---
sidebar_position: 30
---

# 3rd Party CAs

3rd Party CAs allow external private key infrastructures (PKIs) to be imported into OpenZiti and used for client enrollment
and authentication. OpenZiti does not allow external private keys from PKIs to be imported for 3rd party CAs. Creation,
distribution, renewal, and revocation of client certificates must all be handled outside of OpenZiti by the external CA.
Ziti trusts certificates signed by a registered 3rd Party CA but has no ability to revoke them.

3rd Party CAs represent x509 Certificate chains that have the `CA:true` constraint. It is worth noting
that adding a x509 certificate as a 3rd Party CA will treat it as a trust anchor even if it is an intermediate CA.
3rd Part CAs validate partial chains back to a registered 3rd Party CA. If full chain validation is required, ensure
that the root CA is added as a 3rd Party CA and ensure authenticating clients provide their client certificate in
index zero and any required intermediate certificates afterwards.


## Usage 

3rd Party CAs can be used in the following manners:
- allows clients to enroll and authenticate automatically for at-scale network boarding - [Auto CA Enrollment](../enrollment.mdx#auto-ca-enrollment)
- allows clients to enroll pre-created identities - [OTT CA Enrollment](../enrollment.mdx#ott-ca-enrollment)
- allows clients to map to pre-created identities using `externalId` and [X509 Claims](#external-id--x509-claims)

## Create

Creating a 3rd Party CA has various option that will determine how the 3rd Party CA will be used and how client
certificates will be validated. The following fields configure client authentication:

- `isAutoCaEnrollmentEnabled` - when true, a client presenting a certificate signed by this CA that has no existing
  identity will have one created automatically on first authentication. No pre-created identity or enrollment JWT is
  required. See [Auto CA Enrollment](../enrollment.mdx#auto-ca-enrollment).
- `isOttCaEnrollmentEnabled` - when true, a client may enroll using a certificate signed by this CA, but only if an
  administrator has pre-created an identity with an `ottca` enrollment token referencing this CA. The client
  presents both the enrollment JWT and their CA-signed certificate to complete enrollment. See
  [OTT CA Enrollment](../enrollment.mdx#ott-ca-enrollment).
- `isAuthEnabled` - allows already-enrolled clients with certificates signed by this CA to authenticate
- `externalIdClaim` - configuration used to pull values out of the x509 client certificate used to match identity `externalId`, see [External Id & x509 Claims](#external-id--x509-claims)

For [Auto CA Enrollment](../enrollment.mdx#auto-ca-enrollment) an identity is created on first authentication. 
The following fields allow configuration of newly created identities:

- `identityRoles` - the identity roles to give to automatically enrolling identities
- `identityNameFormat` - the identity name format used to name [automatically enrolling identities](../enrollment.mdx#auto-ca-enrollment)

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

### OpenZiti CLI

The OpenZiti CLI can assist with creating a verification certificate in two ways. It can create the verification certificate
and submit it or submit an already created certificate.

#### Create Verification Certificate & Submit

Access to the CA's certificate and private key is required.

` ziti edge verify ca <name> --cacert <signingCaCert> --cakey <signingCaKey> [--password <caKeyPassword>]`

#### Submit Verification Certificate

Access to a certificate with the `verifiationToken` set as the common name and signed by the 3rd Party CA is required

`ziti edge verify ca <name> --cert <pemCertFile>`

### Edge Management API

The [Edge Management API](../../../../reference/developer/api/index.mdx#edge-management-api) accepts and `id` in the URL path and x509 certificate PEM
as the body:

`POST /edge/management/v1/cas/<id>/verify`
```
—–BEGIN CERTIFICATE—–
MIIDdTCCAl2gAwIBAgILBAAAAAABFUtaw5QwDQYJKoZIhvcNAQEFBQAwVzELMAkG
...
HMUfpIBvFSDJ3gyICh3WZlXi/EjJKSZp4A==
—–END CERTIFICATE—–
```

## External ID & X509 Claims

The base set of capabilities of x509 certificates do not allow the inclusion of custom private claims. OpenZiti internally
uses [x509-claims](https://github.com/openziti/x509-claims) to allow claims data to be parsed from SANs and other
fields. An example of this in other projects is [SPIFFE](https://spiffe.io/). SPIFFE defines [SPIFFE IDs](https://spiffe.io/docs/latest/spiffe-about/spiffe-concepts/#spiffe-id)
which are stored in [SVIDs](https://spiffe.io/docs/latest/spiffe-about/spiffe-concepts/#spiffe-verifiable-identity-document-svid).

3rd Party CAs support defining a set of x509 claims configuration that allows a claim to be matched to an identity
`externalId`. The configuration is contained in an object in the field `externalIdClaim`. When not defined, x509
client certificate authentication attempts to find an Identity that is tied to an [Authenticator](00-auth.md#authenticators)
by matching the raw certificate body. Using x509 claims, the client is matched by the Identity `externalId` value.

This distinction matters when certificates need to be reissued. Without x509 claims, a reissued certificate has a
different raw body and will not match the existing Authenticator, requiring the Identity to re-enroll with the new
certificate. With x509 claims configured, authentication matches on specific claim values extracted from the
certificate, such as a SPIFFE ID in a SAN URI, and the 3rd Party CA can issue a replacement certificate carrying
the same claims without disrupting authentication.

The fields under `externalIdClaim` are as follows:

- `location` - defines which value(s) in an x509 certificate will be processed: `COMMON_NAME`, `SAN_URI`, `SAN_EMAIL`
- `matcher` - defines how values from `location` will be filtered: `ALL`, `PREFIX`, `SUFFIX`, `SCHEME`
- `matcherCriteria` - defines the `PREFIX`, `SUFFIX`, or `SCHEME` to look for based on `matcher`
- `parser` - defines how values from `location` filtered by `matcher` will be parsed: `NONE`, `SPLIT`
- `parserCriteria` - defines the criteria to provide to `parser`
- `index` - should multiple values still be available after `location`, `matcher,` and `parser` processing the integer value here will be used from the set

#### CA Create/Update REST API
```text
{
  "name": "myCA",
  "certPem": "—–BEGIN CERTIFICATE—–\nMIIDdTCCAHMU...\n—–END CERTIFICATE—–",
  "externalIdClaim": {
    "location": "SAN_URI",
    "matcher": "SCHEME",
    "parser": "NONE",
    "parserCriteria": "",
    "index": 0
  }
}
```
#### OpenZiti CLI

```
ziti edge create ca myCa ca.pem \
    --location SAN_URI \
    --matcher SCHEME \
    --matcher-criteria spiffe \
    --parser "NONE"
```

```
ziti edge update ca myCa \
    --location SAN_URI \
    --matcher SCHEME \
    --matcher-criteria spiffe \
    --parser "NONE"
```

### Location, Matcher, Parser

x509 claims are located, matched, and parsed. Location defines where the value(s) are sourced from, matching filters, 
and parsing allows for a single value to yield multiple claims.

#### Location

Location configuration sources value(s) from the x509 certificate

- `COMMON_NAME` - the common name of the certificate
- `SAN_URI` - SAN URI fields
- `SAN_EMAIL` - SAN email fields

#### Matcher & Matcher Criteria

Matcher and matcher criteria work together to filter fields. The `matcher` uses `matcherCritera` to perform basic
filtering.

Matcher values:

- `ALL` - returns all values (i.e. no filtering)
- `PREFIX` - matches by the string prefix defined by `matcherCriteria`
- `SUFFIX` - matched by the string suffix defined by `matcherCriteria`
- `SCHEME` - a matcher that specializes in matching the protocol defined in `matcherCriteria` of  a URI (used with `SAN_URI` only)

#### Parser & Parser Criteria

Parser and parser criteria work together to turn individual values from location and matching into multiple values.
Parsers allow a single value to contain more than one claim.

Parser values:
- `NONE` - perform no parsing
- `SPLIT` - perform string splitting based on the string separator defined by `parserCriteria`
