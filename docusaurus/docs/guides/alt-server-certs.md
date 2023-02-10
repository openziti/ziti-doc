---
title: Using Public CA Certificates
sidebar_label: Public CA Certs
sidebar_position: 50
---

You can configure the Ziti controller and routers to present alternative server certificates, but it's not normally necessary. Most Ziti entities broker mutual cryptographic trust through enrollment, not a third-party CA. There are certain scenarios where a verifiable server certificate is necessary.

Alternative server certificates are most relevant to Ziti networks that use [browZer](https://blog.openziti.io/series/browzer) because ephemeral identities are created inside a normal web browser that must trust the Edge client API's server certificate. For Ziti networks that run a browZer agent, you must configure the controller's Edge client API and the routers' WebSocket servers to present server certificates from a public CA like Let's Encrypt.

## Ziti Controller

Ziti has a conventional way of configuring [`identity`](../reference/30-configuration/controller.md#identity) certificates for the controller's servers. Anywhere that you can configure a controller `identity` block you can also configure `alt_server_certs` as a sub-property. 

The controller will select the correct server certificate to present by reading the Server Name Indication (SNI) of the incoming request and matching a DNS Subject Alternative Name (SAN) from all available server certificates configured in that particular `identity` block. This is important because the controller will select the first match in the event that two certificates have the same DNS SAN. To avoid this ambiguity, you must configure `alt_server_certs` with distinct DNS SANs from the `server_cert` property of the same `identity`.

The simplest way to configure the controller with alternative certificates is with the main `identity` block that is typically organized at the top of the configuration file. This is the identity of the control plane, abbreviated "ctrl." If no other `identity` blocks are added to the controller's servers this identity will be used. For example, the web binding for the edge client and management APIs will present the same server certificates. 

```yaml
identity:
  cert: ctrl-plane-client.crt                  # user cert from ctrl plane CA
  server_cert: ctrl-plane-server.crt           # server cert from ctrl plane CA with SAN "ctrl.ziti.example.com"
  key: ctrl-plane.key                          # private key of user and client certs
  ca: ctrl-plane-trust-bundle.pem              # bundle of issuer certs including ctrl plane CA and edge signer CA
  alt_server_certs:
    - server_cert: lets_encrypt.cert.pem       # server cert from Let's Encrypt with SAN "client-pub.ziti.example.com"
    - server_key: lets_encrypt.key.pem         # private key of alt server cert
```

## Ziti Routers

Like controllers, routers too have a conventional [`identity`](../reference/30-configuration/router.md#identity) configuration block, but 

```yaml
identity:
  cert: ctrl-plane-client.crt                  # user cert from ctrl plane CA
  server_cert: ctrl-plane-server.crt           # server cert from ctrl plane CA with SAN "ctrl.ziti.example.com"
  key: ctrl-plane.key                          # private key of user and client certs
  ca: ctrl-plane-trust-bundle.pem              # bundle of issuer certs including ctrl plane CA and edge signer CA
  alt_server_certs:
    - server_cert: lets_encrypt.cert.pem       # server cert from Let's Encrypt with SAN "client-pub.ziti.example.com"
    - server_key: lets_encrypt.key.pem         # private key of alt server cert
```



If you choose to configure alternative wildcard certificates, you may ensure a predictable server certificate selection by using a distinct DNS name for `listeners[binding=edge].options.advertise`.

For example, if you had initially configured your Ziti router to advertise an address of `router1.example.com:443` then the Ziti PKI certainly issued a server certificate with a DNS SAN like `router1.example.com`. If you later decide to use alternative server certificates, then you would need to advertise a different address like `router1-pub.example.com:443`. That way, when Edge clients request a connection, they'll be presented with the expected server certificate.

If present, then it is also necessary to configure an alternative server certificate for the WebSocket binding.

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

The `ziti` CLI uses the controller's Edge management API and employs trust on first use (TOFU), much like the OpenSSH client's known host keys. The first time the CLI connects to a new controller it will prompt the user to accept the well-known trust bundle, e.g., `/.well-known/est/cacerts`, that is compiled by the controller and fetched by Edge clients during enrollment. This trust bundle comprises CA certificates from the issuers of the server certificates used by the controller.
