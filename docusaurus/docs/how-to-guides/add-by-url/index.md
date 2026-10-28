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

## What you need

- An OpenZiti 2.0 or later network with a controller and a public edge router. To create one, see
  [Set up a network](../../get-started/network/index.md).
- A certificate for the controller's client API that your devices already trust: a public CA such as Let's Encrypt,
  or an enterprise CA your MDM deployed. [Step 1](./10-public-certificate.md) adds it to the controller.
- An OIDC IdP with a public client for the tunnelers. The lab is built with Keycloak, but any OIDC IdP works. To set up
  Keycloak, see [Keycloak](../identity-providers/keycloak.mdx).
- Docker on the machine that hosts the services. Step 4 runs them in nginx containers.
- A tunneler that supports add by URL. Step 6 lists the versions.

## Steps

1. [Give the controller a public certificate](./10-public-certificate.md)
2. [Set up the identity provider](./20-identity-provider.md)
3. [Create the external JWT signer](./30-ext-jwt-signer.md)
4. [Host the services](./40-services.md)
5. [Grant access by IdP group](./50-policies.md)
6. [Join from a tunneler](./60-join.md)
7. [Check the new identities](./70-check-identities.md)
8. [Map existing identities instead](./80-map-existing-identities.md) (optional)
