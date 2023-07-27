---
id: pki
title: Public Key Infrastructure (PKI)
sidebar_label: PKI
---

import PkiTroubleshootingMd from '../../guides/05-troubleshooting/pki-troubleshooting.md'

All Ziti Networks leverage [Public Key Infrastructure (PKI)](https://en.wikipedia.org/wiki/Public_key_infrastructure) to
provide secure network connections. 

The Ziti Network allows the operator to declare any trust anchors as valid. This means Ziti does not need to be
configured with a full chain of certificates which link fully back to a root CA. A configuration using a full chain back
to a root CA is of course supported but it is not explicitly required.  This allows the operator to configure a Ziti
Network using one or more chains of trust back to the provided trust anchors.  The sections below will describe where
these trust anchors can be configured.

Ziti Network components are required to present a certificate to other Ziti Network components during the connection
establishment. This certificate will need to be valid per the configured trust anchor store being connected to.

### Ziti Controller

The Ziti Controller configuration has these sections related to PKI: `identity` and `edge.enrollment.signingCert`. The `identity` section may appear multiple times in the configuration file. Each appearance of `identity` defines the server identity for a specific TLS server listener. The `edge.enrollment.signingCert` section is used to specify the certificate used to sign enrollment tokens. If only the top-level, default `identity` secion is present, it is used for all listeners.

Edge identities may be configured for client certificate authentication. Client TLS is permitted if the client certificate presented is from the edge enrollment signer
specified in `edge.enrollment.signingCert` or one of the verified external CAs. 

The trust bundle defined in controller config property `identity.ca` is not used to verify client certificates. Rather, clients fetch the well-known CA bundle `/.well-known/est/cacerts` from the controller during enrollment which includes the CA certs in `identity.ca` and the edge enrollment signer's certificate, and subsequently use that bundle to verify server certificates that are presented by the controller and routers.

#### PKI Configuration

Please refer to [the configuration reference](../../reference/30-configuration/conventions.md#identity) for a description of each property in the conventional `identity` section that is used n the controller's and routers' configuration files.

The `identity.server_cert` 

### Edge Router

An Edge Router has one section related to PKI: `identity`. It is important to note that an Edge Router will
manage its own PKI. Allowing the Edge Router to manage its own PKI is almost certainly desired. The
only setting that an operator may wish to provide is the `key` field of the identity. This field is treated differently
than the other values specified.  If the `key` specified does not exist a new key will be generated. If the `key`
provided exists the Edge Router will use it and the other fields will be **regenerated and overwritten** as necessary, if the filesystem is writable.

The Ziti Controller edge enrollment signer (`edge.enrollment.signingCert`) will issue a client and server certificate during enrollment. These are written to the file paths specified in the `identity` configuration section at the same time.

#### PKI Configuration

Please refer to [the configuration reference](../../reference/30-configuration/conventions.md#identity) for a description of each property in the conventional `identity` section that is used n the controller's and routers' configuration files.

### Third Party CA (optional)

A third party CA is one which is maintained and managed entirely outside of the Ziti Network. This is an important
feature for organizations wishing to administer and maintain the certificates used by the different pieces of the Ziti
Network. A Ziti Network is capable of using third party PKIs as the trust mechanism for enrollment and authentication of
clients for a Ziti Network.

With the PKI being managed externally a Ziti Network is never in possession of the private key. This means the Ziti
Network cannot maintain nor distribute certificates necessary for creating secure connections. The Ziti Network is
only capable of verifying if the certificate presented was signed by the externally managed PKI.

Maintaining a PKI outside of the Ziti Network is a more complex configuration. If a PKI is already established
and maintained externally setting up a Ziti Network with a third party CA may be desired.

#### Registering the CA

A Ziti Network will not trust any third party CA implicitly. Before a third party CA can be used for enrollment and
authentication of clients in a Ziti Network it must be registered with the Ziti Controller to ensure certificates signed
by the third party CA can be trusted.  

Registering a third party CA is done by using the REST endpoint `/cas` from the Ziti Controller. To register a third
party CA the following information is required to be posted to the endpoint:

* **name**: the desired name of the CA
* **isEnrollmentEnabled**: a boolean value indicating if the CA can be used for enrollment. Defaults to true. Set to false
  to prevent further enrollments using this CA
* **isAuthEnabled**: a boolean value indicating if the CA can be used for authentication. Defaults to true. Set to false to
  prevent all authentication from endpoints signed by this certificate

Assuming the create request was well formed and successful, the response from this invocation will contain a field
representing the `id` of the third party CA at `data.id`. The id of the third party CA will be needed when validating
the third party CA.

#### Verifying the CA

After being submitted to the Ziti Controller, the third party CA will have the isCsrValidated field set to false
indicating it is not yet ready for use. A second step is needed to ensure the third party CA is setup properly as a CA.
This step ensures the third party CA provided is capable of fulfilling CSR requests. Clients attempting to connect to a
Ziti Network using the third party CA will be rejected.

To validate the third party CA a CSR must be generated and fulfilled by the third party CA to generate a certificate
with the common name (CN) field set to a value assigned by the Ziti Controller. The Ziti Controller `/cas`
REST endpoint can be interrogated to retrieve the details for a specific third party CA. The field necessary to validate
the third party CA is `data.verificationToken` and is obtained at this endpoint. A certificate is then created and
signed by the third party CA with the common name field set to the verificationToken.

To finish verifying the third party CA, the certificate created with the verificationToken is posted back to the Ziti
Controller at `/cas/${id}/verify`. The `id` is also obtained during the creation process. After posting the certificate
with the `verificationToken` as the common name the third party CA will change from `isVerified=false` to `isVerified=true`.

<PkiTroubleshootingMd />