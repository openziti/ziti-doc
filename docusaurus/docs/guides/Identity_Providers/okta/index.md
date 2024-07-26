---
title: How to set up Okta for BrowZer
sidebar_label: Okta
slug: /identity-providers-for-browZer-okta
---

<head>
  <title>Okta for OpenZiti BrowZer</title>
  <meta
    name="description"
    content="How to configure Okta for OpenZiti BrowZer."
  />
</head>

<img src="/icons/logo-okta.svg" alt="How to configure Okta for OpenZiti BrowZer" width="20%"/>

### Get an Okta Account

If you don't already have an account you can sign up for a free Okta account at https://developer.okta.com/signup

![Okta Free Account](/img/okta-free.jpg)

### Add a new Application

Once you have an Okta account, click on **Applications** in the left navbar:

![Okta Applications](/img/okta-apps.jpg)
<br/>

Then click on the **Create App Integration**:
<br/>

![Okta Applications](/img/okta-create-app.jpg)

Next, select the type of SSO protocol to implement. 

Okta supports two SSO standards: 
- `OpenID Connect (OIDC)` and 
- `Security Assertion Markup Language (SAML)`

Okta recommends using `OIDC` for new SSO integrations, and, ***BrowZer requires OIDC***, so select `OIDC`:

<br/>

![Okta OIDC](/img/okta-oidc.jpg)
<br/>

Now, select the **Application type** of `Single-Page Application`

<br/>

![Okta OIDC](/img/okta-spa.jpg)

<br/>

Click **Next**

Give your SPA a name.

Ensure **Grant type** is *Authorization Code*

Set **Sign-in Redirect URIs** to `https://<YOUR_BROWZER_DOMAIN>/login/callback` (where YOUR_BROWZER_DOMAIN is [determined here](/docs/learn/quickstarts/browzer/example/#before-you-begin))

Set **Sign-out Redirect URIs** to `https://<YOUR_BROWZER_DOMAIN>` (where YOUR_BROWZER_DOMAIN is [determined here](/docs/learn/quickstarts/browzer/example/#before-you-begin))

Set **COntrolled access** to `Skip group assignment for now` 


<br/>

![Okta OIDC](/img/okta-spa-2.jpg)

<br/>

Click **Save**

### Gather IdP Information

Your OpenZiti network must be configured to become aware of your Okta identity provider.  OpenZiti refers to the identity provider as an `External JWT Signer`.  Before you can set up the new JWT signer, you must gather some information from the new Okta Application that you just created:
- the `clientId`
- the `issuer`
- the `jwks_uri`
<br/>
<br/>

#### Gather `clientId`

The `clientID` value can be found in the `general` tab of the SPA you created above:

<br/>

![Okta clientId](/img/okta-clientid.jpg)

<br/>

#### Gather `issuer`

The `issuer` can be found via the openid-configuration endpoint that all OIDC-compliant identity providers expose.  The openid-configuration endpoint URL for Okta looks like this:

`https://<OKTA_DOMAIN>/.well-known/openid-configuration` (where `OKTA_DOMAIN` for a free dev account will resemble `dev-12345678.okta.com`)

When you enter the openid-configuration endpoint URL (`https://<OKTA_DOMAIN>/.well-known/openid-configuration`) into a browser, you will receive a response resembling the following:

![Okta OIDC config](/img/okta-oidc-config.jpg)

<br/>

Take note of the `issuer` value.
<br/>


#### Gather `jwks_uri`
Take note of the `jwks_uri` value returned from the above openid-configuration endpoint URL.
<br/>

### Create External JWT Signer
Using the values described above, use the `ziti` CLI to configure an external JWT signer that represents your Okta identity provider.  You can find details on how to do this in the [BrowZer Quickstart documentation](/docs/learn/quickstarts/browzer/)

