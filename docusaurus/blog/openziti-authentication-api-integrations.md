---
slug: openziti-authentication-api-integrations
title: "OpenZiti Authentication API Integrations"
authors: [AndrewMartinez]
date: 2022-10-20
tags:
  - authentication
  - api
  - integrations
  - openziti
---
# OpenZiti Authentication API Integrations

In the OpenZiti project, we have created an overlay network that makes network services dark. Part of that system is authenticating devices and users before they connect. The challenge is that most companies already have methods to authenticate human users and hardware devices. The challenge we faced with OpenZiti was to provide ways to integrate both users and devices through external Identity Providers (IdP). Our solution was to allow two of the fundamental building blocks of modern authentication systems to be validated by OpenZiti: x509 certificates and JWTs. 

For OpenZiti to validate both of those new data model entities were created to support them:

- [External JWT Signers](https://openziti.github.io/ziti/security/authentication/external-jwt-signers.html) - Allows static x509 and JWKS endpoint configuration
- [3rd Party CAs](https://openziti.github.io/ziti/security/authentication/third-party-cas.html) - Allows static x509 CA certificates configuration

Both have several options that are documented in the above links. The main goal of both of these entities is to allow external systems to generate signed documents (certificates and JWTs) that can be verified (if you need a refresher on this, please see this [article](https://openziti.io/high-level-publicprivate-cryptography)). These documents can have variable length lifetimes and other qualities that are outside the control of OpenZiti, we must delegate trust upwards to some higher authority, a "signer." For x509 certificates, this is either an intermediate Certificate Authority (CA) or a root CA. For JWTs this is simply a certificate that creates digital signatures.


![3rd party id.png](/blogs/openziti/v1666618727994/u2laPGD0G.png align="left")

### Example Public Key Infrastructure
[![](https://mermaid.ink/img/pako:eNplkD0PgjAQhv8KuQkSGFSmDiZAUUmc1M06NPQQogWCZTCE_-4RPmLCTZfneXN3bQdppRAYPBtZ59aNi9KiCu6XqjJWFDw8bx_aSWmw0agKaZCgtXGmGNloZbd_lq_sbrKcbDzZRfqTDEke7DPKbNk1oOOI5gURodOI5qkxoWREvgMuaJouC0UP7IaAAJOjRgGMWiWblwBR9pSTramu3zIFZpoWXWhrRSfxQtK_aGCZfH-w_wFth1dP?type=png)](https://mermaid.live/edit#pako:eNplkD0PgjAQhv8KuQkSGFSmDiZAUUmc1M06NPQQogWCZTCE_-4RPmLCTZfneXN3bQdppRAYPBtZ59aNi9KiCu6XqjJWFDw8bx_aSWmw0agKaZCgtXGmGNloZbd_lq_sbrKcbDzZRfqTDEke7DPKbNk1oOOI5gURodOI5qkxoWREvgMuaJouC0UP7IaAAJOjRgGMWiWblwBR9pSTramu3zIFZpoWXWhrRSfxQtK_aGCZfH-w_wFth1dP)

*Above is an example charter of a Public Key Infrastructure (PKI). All PKIs have one root CA that can create zero or more intermediate CAs. Each CA can in turn also sign leaf certificates - certificates that cannot sign other **certificates**. The interesting part is that each certificate in a PKI has a number of flags that determine what it is allowed to do beyond creating other CAs. One of those flags is the ability to digitally sign documents. One of the types of documents that can be signed are JWTs. Whether one is using x509 certificates or JWTs, there is a PKI at work behind the scenes. Services like Auth0, Okta, and Google all have PKIs they are managing for you powering certificate issuing and signing JWTS.*

# Identities & External Authentication & Authorization

OpenZiti [Identities](https://openziti.github.io/ziti/identities/overview.html?tabs=tabid-new-ca-ui%2Ctabid-new-identity-ui) are a core part of authentication and authorization. Authentication in OpenZiti uses an additional field on identities called `externalId`. The `externalId` or the internal `id` field can be used with 3rd Party CAs and External JWT signers to match certificates and JWTs to an identity. 

3rd Party CAs support [x509 Claims](https://openziti.github.io/ziti/security/authentication/third-party-cas.html#external-id--x509-claims) and External JWT Signers support a [`claimsProperty`](https://openziti.github.io/ziti/security/authentication/external-jwt-signers.html) to determine which value from the JWT or certificate should be matched against the existing set of `externalId` or `id` values.

For authorization OpenZiti supports a rich and flexible Attribute Based Access Control system (ABAC). It powers all of OpenZiti's [policies](https://openziti.github.io/ziti/security/authorization/policies/overview.html?tabs=tabid-new-service-policy-ui%2Ctabid-new-edge-router-policy-ui%2Ctabid-new-service-edge-router-policy-ui). Identities support attributes so that they can be tied to policies which determine authorization.

### Example JWT Authentication Flow 

[![](https://mermaid.ink/img/pako:eNqFk11PgzAUhv8K6RWL03hNFi78iJlZohnRm7GL2p5tldJiW8Rl2X-3pQNhw60XBDjPOed929MdIpICipCGrxIEgQeG1wrnqQjswqWRosw_QPnvNw3qOo7vOQNhoiDZyGpKX3U48mH_3wFSGCU5BxUFT2B6TBvqFJoslowWOj4q49o1XQodOmQ0LAQ4ENemZha3y2NBd0pWdbGXAkQD3ZSKXxHM-Qcm2SHjANoUW-0ybqFu9cnG5Dw-ruRtzEFQUKEj-iba7JlcMxESBVQPqzkFfP86-A6KrbYD0T91n5UZB42DE5n9PeqxJ3Lag7NYfObwvWILDZ1-LXsORjH4hucqa2fE6-7WsX2ydjx6E9SB_A48_hjbL2FrYXe7duFyRxdyZ1JmZTGl1gIz2_8Ut7Z1SQjoMwObeKBxVD_9a7PQGOWgcsyovX07F0uR2UAOKYrsK8UqS1Eq9pZz1zDZCoIio0oYo7Kg2DQ3FUUrzDXsfwG1Bj9J?type=png)](https://mermaid.live/edit#pako:eNqFk11PgzAUhv8K6RWL03hNFi78iJlZohnRm7GL2p5tldJiW8Rl2X-3pQNhw60XBDjPOed929MdIpICipCGrxIEgQeG1wrnqQjswqWRosw_QPnvNw3qOo7vOQNhoiDZyGpKX3U48mH_3wFSGCU5BxUFT2B6TBvqFJoslowWOj4q49o1XQodOmQ0LAQ4ENemZha3y2NBd0pWdbGXAkQD3ZSKXxHM-Qcm2SHjANoUW-0ybqFu9cnG5Dw-ruRtzEFQUKEj-iba7JlcMxESBVQPqzkFfP86-A6KrbYD0T91n5UZB42DE5n9PeqxJ3Lag7NYfObwvWILDZ1-LXsORjH4hucqa2fE6-7WsX2ydjx6E9SB_A48_hjbL2FrYXe7duFyRxdyZ1JmZTGl1gIz2_8Ut7Z1SQjoMwObeKBxVD_9a7PQGOWgcsyovX07F0uR2UAOKYrsK8UqS1Eq9pZz1zDZCoIio0oYo7Kg2DQ3FUUrzDXsfwG1Bj9J)

*Above, an external Identity Provider (IdP) is signing JWTs with the `sub` (subject) field set to the email address of the human authenticating. This email address is also the `externalId` of OpenZiti identities.*

# Extending Authentication To Services

Using 3rd Party CAs and External JWT Signers, it is also possible to developed applications with Ziti's SDKs that can make double use of the certificates and JWTs that are used for authentication.  The double uage is:


1. Use the certificate/JWT to authenticate with an OpenZiti overlay network
2. Use the certificate/JWT to authenticate over OpenZiti to a target service

To accomplish this, the client accessing the service over OpenZiti must:

- be configured to accept, verify, and trust the same signers (CA or JWT) that OpenZiti does
- the client must embed a Ziti SDK and use the same certificate or JWT to authenticate to a service on connection

Using this pattern, it is possible to tie OpenZiti network authentication and service authentication together in one neat flow.






