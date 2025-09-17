---
title: "Multifactor Zero Trust ssh"
seoTitle: "Zero Trust SSH with Multifactor Authentication"
seoDescription: "Explore multifactor authentication for zero trust SSH clients with OpenZiti. Learn and download `zssh` today!"
date: 2024-09-09T00:10:41Z
cuid: cm0u8yhfd000008kzezx739qf
slug: multifactor-zero-trust-ssh
authors: [ClintDovholuk]
image: /blogs/openziti/v1725453901119/410a39f8-eaf7-4c9f-bbba-ae547eb78d94.webp
tags: 
  - ssh
  - zero-trust
  - openziti
  - zerotrust
  - zero-trust-security

---

[The previous post](https://blog.openziti.io/zero-trust-sshclient) revisited the `zssh` project and demonstrated how to implement a simple ssh client using the extended modules provided by the Golang project. It also modified that simple program and showed what it takes to incorporate OpenZiti, creating a zero trust ssh client. This post focuses on another aspect of `zssh` and OpenZiti: multi-factor authentication.

[OpenZiti](https://openziti.io/docs/learn/introduction/) has a powerful and flexible authentication system. It allows an OpenZiti overlay network operator to decide what authentication mechanisms any given identity must satisfy before being authenticated to the overlay network. OpenZiti is a zero trust overlay network; authentication is only half of the equation. Once authenticated, identities still require authorization before accessing services secured by the overlay following the zero trust pillar of "least privilege".

## Certificate-based Authentication

Perhaps the most common type of authentication, OpenZiti supports authentication to the the OpenZiti overlay network using certificates. It might not be obvious, but a `zssh` user using an [enrolled an OpenZiti identity](https://openziti.io/docs/learn/core-concepts/identities/enrolling/) to authenticate to the overlay network **is already implicitly** using multi-factor authentication. The first authentication factor is OpenZiti itself. OpenZiti requires connections to be both authenticated and authorized before being allowed to connect to the target service. Once authenticated and authorized, `zssh` can connect to `sshd` and attempt to authenticate. Just by using `zssh`, users are protected with two factors of authentication but `zssh` (and OpenZiti) offers other factors of authentication as well.

When [enrolling an identity](https://openziti.io/docs/learn/core-concepts/identities/enrolling/), the output of the enrollment flow will be an OpenZiti identity file containing a certificate, key, and CA bundle. This identity can then be used to authenticate connections to the target OpenZiti overlay network. If you are interested in learning how this process works, you can read about it in [Andrew's five-part series about bootstrapping trust](https://blog.openziti.io/bootstrapping-trust-part-1-encryption-everywhere). Using `zssh` with an identity file and certificate-based authentication looks something like this (examples are taken [directly from the GitHub repo](https://github.com/openziti-test-kitchen/zssh?tab=readme-ov-file#identity-based-certificate-authentication)):

![](/blogs/openziti/v1725132017881/75590748-1fb6-4616-bf1a-4fc59b31975b.png)

```go
zssh \
  -i "${private_key}" \
  -s "${service_name}" \
  -c "${client_identity}.json" \
  "${user_id}@${server_identity}"
```

In this example, `zssh` is accepting the ssh key to use to authenticate to `sshd` (`-i`), the OpenZiti service to dial (`-s`), the OpenZiti identity file (`-c`). Somewhat hidden within this example is the OpenZiti target identity that is binding the service. All `zssh` connections are made with the expectation that the target identity is provided to the `zssh` command where one would normal 'host' would be. This allows the OpenZiti overlay network operator to have a single service usable by any identity looking to provide ssh access.

## OIDC-based Authentication Only

The `zssh` executable was recently enhanced to support OIDC-only-based authentication. Using [external JWT signers](https://openziti.io/docs/learn/core-concepts/security/authentication/external-jwt-signers/), you can configure an OpenZIti overlay network to trust JWTs from configured IdPs as authentication tokens. This allows the operator to create [authentication policies](https://openziti.io/docs/learn/core-concepts/security/authentication/authentication-policies/) allowing for external, OIDC-based integrations. This is interesting because it allows you to authenticate to the OpenZiti overlay network without needing to enroll the client ahead of time. Instead, `zssh` users complete an [Authorization Code Flow with PKCE](https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow-with-pkce). In this scenario, the user will see the familiar flow of a browser window popping up and asking the user to authenticate to an identity provider configured to be trusted by OpenZiti. When the flow completes, the `zssh` binary will have a JWT that can be used to authenticate to the OpenZiti controller.

![](/blogs/openziti/v1725132084008/92208900-0593-410c-9305-b4b3b63821ce.png)

```go
zssh \
  -i "${private_key}" \
  -s "${service_name}" \
  -o \
  -a "${oidc_issuer}" \
  -n openziti-client \
  --oidcOnly \
  --controllerUrl https://localhost:1280 \
  "${user_id}@${server_identity}"
```

In this example, `zssh` is given the same `-i` and `-s` parameters as the certificate-based example above as well as the `userid@identity` but there are a few others supplied. The `-o` flag is passed to indicate `zssh` should obtain a JWT from the specified (`-a`) OIDC provider. In this example, Keycloak is used as a federated IdP to federate authentication to GitHub. To authenticate to Keycloak, a client id (`-n`) will need to be provided. This Keycloak client minimally needs to be configured with URLs it's allowed to redirect to after successful authentication. This example uses the `--oidcOnly` flag, indicating no OpenZiti certificate will be used for authentication. An identity will need to exist in the controller and [a matching auth-policy](https://github.com/openziti-test-kitchen/zssh?tab=readme-ov-file#create-an-external-jwt-signer-and-auth-policies) to allow the identity to authenticate. Finally, as no OpenZiti identity is used in this example, `zssh` must be told where to send the authentication request with the `--controllerUrl` flag.

## Certificate-based + OIDC-based Authentication

OpenZiti can also be configured to support OIDC as a secondary form of authentication. Accordingly, the `zssh` binary can be configured to use certificate-based authentication as a primary authentication source and an OIDC-based flow for secondary authentication. In the scenario, connecting to the OpenZiti overlay itself would require multiple forms of authentication. These mechanisms are a great way to prove there's both a human and a device. The device provides the certificate, while the human interacts with Keycloak/GitHub's OIDC to verify a human is indeed in the loop.

![](/blogs/openziti/v1725132167930/c0f03fe3-0d55-4046-846c-0a8df3715e50.png)

```go
zssh \
  -i "${private_key}" \
  -s "${service_name}" \
  -o \
  -a "${oidc_issuer}" \
  -n openziti-client \
  -c "${client_identity}.json" \
  "${user_id}@${server_identity}"
```

In this example, `zssh` is given the all the same parameters as the OIDC-only example but because it specifies an OpenZiti identity with `-c`, the `--controllerUrl` and `--oidcOnly` flags are not necessary.

## TOTP Instead of OIDC

Also added in this release was support for OpenZiti's [TOTP-based](https://en.wikipedia.org/wiki/Time-based_one-time_password) authentication. Users can now be required to enter their TOTP code before making a connection, allowing for multi-factor authentication to the OpenZiti overlay without using an IdP. Or, if using the OIDC-only based flow with an IdP that doesn't support TOTP (for reasons), OpenZiti's TOTP can be used as a secondary form of authentication to the overlay. For TOTP example usage have a look at [the readme on the repository](https://github.com/openziti-test-kitchen/zssh?tab=readme-ov-file#adding-totp). There, you’ll find the commands shown in the example gif below.

![](/blogs/openziti/v1725543173600/84bb2bc3-e5ba-45d4-9f3c-dccc08e6b0d6.gif)

## Download zssh/zscp

If you are interested in trying out `zssh` and it's partner `zscp`, you can download the latest releases from GitHub at [https://github.com/openziti-test-kitchen/zssh/releases/latest](https://github.com/openziti-test-kitchen/zssh/releases/latest), right next to the source code for the project.

## **Share the Project**

![](/blogs/openziti/v1702330572628/7bb2b76c-af3f-45c6-83ab-d519f183024d.png?auto=compress,format&format=webp)

If you find this interesting, please consider [**starring the projects on GitHub**](https://github.com/openziti/ziti/). It really does help to support the project! And if you haven't seen it yet, check out [**https://zrok.io**](https://github.com/openziti/ziti/). It's a totally free sharing platform built on OpenZiti and uses the OpenIti SDK! It uses the OpenZiti Go SDK since it's a ziti-native application. It's also [**all open source too!**](https://github.com/openziti/zrok/)

Tell us how you're using OpenZiti on [**X <s>twitter</s>**](https://twitter.com/openziti), [**reddit**](https://www.reddit.com/r/openziti/), or over at our [**Discourse**](https://openziti.discourse.group/). Or, if you prefer, check out [**our content on YouTube**](https://youtube.com/openziti) if that's more your speed. Regardless of how, we'd love to hear from you.
