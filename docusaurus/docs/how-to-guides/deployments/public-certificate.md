---
sidebar_label: Add a public certificate
sidebar_position: 60
---

# Add a public certificate to the controller

The controller runs on its own private PKI (public key infrastructure). A client that enrolls with a JWT trusts that
PKI through the token. A client that starts from a URL, such as a browser or a tunneler adding a network by URL, trusts
only certificates the operating system already trusts. To serve both, give the controller a public certificate for one
name and keep the private PKI for everything else.

## Two domain names are necessary

| Name | Example | Certificate |
| --- | --- | --- |
| Public | `ctrl.example.com` | The public certificate only. Users type this name. |
| Private | `ctrl-pki.example.com` | The private certificate only. The controller advertises this name. |

Make sure the two domain names are not the same and cannot overlap. If both certificates list the public name, the
controller may serve the wrong certificate on the wrong endpoint. To add confusion, the choice of certificate is
non-deterministic. An initial test might work fine until the next controller reboot when the wrong certificates are
selected for the wrong endpoint leading to confusion.

- Don't put the public name on the private certificate.
- Don't advertise the public name.

## Get a certificate for the public name

Get a certificate for the public name from any publicly trusted CA. These CAs issue free certificates through an ACME
client like [Certbot](https://certbot.eff.org/instructions):

- [Let's Encrypt](https://letsencrypt.org/getting-started/)
- [ZeroSSL](https://zerossl.com/documentation/acme/)
- [Google Trust Services](https://docs.cloud.google.com/certificate-manager/docs/public-ca-tutorial)

You can also use an enterprise CA that your mobile device management (MDM) tool puts in the operating system trust
store.

## Configure the controller

Make two changes to the controller config:

```yaml
edge:
  api:
    # 1. the address enrolled clients use: the private name
    address: ctrl-pki.example.com:1280

web:
  - name: client-management
    bindPoints:
      - interface: 0.0.0.0:1280
        address: ctrl-pki.example.com:1280
    identity:
      ca:          "/opt/ziti/qs/pki/root-ca/certs/root-ca.cert"
      key:         "/opt/ziti/qs/pki/intermediate-ca-instance-1/keys/server.key"
      server_cert: "/opt/ziti/qs/pki/intermediate-ca-instance-1/certs/server.chain.pem"
      cert:        "/opt/ziti/qs/pki/intermediate-ca-instance-1/certs/client.chain.pem"
      # 2. the public certificate, for the public name
      alt_server_certs:
        - server_cert: "/opt/ziti/le/fullchain.pem"
          server_key:  "/opt/ziti/le/privkey.pem"
```

1.  **Advertise the private name.** The controller puts `edge.api.address` in the network JWT, and every client that
    enrolls connects to that address from then on.
2.  **Add the public certificate with `alt_server_certs`.** During the TLS handshake, the client sends the name it
    wants using Server Name Indication (SNI). The controller serves the first certificate whose DNS names match it. A
    request for `ctrl.example.com` matches only the public certificate.

The [identity conventions](../../reference/30-configuration/conventions.md#identity) describe every field in the
`identity` block.

:::danger Never add a public root to the `ca` bundle
The controller serves the web listener's `ca` bundle at `/.well-known/est/cacerts`, and every enrolled client trusts
that bundle and nothing else. A public root, such as the Let's Encrypt ISRG roots, in that bundle makes every enrolled
client trust any certificate that CA issues for your controller's name. That expands the trust zone from your private
PKI to a public CA, and the private PKI no longer protects the overlay.
:::

## Check it works

Restart the controller, then test the public URL:

- **With your browser:** open `https://ctrl.example.com:1280/edge/client/v1/version`. The page shows the controller's
  version with no certificate warning.
- **With `curl`:** run the command below without the `-k` flag. It prints the controller's version with no error.

  ```bash
  curl -s https://ctrl.example.com:1280/edge/client/v1/version
  ```

If either test passes, the controller is using a trusted certificate and tunnelers will be able to trust the URL too.
