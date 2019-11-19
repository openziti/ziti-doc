## Public Key Infrastructure (PKI)

All Ziti networks leverage [Public Key Infrastructure (PKI)](https://en.wikipedia.org/wiki/Public_key_infrastructure) in
order to provide a secure network.  PKI is a complex topic and it is recommended to be familiar with what a PKI, what it
is and how to properly use and configure a PKI before making any decisions about the PKI the Ziti network uses.

This page is not intended to be a comprehensive guide. What it is, is a set of rules that must be followed to properly
configure you Ziti Network. If you run into issues with connecting any portion of a Ziti Network to another - this page
should serve as a starting point of understanding.

### Controller

The Ziti Controller has three distinct sections related to PKI: identity, edge.api.identity,
edge.enrollment.signingCert. Depending on the configuration of the Ziti Network in question there one ore all three of
these sections will be required.

#### identity

The identity block of the Ziti Controller configuration is used by the Ziti Controller when it presents endpoints to be
connected to as well as when the Ziti Controller needs to contact other pieces of the Ziti Network. There are four
sections of the identity block: cert, server_cert, key, ca.

**ca**: a file representing the chain of certificates. The chain must contain the issuer of the certificate specified in
the `cert` field in the controller configuration file and must contain the entire chain of certificates back to root ca.

**key**: also referred to as the [private key](https://en.wikipedia.org/wiki/Symmetric-key_algorithm). It is generated
first and used to produce the certificates specified in the `cert` and `server_cert` fields ofthe controller
configuration file.

**cert**: the certificate presented to other Ziti Network components.

**server_cert**: the certificate the Ziti Controller presents when other Ziti Network components attempt to communicate to
the Ziti Controller over the IP and port specified in the `ctrl.listener` or `mgmt.listener` fields of the controller
configuration file.
