---
sidebar_label: Certificates
sidebar_position: 20
---

# Controller Certificates

For controllers to communicate and trust one another, they need certificates that have
been generated with the correct attributes and relationships.

## Glossary

### SPIFFE ID

A SPIFFE ID is a specially formatted URI which is intended to be embedded in a certificates. Applications
use these identifiers to figure out the following about the applications connecting to them.

1. What organization the peer belongs to
1. What type of application the peer is
1. The application's unique identifier

Controller certificates use SPIFFE IDs to allow the controllers to identify each during mTLS negotiation.

See [SPIFFE IDs](https://spiffe.io/docs/latest/spiffe-about/spiffe-concepts/#spiffe-id) for more information.

### Trust domain

A [trust domain](https://spiffe.io/docs/latest/spiffe-about/spiffe-concepts/#trust-domain)
 is the part of a SPIFFE ID that indicates the organization that an identity belongs to. 

## Requirements

1. The certificates must have a shared root of trust
1. The controller client and server certificates must contain a SPIFFE ID.
1. The SPIFFE ID must be set as the only URI in the `X509v3 Subject Alternative Name` field in the
   certificate.
1. The SPIFFE ID must have the following format: `spiffe://<trust domain>/controller/<controller id>`

So if the trust domain is `example.com` and the controller id is `ctrl1`, then the SPIFFE id
would be:

```
spiffe://example.com/controller/ctrl1
```

## Steps to Certificate Creation
There are many ways to set up certificates, so this will just cover an example configuration.

The primary thing to ensure is that controllers have a shared root of trust. 
One way of generating certs would be as follows:

1. Create a root CA
1. Create an intermediate CA for each controller
1. Issue a server cert using the intermediate CA for each controller
1. Issue a client cert using the intermediate CA for each controller

## Example

* The OpenZiti CLI supports creating SPIFFE IDs in certificates
    * Use the `--trust-domain` flag when creating CAs
    * Use the `--spiffe-id` flag when creating server or client certificates

Using the OpenZiti PKI tool, certificates for a three node cluster could be created as follows:

```bash
# Create the trust root, a self-signed CA
ziti pki create ca --trust-domain ha.test --pki-root ./pki --ca-file ca --ca-name 'HA Example Trust Root'

# Create the controller 1 intermediate/signing cert
ziti pki create intermediate --pki-root ./pki --ca-name ca --intermediate-file ctrl1 --intermediate-name 'Controller One Signing Cert'

# Create the controller 1 server cert
ziti pki create server --pki-root ./pki --ca-name ctrl1 --dns "localhost,ctrl1.ziti.example.com" --ip "127.0.0.1,::1" --server-name ctrl1 --spiffe-id 'controller/ctrl1'

# Create the controller 1 server cert
ziti pki create client --pki-root ./pki --ca-name ctrl1 --client-name ctrl1 --spiffe-id 'controller/ctrl1'

# Create the controller 2 intermediate/signing cert
ziti pki create intermediate --pki-root ./pki --ca-name ca --intermediate-file ctrl2 --intermediate-name 'Controller Two Signing Cert'

# Create the controller 2 server cert
ziti pki create server --pki-root ./pki --ca-name ctrl2 --dns "localhost,ctrl2.ziti.example.com" --ip "127.0.0.1,::1" --server-name ctrl2 --spiffe-id 'controller/ctrl2'

# Create the controller 2 client cert
ziti pki create client --pki-root ./pki --ca-name ctrl2 --client-name ctrl2 --spiffe-id 'controller/ctrl2'

# Create the controller 3 intermediate/signing cert
ziti pki create intermediate --pki-root ./pki --ca-name ca --intermediate-file ctrl3 --intermediate-name 'Controller Three Signing Cert'

# Create the controller 3 server cert
ziti pki create server --pki-root ./pki --ca-name ctrl3 --dns "localhost,ctrl3.ziti.example.com" --ip "127.0.0.1,::1" --server-name ctrl3 --spiffe-id 'controller/ctrl3'

# Create the controller 3 client cert
ziti pki create client --pki-root ./pki --ca-name ctrl3 --client-name ctrl3 --spiffe-id 'controller/ctrl3'
```
