---
title: External Authentication
sidebar_position: 100
---

[_skip to the guide on configuring OpenZiti with OIDC_](../../guides/external-auth/README.md)

An Identity Provider (IdP) is a system that manages and authenticates the identity of users. It handles login 
credentials and facilitates Single Sign-On (SSO) by verifying user identities across multiple applications or services.
Integrating with an IdP eliminates the need for users to manage multiple sets of credentials across different 
applications and allows users to sign in one place to gain access to an OpenZiti overlay network.

OpenZiti has a flexible design for integrating with external identity providers. An overlay can be configured to 
extend authentication to external identity providers using 
[external jwt signers](../core-concepts/security/authentication/50-external-jwt-signers.mdx). OpenZiti also 
allows an administrator to configure these identity providers as either the primary or secondary authentication 
mechanism by defining additional 
[authentication policies](../../learn/core-concepts/security/authentication/30-authentication-policies.md)

OpenZiti integrates with any identity provider that can supports
[Authorization Code Flow with Proof Key for Code Exchange flow](https://www.oauth.com/oauth2-servers/pkce/).
PKCE is an extension to OAuth 2.0 flow and has become a standard mechanism for clients to authenticate to an identity
provider. 

There are numerous excellent resources on the internet to learn more about OpenID Connect (OIDC), OAuth 2, and the 
PKCE flow if you need or want to learn more.
 
## Supported Identity Providers

It is impossible to test all identity providers to ensure compatibility with OpenZiti. If the provider supports 
OpenID Connect, OpenZiti should be able to integrate with the provider. If a provider is not listed below, follow 
the generic instructions for configuring an external jwt signer with OpenZiti.

For a complete list of identity providers along with a guide demonstrating how to integrate OpenZiti with the given provider, 
see the [Identity Providers](../../guides/external-auth/identity-providers/README.mdx) section under External Authentication 
guides.

Many popular identity providers already have guides on how to use them with OpenZiti such as: 
* [Auth0](../../guides/external-auth/identity-providers/auth0.mdx),
* [Okta](../../guides/external-auth/identity-providers/okta.md)
* [Zitadel](../../guides/external-auth/identity-providers/zitadel.mdx)
* [... **View the full list of Identity Providers**](../../guides/external-auth/identity-providers/README.mdx)

## Clients Supporting External Authentication

OpenZiti provides numerous clients that support using external jwt signers for authentication. The following 
OpenZiti components all support using an external identity provider for authentication:
* [BrowZer](../../guides/external-auth/browzer.mdx)
* [Ziti Desktop Edge for Windows](../../reference/tunnelers/02-windows/add-ids/ext-providers/index.mdx)
* [ziti-edge-tunnel for Linux](../../reference/tunnelers/60-linux/index.mdx)
* [Ziti Mobile Edge for Android](../../reference/tunnelers/03-android.md)
* [Ziti Desktop Edge for MacOS \[coming soon\]](../../reference/tunnelers/04-macos.md)
* [Ziti Mobile Edge for iOS \[coming soon\]](../../reference/tunnelers/05-_iOS.md)

## Authentication Policies

The OpenZiti Controller will come with a default authorization policy that allows for all primary authentication
methods: username/password, certificate-based, exteral-jwt-signer. If you are familiar with OpenZiti concepts,
additional auth-policies can be created and the default policy modified. If you are new to OpenZiti, it's recommended
you leave the default [authentication policy](../../learn/core-concepts/security/authentication/30-authentication-policies.md)
intact.

> [!TIP]
> Certificate-based authentication can be combined with an external provider providing a strong two-factor 
> authentication scheme. The certificate provides an identity to the device while the identity provider ensures 
> a trusted human is using the device at that time: human + device.

[Click here to learn more or to configure an external jwt signer for OIDC-based authentication](../../guides/external-auth/README.md)