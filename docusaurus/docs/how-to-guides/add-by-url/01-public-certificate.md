# Step 1: Give the controller a public certificate

![The controller highlighted, presenting a public certificate on its client API.](/img/add-by-url/step-01-public-certificate.svg)

Andrew covered how trust gets bootstrapped with a JWT in his
[five-part series on bootstrapping trust](https://openziti.io/blog/bootstrapping-trust-part-1-encryption-everywhere). A JWT and a URL start from different
places.

A **JWT** brings its own starting point. The controller signs the enrollment token with the same key behind its server
certificate. The token also names the controller it came from. When the tunneler connects, it ignores every trust
store on the machine. It checks one thing about the certificate it's shown, which is whether that key signed the
token. If someone sits in the middle, their certificate fails that check and the enrollment stops. The tunneler
downloads the controller's CA bundle only after that check passes, and from then on it trusts that bundle and nothing
else. The token itself *is* the trust, and you, by delivering it, are the one the device trusts. That's why an
OpenZiti controller can run on its own private PKI (public key infrastructure) that no browser has heard of.

A **URL** carries no trust of its own. With add by URL, the tunneler downloads the controller's network JWT from that
URL. The network JWT is still signed by the controller's private PKI, and it isn't tied to one user the way an
emailed enrollment JWT is. The IdP sign-in is what says who the user is. What's different is how the JWT gets to the
device. The tunneler won't download it from a URL the operating system doesn't trust, so the OS trust store takes
your place. That can be a public CA such as Let's Encrypt, or an enterprise CA your mobile device management (MDM)
tool already put in the OS trust store. For a self-hosted OpenZiti deployment, this means the controller needs a
certificate the devices can verify.

## Configure the controller

The controller can present a public certificate for the URL users type and keep its private PKI for everything else.
My demo controller uses a Let's Encrypt wildcard for `*.example.com`. Users type `ctrl.example.com`. Everything
else, including every enrolled tunneler, uses `ctrl-pki.example.com`, a name only the private certificate lists. Both
names need DNS records that reach the controller. It took two changes to the config:

```yaml
edge:
  api:
    # 1. the address enrolled clients use: a name only the private certificate claims
    address: ctrl-pki.example.com:1280

web:
  - name: client-management
    bindPoints:
      - interface: 0.0.0.0:1280
        address: ctrl-pki.example.com:1280
    identity:
      # the CA bundle clients download: the private root only
      ca:          "/opt/ziti/qs/pki/root-ca/certs/root-ca.cert"
      key:         "/opt/ziti/qs/pki/intermediate-ca-instance-1/keys/server.key"
      server_cert: "/opt/ziti/qs/pki/intermediate-ca-instance-1/certs/server.chain.pem"
      cert:        "/opt/ziti/qs/pki/intermediate-ca-instance-1/certs/client.chain.pem"
      # 2. the public certificate, for the URL users type
      alt_server_certs:
        - server_cert: "/opt/ziti/le/fullchain.pem"
          server_key:  "/opt/ziti/le/privkey.pem"
```

1.  **Advertise the private name.** The controller puts `edge.api.address` in the network JWT, and every tunneler
    that enrolls connects to that address from then on. During the TLS handshake, the client sends the host name it
    wants using Server Name Indication (SNI). The controller compares that name with the DNS names on each certificate
    and uses the first match. `ctrl-pki.example.com` matches the private certificate, so enrolled tunnelers see the
    private PKI and nothing else.
2.  **Add the public certificate with `alt_server_certs`.** A request for `ctrl.example.com` matches only the public
    certificate. The public name is the add-by-URL front door: the tunneler fetches the network JWT from it once, with
    the operating system's trust store, and never uses it again.

:::warning Keep public roots out of the `ca` bundle
The controller serves the web listener's `ca` bundle at `/.well-known/est/cacerts`, and an enrolled tunneler trusts
that bundle and nothing else. If `edge.api.address` is the public name, enrolled tunnelers get the Let's Encrypt
certificate on every request, and they fail until the ISRG roots are in that bundle. Don't add them. With the ISRG
roots in the bundle, every tunneler trusts any certificate Let's Encrypt issues for your controller's name, and the
private PKI no longer protects the overlay. Advertise the private name instead.

Get this right before users enroll. The tunneler replaces its saved bundle with the controller's bundle, so a root
removed later strands every identity that relied on it. Those users have to enroll again.
:::

## Check it works

With those two changes in place, the operating system on any device trusts `https://ctrl.example.com:1280` with no
extra setup. That's the test. If the operating system trusts the URL, the tunneler will too.

## Done when

- [x] The browser opens `https://ctrl.example.com:1280` with no certificate warning
- [x] The controller's CA bundle lists only the private PKI:

  ```text
  curl -s https://ctrl.example.com:1280/.well-known/est/cacerts \
    | base64 -d | openssl pkcs7 -inform DER -print_certs | grep subject=
  ```
