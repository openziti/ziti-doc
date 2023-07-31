---
title: Using Public CA Certificates
sidebar_label: Public CA Certs
sidebar_position: 50
---

You can configure the Ziti controller and routers to present alternative server certificates, but it's not necessary in the most common cases. There are certain scenarios where a server certificate from a trusted third-party is necessary. 

Alternative server certificates are most relevant to Ziti networks that use [BrowZer](https://blog.openziti.io/series/browzer). BrowZer is an implementation of Ziti's [external ID claim feature](../learn/core-concepts/security/authentication/50-external-id-claims.md). This is how a BrowZer user is able to connect to a Ziti service with an authorization token from an OIDC provider.

For Ziti networks that run the BrowZer Bootstrapper, you must configure the controller's Edge client API and the routers' WebSocket servers to present server certificates from a trusted third-party like Let's Encrypt. This allows the BrowZer runtime to verify the controller's and routers' server certitificates without any pre-configuration or additional client software.

Publicly verifiable server certificates are not necessary, or even desirable, for Ziti identities that are "enrolled." This is because enrolled identities are always configured to explicitly trust the Ziti controller's known CAs. Enrolled clients must verify the server certificate chains they encounter from one of the known CAs. 

## Ziti Controller

Ziti has a conventional way of configuring [`identity`](../reference/30-configuration/controller.md#identity) certificates for the controller's TLS servers. Anywhere that you can configure a controller `identity` section you can also configure `alt_server_certs`. The controller's leaf certificates are managed externally, not by Ziti itself.

The controller will select the correct server certificate to present by reading the Server Name Indication (SNI) to match a DNS Subject Alternative Name (SAN) from all available server certificates configured in that particular `identity` section. 

:::note
The controller will select the first match in the event that two certificates have the same DNS SAN. You must configure `alt_server_certs` with DNS SANs that are distinct from the `server_cert` property of the same `identity` section.
:::

The simplest way to configure the controller with alternative certificates is with the main `identity` section. This is the root identity of the control plane, often abbreviated "ctrl." 

If no other `identity` sections are configured then this identity will be used whenever a client or server or CA certificate is needed.

```yaml
identity:
  cert: ctrl-plane-client.crt                  # user cert from ctrl plane CA
  server_cert: ctrl-plane-server.crt           # server cert from ctrl plane CA with SAN "ctrl.ziti.example.com"
  key: ctrl-plane-client.key                   # private key of client cert
  server_key: ctrl-plane-server.key            # private key of server certs
  ca: ctrl-plane-trust-bundle.pem              # bundle of root CAs that may be used to verify this identity's leaf cert chains
  alt_server_certs:
    - server_cert: lets_encrypt.cert.pem       # server cert chain from Let's Encrypt with SAN "client-pub.ziti.example.com"
    - server_key: lets_encrypt.key.pem         # private key of alt server cert
```

## Ziti Routers

Like controllers, routers too have a conventional [`identity`](../reference/30-configuration/router.md#identity) configuration section. Unlike the controller, the router's leaf certificates are managed by Ziti, not externally. The router obtains its leaf certificates from the controller's edge enrollment signer during enrollment and will attempt to renew them prior to expiration. The new certificates will not be saved if the filesystem is not writable.

```yaml
identity:
  cert: ctrl-plane-client.crt                  # filepath to write client cert from controller's edge enrollment signer during enrollment
  server_cert: ctrl-plane-server.crt           # filepath to write server cert from edge enrollment signer during enrollment
  key: ctrl-plane.key                          # filepath to write generated private key for leaf certs during enrollment
  ca: ctrl-plane-trust-bundle.pem              # filepath to write known CA certs during enrollment
  alt_server_certs:
    - server_cert: lets_encrypt.cert.pem       # server cert from Let's Encrypt with a distinct DNS SAN
    - server_key: lets_encrypt.key.pem         # private key of alt server cert
```

If you choose to configure alternative wildcard certificates, you may ensure a predictable server certificate selection by using a distinct DNS name for `listeners[binding=edge].options.advertise`.

For example, if you had initially configured your Ziti router to advertise an address of `router1.example.com:443` then the Ziti PKI certainly issued a server certificate with a DNS SAN like `router1.example.com`. If you later decide to use alternative server certificates, then you would need to advertise a different address like `router1-pub.example.com:443`. That way, when Edge clients request a connection, they'll be presented with the expected server certificate.

It is necessary to configure a verifiable server certificate for the WebSocket server that is necessary for BrowZer. This TLS server only needs the verifiable certificate from a trusted third-party, not a certificate from the Ziti controller.

```yaml
transport:
  ws:
    identity:
      server_cert: /etc/letsencrypt/live/example.com/fullchain.pem
      key: /etc/letsencrypt/live/example.com/privkey.pem
      ca: /etc/pki/ca/example.com/certs/ca.pem         # required but unused
      cert: /etc/pki/ca/example.com/certs/client1.pem  # required but unused
```

## Ziti Console

The Ziti Administration Console (ZAC) is a server application that provides a console UI for the Ziti Edge management API. It is a good idea to use ZAC with a verifiable server certificate. See the [ziti-console](https://github.com/openziti/ziti-console) repo about configuring server TLS for ZAC.

## Ziti CLI

The `ziti` CLI uses the controller's Edge management API and employs trust on first use (TOFU), much like the OpenSSH client's known host keys, when authenticating with a password. The first time the CLI connects to a new controller it will prompt the user to accept the well-known trust bundle, e.g., `/.well-known/est/cacerts`, that is computed by the controller and fetched by Edge clients during enrollment after they verify the server certificate is backed by the same private key that signed their enrollment token. This trust bundle comprises root CA certificates that must be used to verify the server certificate chains presented by the Ziti controller.
