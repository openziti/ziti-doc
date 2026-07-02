---
sidebar_label: Certificates
sidebar_position: 20
---

# Controller certificates

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
1. The controller client certificate's Common Name must exactly match the controller ID part of the SPIFFE ID.
1. The SPIFFE ID must be set as the only URI in the `X509v3 Subject Alternative Name` field in the
   certificate.
1. The SPIFFE ID must have the following format: `spiffe://<trust domain>/controller/<controller id>`

So if the trust domain is `ziti.example.com` and the controller id is `ctrl1`, then the SPIFFE id
would be:

```
spiffe://ziti.example.com/controller/ctrl1
```

## Steps to certificate creation
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

# Create the controller 1 client cert
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

## Controller identity configuration

Once the certificates exist on disk, the controller config's `identity:` block tells the
controller where to find them. We recommend the four-field form: separate certs and
separate keys for the controller's client role (used when this controller connects to
peers) and its server role (used when peers connect to this controller).

```yaml
identity:
  cert:        ./pki/ctrl1/certs/client.chain.pem
  key:         ./pki/ctrl1/keys/client.key
  server_cert: ./pki/ctrl1/certs/server.chain.pem
  server_key:  ./pki/ctrl1/keys/server.key
  ca:          ./pki/ctrl1/certs/ctrl1.chain.pem
```

Two things worth highlighting:

* The `cert:` and `server_cert:` fields must point at the `.chain.pem` outputs from
  `ziti pki create`, not the bare `.cert` files. The chain includes the intermediate CA
  that peers need to validate the leaf cert back to the root.
* `key:` and `server_key:` must each match the private key the corresponding cert was
  issued from. The `ziti pki create server` and `ziti pki create client` commands
  generate separate keys by default (`server.key` and `client.key` under the
  controller's `keys/` directory), and the config above expects exactly that layout.

### Simpler variant: One cert for both roles

If you don't need the role separation, you can omit `server_cert` and `server_key`, in
which case `cert` and `key` are used for both incoming and outgoing mTLS. Functionally
this works fine -- the same cert is valid for both roles because the OpenZiti PKI tool
doesn't restrict `ExtKeyUsage`. The four-field form above is recommended because it
keeps the client and server key material independent, which is a healthier default for
security-sensitive deployments and generalizes to other OpenZiti identity
configurations (routers, SDK identities) where the separation matters more.

## Common bootstrapping errors

A few PKI-related errors come up regularly when bringing up a new HA cluster for the
first time. Each one below lists the symptoms, the root cause, and the fix.

### `tls: error decrypting message` (client cert's key doesn't match `key:` in the config)

**Symptoms**

One or more of:

* `cluster add failed: ... remote error: tls: error decrypting message`
* Server-side log: `tls: invalid signature by the client certificate: crypto/rsa: verification error`
* Peer log: `x509: certificate signed by unknown authority`

**Root cause**

The controller config's `identity.cert` points at a client cert that was issued from a
different private key than the one referenced in `identity.key`. During the mTLS
handshake the controller signs the `CertificateVerify` message with `identity.key`,
the peer verifies that signature against the public key embedded in the cert it
received, and the signatures don't match.

This usually happens when an operator uses a single `key:` field in the config (no
separate `server_key`) and points `cert:` at a client cert that was issued with its
own newly-generated key -- which is what `ziti pki create client` does by default.

**Fix**

Two options.

* **Use the four-field identity form** with separate `key:` and `server_key:`, as
  shown in [Controller identity configuration](#controller-identity-configuration).
  Each field then refers to the key that actually matches its cert.
* **Or, if you want to keep a single key**, re-issue the client cert from the
  server's key by adding `--key-file server` to the `ziti pki create client` command:

  ```bash
  ziti pki create client --pki-root ./pki --ca-name ctrl1 \
    --client-name ctrl1 --spiffe-id 'controller/ctrl1' \
    --key-file server
  ```

  Both certs will then share `server.key` and a single `key:` in the config works.

### `no certs presented matched the CA for this node` (cert path points at the leaf, not the chain)

**Symptoms**

* Peer log: `unable to validate peer connection, no certs presented matched the CA for this node`
* Initiating side: `error dialing peer tls:other.controller:1280: ... connection refused`
  or generic handshake failure
* The cluster never forms, or leadership is repeatedly lost during commit
* An `openssl s_client` handshake against the port succeeds, which can mask the issue
  when testing

**Root cause**

The `ziti pki create server` and `ziti pki create client` commands each produce two
output files: a bare leaf (`<name>.cert`) and a full chain (`<name>.chain.pem`). The
chain file includes the intermediate CA between the leaf and the root.

If `identity.cert` or `identity.server_cert` points at the bare `.cert`, the
controller presents only the leaf during the TLS handshake. Peers don't have the
intermediate CA in their trust store (they trust the root), so they can't build a
valid chain and reject the connection.

**Fix**

Point `cert:` and `server_cert:` at the `.chain.pem` outputs, not the `.cert` files:

```yaml
identity:
  cert:        ./pki/ctrl1/certs/client.chain.pem
  key:         ./pki/ctrl1/keys/client.key
  server_cert: ./pki/ctrl1/certs/server.chain.pem
  server_key:  ./pki/ctrl1/keys/server.key
  ca:          ./pki/ctrl1/certs/ctrl1.chain.pem
```

The recommended layout in
[Controller identity configuration](#controller-identity-configuration) already uses
chain files; this error usually comes from copying parts of older example configs
that referenced `.cert` directly.

### `x509: certificate signed by unknown authority` under systemd (relative PKI paths)

**Symptoms**

The cluster fails to form *only* when the controller runs under systemd; the same
config and PKI work when the controller is launched manually from the install
directory. Specific log lines include:

* `cluster add failed: ... tls failed to verify cert: x509: certificate signed by unknown authority`
* Admin UI / API returns `tls: first record does not look like tls`
* Router log: `no handler for requested protocols [ziti-ctrl]`
* Peer mesh log: `remote error: tls: internal error`

**Root cause**

The controller config uses **relative paths** for the PKI files (e.g.
`pki/ctrl1/certs/server.chain.pem`). Relative paths resolve against the process's
working directory. When the operator launches the controller by hand from the install
directory, the working directory happens to be correct. When systemd runs the
controller, its `WorkingDirectory=` is something else (often `/`), the relative paths
point at files that don't exist, and the controller silently comes up without certs
loaded. Peers then see no usable certs and respond with the trust-store error.

**Fix**

Two options, either is fine.

* **Use absolute paths in the controller config:**

  ```yaml
  identity:
    cert:        /etc/ziti/ctrl1/pki/ctrl1/certs/client.chain.pem
    key:         /etc/ziti/ctrl1/pki/ctrl1/keys/client.key
    server_cert: /etc/ziti/ctrl1/pki/ctrl1/certs/server.chain.pem
    server_key:  /etc/ziti/ctrl1/pki/ctrl1/keys/server.key
    ca:          /etc/ziti/ctrl1/pki/ctrl1/certs/ctrl1.chain.pem
  ```

* **Or set `WorkingDirectory=` in the systemd unit** to match the directory the
  relative paths assume:

  ```ini
  [Service]
  WorkingDirectory=/etc/ziti/ctrl1
  ExecStart=/usr/local/bin/ziti controller run /etc/ziti/ctrl1/ctrl1.yml
  ```

Absolute paths are the safer default because they're robust to anything that changes
the working directory, not just systemd.
