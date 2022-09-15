# 3rd Party CAs

3rd Party CAs allow external private key infrastructures (PKIs) to be imported into Ziti and used for client enrollment
and authentication. Ziti does not allow external private keys from PKIs to be imported for 3rd party CAs. Creation and
distribution of client certificates must be handled outside of Ziti.

3rd Party CAs represent x509 Certificate chains that have the `CA:true` constraint. It is worth noting
that adding a x509 certificate as a 3rd Party CA will treat it as a trust anchor even if it is an intermediate CA.
3rd Part CAs validate partial chains back to a registered 3rd Party CA. If full chain validation is required, ensure
that the root CA is added as a 3rd Party CA and ensure authenticating clients provide their client certificate in
index zero and any required intermediate certificates afterwards.


# Usage 

3rd Party CAs can be used in the following manners:
- allows clients to enroll and authenticate automatically for at-scale network boarding - [Auto CA Enrollment](../enrollment#auto-ca-enrollment)
- allows clients to enroll pre-created identities - [OTT CA Enrollment](../enrollment#ott-ca-enrollment)
- allows clients to map to pre-created identities using `externalId` and [X509 Claims](#external-id--x509-claims)


## Create

Creating a 3rd Party CA has various option that will determine how the 3rd Party CA will be used and how client
certificates will be validated. The following fields configure client authentication:

- `isAutoCaEnrollmentEnabled` - allows client certificates of the CA to automatically enroll when encountered
- `isOttCaEnrollmentEnabled` - allows client certificates of the CA to enroll if an identity with an `ottca` enrollment was created
- `isAuthEnabled` - allows client certificates of the CA to attempt to enroll
- `externalIdClaim` - configuration used to pull values out of the x509 client certificate used to match identity `externalId`, see [External Id & x509 Claims](#external-id--x509-claims)



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

` ziti edge verify ca <name> --cacert <signingCaCert> --cakey <signingCaKey> [--password <caKeyPassword>]`

#### Submit Verification Certificate

Access to a certificate with the `verifiationToken` set as the common name and signed by the 3rd Party CA is required

`ziti edge verify ca <name> --cert <pemCertFile>`

### Edge Management API

The [Edge Management API](../../api/edge-apis#edge-management-api) accepts and `id` in the URL path and x509 certificate PEM
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

The base set of capabilities of x509 certificates do not allow the inclusion of custom private claims. Ziti internally
uses [x509-claims](https://github.com/openziti/x509-claims) to allow claims data to be parsed from SANs and other
fields. An example of this in other projects is [SPIFFE](https://spiffe.io/). SPIFFE defines [SPIFFE IDs](https://spiffe.io/docs/latest/spiffe-about/spiffe-concepts/#spiffe-id)
which are stored in [SVIDs](https://spiffe.io/docs/latest/spiffe-about/spiffe-concepts/#spiffe-verifiable-identity-document-svid).

3rd Party CAs support defining a set of x509 claims configuration that allows a claim to be matched to an identity
`externalId`. The configuration is contained in an object in the field `externalIdClaims`. When not defined, x509
client certificate authentication attempts to find an identity that is tied to an [authenticator](auth#authenticators) 
by matching client certificates. Using x509 claims, the client is matched by the identity `externalId` value.

The fields under `externalIdClaims` is as follows:

- `location` - defines which value(s) in an x509 certificate will be processed: `COMMON_NAME`, `SAN_URI`, `SAN_EMAIL`
- `matcher` - defines how values from `location` will be filtered: `ALL`, `PREFIX`, `SUFFIX`, `SCHEME`
- `matcherCriteria` - defines the `PREFIX`, `SUFFIX`, or `SCHEME` to look for based on `matcher`
- `parser` - defines how values from `location` filtered by `matcher` will be parsed: `NONE`, `SPLIT`
- `parserCriteria` - defines the criteria to provide to `parser`
- `index` - should multiple values still be available after `location`, `matcher,` and `parser` processing the integer value here will be used from the set

#### SPIFFE Example:

```json
{
  "name": "myCA",
  "certPem": "—–BEGIN CERTIFICATE—–\nMIIDdTCCAHMU...\n—–END CERTIFICATE—–",
  "externalIdClaims": {
    "location": "SAN_URI",
    "matcher": "SCHEME",
    "parser": "NONE",
    "parserCriteria": null,
    "index": 0
  }
}
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