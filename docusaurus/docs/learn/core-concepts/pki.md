---
id: pki
title: Public Key Infrastructure
sidebar_label: PKI
---

import PkiTroubleshootingMd from '../../guides/05-troubleshooting/pki-troubleshooting.md'

[Public Key Infrastructure](https://en.wikipedia.org/wiki/Public_key_infrastructure) (PKI) is used to establish trust between all Ziti components. The Ziti controller enrolls identities with a PKI that it manages, and externally-managed PKIs may be verified with the Ziti controller and used for enrollment. Enrollment is best suited for long-lived client certificate fingerprint authentication.

Alternatively to enrollment, external PKIs may be trusted to sign authenticating documents, e.g., JWT or certificate, that are used to [claim an existing Ziti identity](./security/authentication/50-external-id-claims.md).

### Ziti Controller

A Ziti network's PKI always has at least one CA that is managed by the Ziti controller: the Edge enrollment CA. The Edge enrollment CA issues client authentication certificates to identities during identity enrollment. The Edge enrollment CA issues client and server authentication certificates to routers during router enrollment. 

The Ziti controller's own leaf certificates are not necessarily issued by the Edge enrollment CA, and they are never issued automatically by the Ziti controller. The controller's own leaf certificates' life cycles are managed externally, not by the Ziti controller. Each server certificate presented by the controller must be accompanied by a certificate chain that terminates in a root CA that is declared in the controller's `identity.ca` bundle of known CAs.

The Ziti Controller configuration has these sections related to PKI: `identity` and `edge.enrollment.signingCert`. 

* The `edge.enrollment.signingCert` section defines the Edge enrollment CA's certificate and private key. 
* The `identity` section appears at the root level of the configuration file and, optionally, in any `web[]` listener. Each appearance of `identity` defines a TLS server identity. If only the root-level `identity` secion is present, it is used whenever a TLS server identity is needed by the controller.

<!-- the identity.cert property will be used to define the client authentication certificate for controller HA at which time we should update this to stop saying it's always a TLS server certificate -->

The controller provides these TLS servers:

* The control plane API is consumed by routers and presents the certificate defined in `identity.server_cert`.
* One or more web listeners provide bindings for the controller's REST APIs and other web services. Each web listener presents the certificate defined in its own `web[].identity.server_cert` property, or defaults to the root-level `identity.server_cert`.

:::note
The private key of the web listener to which [the Edge Client API](../../reference/developer/api/index.md#edge-client-api) is bound is used to sign Edge enrollment tokens. During enrollment, the identity or router in possession of a token will verify that it was signed by the same key that is backing the server certificate of the controller's Edge Client API. This allows the enrolling identity to confirm the Edge Client API URL is correct before requesting authentication certificate(s).
::: 

The trust bundle defined in controller config property `identity.ca` is used by the controller to bundle known CAs' certificates. This bundle is downloaded by clients during enrollment from the client API in `/edge/client/v1/.well-known/est/cacerts` and subsequently used to verify controller and router server certificate chains. These known CAs are never used by the controller to verify client certificates which are always from the controller's own Edge enrollment CA or a known, verified external CA.

#### Controller Configuration Reference

Please refer to [the configuration reference](../../reference/30-configuration/conventions.md#identity) for a description of each property in the conventional `identity` section that is used in the controller's configuration file.

### Edge Router

An Edge Router has one section related to PKI: `identity`. It is important to note that an Edge Router will
manage its own PKI. Allowing the Edge Router to manage its own PKI is almost certainly desired. The
only setting that an operator may wish to provide is the `key` field of the identity. This field is treated differently
than the other values specified.  If the `key` specified does not exist a new key will be generated. If the `key`
provided exists the Edge Router will use it and the other fields will be **regenerated and overwritten** as necessary, if the filesystem is writable.

The Ziti Controller Edge enrollment CA (`edge.enrollment.signingCert`) will issue a client and server certificate during enrollment. These are written to the file paths specified in the `identity` configuration section at the same time.

#### Router Configuration Reference

Please refer to [the configuration reference](../../reference/30-configuration/conventions.md#identity) for a description of each property in the conventional `identity` section that is used in the router configuration file.

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