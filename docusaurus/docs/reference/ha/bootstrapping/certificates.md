---
sidebar_label: Certificates
sidebar_position: 20
---

# Controller Certificates

For controllers to communicate and trust one another, they need certificates that have
been generated with the correct attribute and relationships.

## Requirements

1. The certificates must have a shared root of trust
2. The controller client and server certificates must contain a 
   [SPIFFE ID](https://spiffe.io/docs/latest/spiffe-about/spiffe-concepts/#spiffe-id)

## Steps to Certificate Creation
There are many ways to set up certificates, so this will just cover a recommended configuration.

The primary thing to ensure is that controllers have a shared root of trust. 
A standard way of generating certs would be as follows:

1. Create a self-signed root CA
1. Create an intermediate CA for each controller
1. Issue a server cert using the intermediate CA for each controller
1. Issue a client cert using the intermediate CA for each controller

Note that controller server and client certs must contain a SPIFFE id of the form

```
spiffe://<trust domain>/controller/<controller id>
```

So if your trust domain is `example.com` and your controller id is `ctrl1`, then your SPIFFE id
would be:

```
spiffe://example.com/controller/ctrl1
```

**SPIFFE ID Notes:**

* This ID must be set as the only URI in the `X509v3 Subject Alternative Name` field in the
  certificate.
* These IDs are used to allow the controllers to identify each during the mTLS negotiation.
* The OpenZiti CLI supports creating SPIFFE IDs in your certs
    * Use the `--trust-domain` flag when creating CAs
    * Use the `--spiffe-id` flag when creating server or client certificates

## Example

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
