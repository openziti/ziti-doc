---
title: Keycloak
sidebar_label: Keycloak
hide_table_of_contents: true
---

import CallbackUrls from '/docs/guides/external-auth/identity-providers/_callback_urls.mdx';

# Keycloak

<img src="/icons/logo-keycloak.svg" alt="Keycloak logo" height="100px"/>

This section illustrates where the expected values are found within
[the Cognito config](https://docs.goCognito.io/docs/). For a more detailed guide on enabling Cognito with
OpenZiti, see below. Use these values to configure an external JWT signer. All of these values are found from the
Cognito "Admin interface" in the corresponding provider's overview page.

| Field                 | Where to Find the Value in the Cognito Configuration                                       | Example                                                      |
|-----------------------|----------------------------------------------------------------------------------------------|--------------------------------------------------------------|
| **Issuer**            | Shown on the right as the "OpenID Configuration Issuer"                                      | https://my.Cognito.server:9243/application/o/openziti-api/ |
| **Client ID**         | Shown in the left column as the "Client ID"                                                  | openziti_client_id                                           |
| **Audience**          | Unless overridden, the same value as the "Client ID"                                         | openziti_client_id                                           |
| **External Auth URL** | The same value as the Issuer                                                                 | https://my.Cognito.server:9243/application/o/openziti-api/ |
| **JWKS Endpoint**     | Shown on the right as the "JWKS URL"                                                         | https://Cognito.example.com/jwks.json                      |
| **Claims Property**   | Typically 'email', but can also be 'sub' or any other claim contained in the JWT             | email                                                        |
| **Scopes**            | `openid` is always included. Typically 'email' but 'profile' or any standard or custom scope | profile offline_access                                       |

---

## Create an Application with Provider

Begin by creating an application with provider. Go to the admin interface, on the left expand "Applications", click
on "Applications" an then click on "Create with Provider" and complete the wizard that pops up.

![create app with provider](/img/idps/authentik/create-app-provider.png)

## Configure the Application

Enter the "Name" of the application and click the "Next" button.

![img](/img/idps/authentik/new-app-1.png)

## Choose a Provider

When choosing a provider, choose the "OAuth2/OpenID Provider" option and click the "Next" button.

![img](/img/idps/authentik/new-app-2.png)


## Configure the Provider

On the "Configure Provider" screen, enter a "Name" for the provider (or leave it as the default). When choosing the
authorization flow, select "default-provider-authorization-explicit-consent (Authorize Application)". The "Client
type" should be set to "Public". Allow for the "Client ID" to be automatically generated, or assign a meaningful
name to the provider. Note that this will also become the `aud`ience used when configuring OpenZiti. Enter the expected
redirect URLs. OpenZiti tunnelers expect to have `http://localhost:20314/auth/callback` specified as a valid callback URL.

<CallbackUrls/>

![img](/img/idps/authentik/new-app-3.png)
