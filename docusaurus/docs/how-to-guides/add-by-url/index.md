---
title: Add by URL
sidebar_label: Add by URL
pagination_prev: null
---

# Add by URL

*Join with a URL and an IdP sign-in*

**TL;DR**: Users can join an OpenZiti network with a URL and their identity provider (IdP) sign-in, with no enrollment
JSON Web Token (JWT) to deliver. Since OpenZiti 2.0, the controller can also create the identity at first sign-in.

## Why

Every new user enrolled with a JWT starts as work for an administrator. The admin creates an identity, downloads its
one-time JWT, and gets it to the user over email, chat, or a file share. The JWT is a secret until it's used, so that
handoff has to be done safely. On top of that, each machine needs its own identity and its own JWT, so a user with
three laptops means three identities and three handoffs. The whole process repeats when the user gets a new phone,
reinstalls their OS, and so on.

Using add by URL, the user copies and pastes the controller URL into their tunneler to start enrolling. To finish,
they sign in to your IdP in the browser the tunneler opens. They don't have to dig up the JWT you sent, make sure it's
the right one, and enroll with it. If their device already trusts your controller's certificate, all they need is a
URL.

The second win is for administrators with an IdP with users configured in groups. Using auto enrollment, you can
configure the external JWT signer to copy the token's `groups` claim into the new identity's role attributes. A
service policy written against `#engineering` can then align with the IdP. If a new hire is in the engineering group
before they first sign in, they can reach engineering services right away.

## How it works

![The tunneler gets the controller URL, the user signs in to the IdP, and the controller creates the identity.](/img/add-by-url/add-by-url-overview.svg)

1. The user enters the controller URL in the tunneler. The OS has to trust the controller's certificate.
2. The tunneler opens the IdP sign-in in the browser.
3. The controller checks the IdP token with the external JWT signer.
4. With auto enrollment on, the controller creates the identity and copies the token's groups into its role
   attributes.

## The lab

The lab builds this for a company called Acme, with three users in Keycloak and two web services:

| User | IdP group | Identity | Reaches |
| --- | --- | --- | --- |
| `alice` | `engineering` | Created at sign-in, in step 6 | Engineering Wiki (`eng-wiki`) |
| `bob` | `hr` | Created at sign-in, in step 6 | HR Portal (`hr-portal`) |
| `carol` | None | Created by the administrator, in step 8 | Engineering Wiki (`eng-wiki`) |

## What you need

- An OpenZiti 2.0 or later network with a controller and a public edge router, and router policies that let every
  identity and service use that router. To create one, see [Set up a network](../../get-started/network/index.md) or
  use one of the [deployment guides](@openzitidocs/category/deployments).
- A certificate for the controller's client API that your devices already trust: a public CA such as Let's Encrypt,
  or an enterprise CA your MDM deployed. [Step 1](./10-public-certificate.md) adds it to the controller.
- **Docker**, on the machine that runs the IdP and on the machine that hosts the services. They can be the same
  machine. [Step 2](./20-identity-provider.md) runs Keycloak in a container, and [step 4](./40-services.mdx) runs the
  two services in nginx containers. Any OIDC IdP works in place of Keycloak. With another IdP, create what step 2
  creates there.
- `ziti-edge-tunnel` on the machine that hosts the services. Step 4 hosts the services with it.
- A tunneler that supports add by URL on each user's device. Step 6 lists the versions.

## Steps

1. [Give the controller a public certificate](./10-public-certificate.md)
2. [Set up the identity provider](./20-identity-provider.md)
3. [Create the external JWT signer](./30-ext-jwt-signer.mdx)
4. [Host the services](./40-services.mdx)
5. [Grant access by IdP group](./50-policies.mdx)
6. [Join from a tunneler](./60-join.md)
7. [Check the new identities](./70-check-identities.mdx)
8. [Map existing identities instead](./80-map-existing-identities.mdx) (optional)
