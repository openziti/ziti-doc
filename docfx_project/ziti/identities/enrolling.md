## Enrolling an Identity

All connections made to the Ziti network leverage [mutual TLS](https://en.wikipedia.org/wiki/Mutual_authentication)
which means every client needs a valid X509 certificate which it will present to the Ziti network during the connection
process. The process of obtaining a key/certificate pair and presenting it securely to the Ziti Controller is called
"Enrollment".

### Overview

All identities need to be enrolled with the Ziti Controller so the Ziti Controller can authenticate the incoming connection.
This process is slightly different for each type of identity and is complex. The easiest way to enroll an identity is to 
use either the Ziti Desktop Edge/Ziti Mobile Edge for your operating system. Alternatively, you may perform the enrollment separate with the `ziti` CLI:

[!include[](../downloads/ziti-cli.md)]

### One Time Token Enrollment - Internal PKI

Perhaps the easiest path to an enrolled identity is by using the one-time token enrollment flow. This flow leverages the
PKI configured in the Ziti Controller.  Using the one-time token flow - the `ziti` CLI will generate a private key
and a certificate signing request for the Ziti Controller's built-in certificate authority to fulfill.

Follow these steps to enroll an identity with a one-time token:

* [create the Identity](./creating.md)
* download or copy the JWT - this file contains the single use token
* run `ziti` :

**Example Usage:**

    ziti edge enroll \
        --jwt ${jwt_file} \
        --out ${identity_config_file}

> [!IMPORTANT]
> The output from the `ziti` is a permanent identity configuration file which
> must be stored securely. This file contains within it the private key that backs
> the certificate issued by the Ziti Controller.  This file should not be
> transferred or shared and should not be moved from the machine unless you are
> confident you understand the risks involved in doing so.

### 3rd Party CA - One Time Token

This process is similar to the One Time Token flow from above. This flow expects that a private key and certificate have
already been created on or distributed to the machine that is about to enroll and that the certificate presented is
signed by a [third party CA](~/ziti/manage/pki.md#third-party-ca-optional) already validated in the Ziti Controller.

Follow these steps to enroll a 3rd Pary CA - one-time token identity:

* [create the Identity](./creating.md)
* download or copy the JWT - this file contains the one-time token
* run the `ziti-tunneler` for your given operating system. Notice you can provide the name of the identity :

**Example Usage:**

    ziti edge enroll \
        --cert ${user_certificate} \
        --key ${user_private_key} \
        --jwt ${one_time_jwt_file} \
        --out ${identity_config_file}

### 3rd Party CA - Auto

When using a third party CA identity creation process in the Ziti Controller is
automatic. The act of enrolling the identity will create it. Like "3rd Party CA
- One Time Token" - this flow expects that a private key and certificate have
already been created on or distributed to the machine that is about to enroll.
The certificate presented to the Ziti Controller must be issued by a [third
party CA](~/ziti/manage/pki.md#third-party-ca-optional) that was already
imported and verified in the Ziti Controller with the
`isAutoCaEnrollmentEnabled` property set to true.

Using the `ziti` CLI will also require the re-use of a permanent JWT that is unique to the external CA. The JWT
can be downloaded from the Ziti Controller from:  `${controller_uri}/cas/${id}/jwt` where `${controller_uri}` represents
the fully qualified address of the Ziti Controller api and `${id}` represents the identifier for the given third party CA.

**Example Usage:**

    ziti edge enroll \
        --cert ${user_certificate} \
        --key ${user_private_key} \
        --jwt ${reusable_ca_jwt_file} \
        --out ${identity_config_file}

If supplied the `idname` will be used as the name for the identity created. The default name of auto-created identities is generated from a template that uses values from the user certificate i.e. `[caName]-[commonName]`.
