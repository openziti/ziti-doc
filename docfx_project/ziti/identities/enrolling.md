## Enrolling an Identity

All connections made to the Ziti network leverage [mutual TLS](https://en.wikipedia.org/wiki/Mutual_authentication)
which means every client needs a valid X509 certificate which it will present to the Ziti network during the connection
process. The process of obtaining a key/certificate pair and presenting it securely to the Ziti Controller is called
"Enrollment".

### Overview

All identities need to be enrolled with the Ziti Controller so the Ziti Controller can authenticate the incoming connection.
This process is slightly different for each type of identity. NetFoundry has created a tool to aid the enrollment
process named `ziti-enroller`. It is recommended that you use `ziti-enroller` to complete the enrollment as the
process itself complex. Enrollers are available here:

[!include[](../downloads/enroller.md)]

### One Time Token Enrollment - Internal PKI

Perhaps the easiest path to an enrolled identity is by using the one time token enrollment flow. This flow leverages the
PKI configured in the Ziti Controller.  Using the one time token flow - the `ziti-enroller` will generate a private key
and a certificate signing request for the Ziti Controller to sign.

Follow these steps to enroll a one time token identity:

* [create the Identity](./creating.md)
* download or copy the jwt - this file contains the single use token
* run the `ziti-enroller` for your given operating system:

    ziti-enroller --jwt ${jwt_file}

> [!IMPORTANT]
> The output from the `ziti-enroller` is a json file which must be kept secure. This file contains within it the private key
> used to generate a certificate request which was sent to the Ziti Controller and signed.  This file should not be
> transferred or shared and should not be moved from the machine unless you are confident you understand the risks
> involved in doing so.

### 3rd Party CA - One Time Token

This process is similar to the One Time Token flow from above. This flow expects that a private key and certificate have
already been created on the machine that is about to enroll and that the certificate presented is valid to a CA already
uploaded to the Ziti Controller.

Follow these steps to enroll a 3rd Pary CA - one time token identity:

* [create the Identity](./creating.md)
* download or copy the jwt - this file contains the single use token
* run the `ziti-enroller` for your given operating system. Notice you can provide the name of the identity :

    ziti-enroller -v --jwt ${jwt_file} --cert ${identity_path_to_cert} --key ${identity_path_to_key} --idname ${identity_name}

### 3rd Party CA - Auto

This enrollment process is almost entirely automated. With "auto" no identity needs to exist prior to enrollment. The
act of enrolling the identity actually creates the identity.  Like "3rd Party CA - One Time Token" - this flow expects
that a private key and certificate have already been created on the machine that is about to enroll and that the
certificate presented is valid to a CA already uploaded to the Ziti Controller. This flow also requires that a jwt
specifically created for enrollment be downloaded from the CA and the CA uploaded needs to be valid for
isAutoCaEnrollmentEnabled.

You can get the .jwt by downloading the file from:  `${controller_uri}/cas/${ca_id}/jwt`
