---
title: Alternative Server Certificates
sidebar_label: Alt Server Certs
---

## Use Certificates from a Public Authority with your Ziti Network

You can configure the Ziti controller and routers to present alternative server certificates to Edge clients. This is useful in a deployment scenario where the Edge clients use ephemeral identities that can not be preconfigured to trust a particular certificate authority (CA) and must rely on the OS trust bundle of CA certificates.

As a rule, Ziti Edge SDKs will insist that the server certificates they encounter are verifiable with the CA certificate bundle embedded in the identity configuration. If the CA bundle is absent, then the server certificates must be verifiable by the OS trust bundle. This means that it's necessary to configure all Ziti routers and the Ziti controller, and Ziti Edge SDKs in the same way, i.e., for alternative server certificates from a publicly-verifiable third-party CA like Let's Encrypt or with certificates that are verifiable with the trust bundle that the controller publishes, e.g., `https://ctrl.example.com:1280/.well-known/est/cacerts`.

The following sections cover configuring each of the three Ziti components that must be aligned with the decision to use alternative server certificates: controller, routers, and SDKs.

## Ziti Controller

The main server certificate that needs to be configured for the Ziti controller is that of the client-management API's bind point in the `web` section.

```yaml
web:
  - name: client-management
    bindPoints:
      - interface: 0.0.0.0:1280
        address: ctrl.example.com:1280
    identity:
      server_cert: /etc/letsencrypt/live/example.com/fullchain.pem
      key: /etc/letsencrypt/live/example.com/privkey.pem
      ca: /etc/pki/ca/example.com/certs/ca.pem  # required but unused
      cert: /etc/pki/ca/example.com/certs/client1.pem  # required but unused
```

## Ziti Routers

The main server certificate that needs to be configured for all Ziti routers is that of the edge TLS binding. This is accomplished by adding an `alt_server_certs` identity property.

```yaml
identity:
  server_cert: /etc/pki/ca/example.com/certs/server1.pem
  key: /etc/pki/ca/example.com/keys/key1.pem
  cert: /etc/pki/ca/example.com/certs/client1.pem
  ca: /etc/pki/ca/example.com/certs/ca.pem
  alt_server_certs:
    - server_cert: /etc/letsencrypt/live/example.com/fullchain.pem
      server_key: /etc/letsencrypt/live/example.com/privkey.pem
```

Crucially, when alternative server certificates are configured, the router will select a server certificate to present which x509 subject alternative name (SAN) matches the
server name indication (SNI) of the incoming request. For this reason, you must ensure that the primary and alternative certificates do not have colliding SANs. If you choose to configure alternative wildcard certificates, you may ensure a predictable server certificate selection by using a distinct DNS name for `listeners[binding=edge].options.advertise`.

For example, if you had initially configured your Ziti router to advertise an address of `router1.example.com:443` then the Ziti PKI certainly issued a server certificate with a DNS SAN like `router1.example.com`. If you later decide to use alternative server certificates, then you would need to advertise a different address like `router1pub.example.com:443`. That way, when edge clients request a connection, they'll be presented with the expected server certificate.

If present, then it is also necessary to configure an alternative server certificate for the WebSocket binding.

```yaml
transport:
  ws:
    identity:
      server_cert: /etc/letsencrypt/live/example.com/fullchain.pem
      key: /etc/letsencrypt/live/example.com/privkey.pem
      ca: /etc/pki/ca/example.com/certs/ca.pem  # required but unused
      cert: /etc/pki/ca/example.com/certs/client1.pem  # required but unused
```

## Ziti Edge SDKs

You must configure the identities used by all Edge SDKs to align with the decision to configure alternative server certificates. All Edge SDKs recognize the JSON schema of a Ziti identity configuration.

There are two ways to configure the identity:

1. create and enroll a new identity with the same roles
1. edit the stored identity configuration to prune the `id.ca` property

After configuring alternative server certificates on the controller, all newly created identities will lack the `id.ca` property. This is because the alternative server certificates are presumed to be third-party and publicly verifiable by the Edge clients' OS trust bundles, not the Ziti trust bundle. By removing the `id.ca` property from the stored identity configuration, the Edge SDK will instead rely on the OS trust bundle.
