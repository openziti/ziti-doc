## Enrolling an Identity

All connections made to the Ziti network leverage [mutual TLS](https://en.wikipedia.org/wiki/Mutual_authentication)
which means every client needs a valid X509 certificate which it will present to the Ziti network during the connection
process. The process of obtaining a key/certificate pair and presenting it securely to the Ziti Controller is called
"Enrollment".

### Overview

All identities need to be enrolled with the Ziti Controller so the Ziti Controller can authenticate the incoming connection.
This process is slightly different for each type of identity and is complex. The easiest way to enroll an identity is to 
use either the Ziti Desktop Edge/Ziti Mobile Edge for your operating system. Alternatively, NetFoundry has created a tool 
to aid the enrollment process named `ziti-tunneler`. It is recommended that you use `ziti-tunneler` to complete the 
enrollment as the process itself complex:

[!include[](../downloads/tunneler.md)]

### One Time Token Enrollment - Internal PKI

Perhaps the easiest path to an enrolled identity is by using the one time token enrollment flow. This flow leverages the
PKI configured in the Ziti Controller.  Using the one time token flow - the `ziti-tunneler` will generate a private key
and a certificate signing request for the Ziti Controller to sign.

Follow these steps to enroll a one time token identity:

* [create the Identity](./creating.md)
* download or copy the jwt - this file contains the single use token
* run the `ziti-tunneler` for your given operating system:

**Example Usage:**

    ziti-tunneler enroll --jwt ${jwt_file}

> [!IMPORTANT]
> The output from the `ziti-tunneler` is a json file which must be kept secure. This file contains within it the private key
> used to generate a certificate request which was sent to the Ziti Controller and signed.  This file should not be
> transferred or shared and should not be moved from the machine unless you are confident you understand the risks
> involved in doing so.

### 3rd Party CA - One Time Token

This process is similar to the One Time Token flow from above. This flow expects that a private key and certificate have
already been created on or distributed to the machine that is about to enroll and that the certificate presented is
signed by a [third party CA](~/ziti/manage/pki.md#third-party-ca-optional) already validated in the Ziti Controller.

Follow these steps to enroll a 3rd Pary CA - one time token identity:

* [create the Identity](./creating.md)
* download or copy the jwt - this file contains the single use token
* run the `ziti-tunneler` for your given operating system. Notice you can provide the name of the identity :

**Example Usage:**

    ziti-tunneler enroll -v --jwt ${jwt_file} --cert ${identity_path_to_cert} --key ${identity_path_to_key} --idname ${identity_name}

### 3rd Party CA - Auto

When using a third party CA identity creation process in the Ziti Controller is automatic. The act of enrolling the
identity will create it. Like "3rd Party CA - One Time Token" - this flow expects that a private key and certificate
have already been created on or distributed to the machine that is about to enroll. The certificate presented to the
Ziti Controller must be signed by a [third party CA](~/ziti/manage/pki.md#third-party-ca-optional) already
uploaded and validated in the Ziti Controller with the `isAutoCaEnrollmentEnabled` property set to true.

Using the `ziti-tunneler` will also require the use of a jwt specifically created for the enrollment process. The jwt
can be downloaded from the Ziti Controller from:  `${controller_uri}/cas/${id}/jwt` where `${controller_uri}` represents
the fully qualified address of the Ziti Controller api and `${id}` represents the identifier for the given third party CA.

**Example Usage:**

    ziti-tunneler enroll --jwt ${jwt_file} --cert ${identity_path_to_cert} --key ${identity_path_to_key} --idname ${identity_name}

If supplied the `idname` will be used as the name for the identity created. If not supplied the common name will be used
as the name of the identity within the Ziti Controller.
