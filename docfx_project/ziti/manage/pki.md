## Public Key Infrastructure (PKI)

All Ziti Networks leverage [Public Key Infrastructure (PKI)](https://en.wikipedia.org/wiki/Public_key_infrastructure) to
provide secure network connections.  This page is not intended to be a comprehensive guide. What it is, is a set of
rules that must be followed to properly configure a Ziti Network. If there are issues when connecting any portion
of a Ziti Network to another - this page should serve as a starting point of understanding.

> [!NOTE]
PKI is a complex topic and it is recommended to be familiar with what a PKI, what it is and how to properly use and
configure a PKI before making any decisions about the PKI the Ziti Network uses.

The Ziti Network allows the operator to declare any trust anchors as valid. This means Ziti does not need to be
configured with a full chain of certificates which link fully back to a root CA. A configuration using a full chain back
to a root CA is of course supported but it is not explicitly required.  This allows the operator to configure a Ziti
Network using one or more chains of trust back to the provided trust anchors.  The sections below will describe where
these trust anchors can be configured.

Ziti Network components are required to present a certificate to other Ziti Network components during the connection
establishment. This certificate will need to be valid per the configured trust anchor store being connected to.

### Ziti Controller

The Ziti Controller has three distinct sections related to PKI: `identity`, `edge.api.identity`,
`edge.enrollment.signingCert`. The `edge.api.identity` configuration section is optional and is provided to allow the external
ReST-based endpoint to present a certificate that is different than the one configured in the identity section.

Connections to the Ziti Controller are considered valid if the certificate presented during connection is signed by a
trust anchor declared within the identity.ca configuration or if the certificate presented is signed by the certificate
specified in the `edge.enrollment.signingCert`.

#### PKI Configuration

The identity section of the Ziti Controller configuration is used by the Ziti Controller when connections are
established to or from other components of a Ziti Network. There are four sections in the identity block:
`cert`, `server_cert`, `key`, `ca`.

**ca**: A file representing a group of certificates with one or more certificate chains terminating at a trust anchor.
When a Ziti Network component connects to the Ziti Controller and offers a certificate for validation the incoming
connection is checked to see if it signed by a trust anchor specified in this file.

**key**: Also referred to as the [private key](https://en.wikipedia.org/wiki/Symmetric-key_algorithm). It is generated
first and used to produce the certificates specified in the `cert` and `server_cert` fields of the Ziti Controller
configuration file.

**cert**: The certificate presented to other Ziti Network components during connection establishment.

**server_cert**: The certificate returned by the Ziti Controller when other Ziti Network components attempt to
communicate to the Ziti Controller over the IP and port specified in the `ctrl.listener` or `mgmt.listener` fields of the Ziti Controller
configuration file. If an edge section is present in the configuration file and no edge.api.identity section exists this
certificate is also returned to incoming connections to the `edge.api.advertise` endpoint.

### Edge Router

An Edge Router has one section related to PKI: `identity`. It is important to note that an Edge Router will
manage its own PKI. Allowing the Edge Router to manage its own PKI is almost certainly desired. The
only setting that an operator may wish to provide is the `key` field of the identity. This field is treated differently
than the other values specified.  If the `key` specified does not exist a new key will be generated. If the `key`
provided exists the Edge Router will use it and the other fields will be **regenerated and overwritten** as necessary.

The certificate generated will be signed by the Ziti Controller using the certificate specified in `edge.enrollment.signingCert`.

#### PKI Configuration

The `identity` section of the Edge Router configuration is used by the Edge Router when connections are
established to or from the other components of a Ziti Network. There are four sections in the identity block:
`cert`, `server_cert`, `key`, `ca`.

**ca**: A file representing a group of certificates with one or more certificate chains terminating at a trust anchor.
When a Ziti Network component connects to the Edge Router and offers a certificate for validation the incoming
connection is checked to see if it signed by a trust anchor specified in this file.

**key**: Also referred to as the [private key](https://en.wikipedia.org/wiki/Symmetric-key_algorithm). It is generated
first and used to produce the certificates specified in the `cert` and `server_cert` fields of the Edge Router
configuration file.

**cert**: The certificate presented to other Ziti Network components during connection establishment.

**server_cert**: The certificate returned by the Edge Router when other Ziti Network components attempt to
communicate to the Edge Router over the IP and port specified in the `ctrl.listener` or `mgmt.listener` fields of the Edge Router
configuration file.

### Third Party CA

An important feature of Ziti is that it supports using third party PKIs to be used for identities. A third party CA is
one which is maintained and managed entirely outside of the Ziti Network. Ziti is never in posession of the private key.
This means the Ziti Network cannot maintain nor distribute the certificates necessary for creating secure connections.
Maintaining a PKI outside of the Ziti Network is a more complex deployment however if such a PKI is already established
and maintained setting up a Ziti Network with a third party CA may be desirable.

#### Registering the CA

Before a third party CA can be used it must be registered with the Ziti Network. This is done by informing the
Ziti Controller 

[!include[](./pki-troubleshooting.md)]