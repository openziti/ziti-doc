---
title: Microsoft Entra ID for BrowZer
sidebar_label: Microsoft Entra ID
slug: /identity-providers-for-browZer-entra
---

<head>
  <title>Microsoft Entra ID for OpenZiti BrowZer</title>
  <meta
    name="description"
    content="How to configure Microsoft Entra ID for OpenZiti BrowZer."
  />
</head>

<img src="/icons/logo-entra.jpg" alt="How to configure Microsoft Entra ID for OpenZiti BrowZer" width="20%"/>

### Get an Entra ID Account

If you don't already have an account you can sign up at https://entra.microsoft.com/

### Add a new Application

Once you have an Azure account, click on the "Entra" icon in the navbar:

<p align="center">

![Entra icon](/img/entra-1.jpg)

</p>
<br/>
Then click on the "App Registrations" item in the left navbar:

<p align="center">

![Entra App Registrations](/img/entra-3.jpg)

</p>
<br/>
Then Click "New registration":

<p align="center">

![Entra New registration](/img/entra-4.jpg)

</p>

Now Register an Application:

For the `Name` of the application, enter the URL where you will be hosting your browZer bootstrapper. For the example used in this documentation, we will use `https://entra-demo.ziti.netfoundry.io`

For the `Supported account types`, click the top option (`single tenant`)

For the `Redirect URI`, make sure to select `SPA` and then enter the URL where you will be hosting your browZer bootstrapper. For the example used in this documentation, we will use `https://entra-demo.ziti.netfoundry.io`

For example:

<p align="center">

![Entra Register an Application](/img/entra-5.jpg)

</p>

Once all the above fields have been filled in, click the `Register` button at the bottom of the form.

### Token configuration

Then click on the "Token configuration" item in the left navbar:

<p align="center">

![Entra icon](/img/entra-7.jpg)

</p>
<br/>

Then click "Add optional claim":

<p align="center">

![Entra icon](/img/entra-8.jpg)

</p>
<br/>

Then select `Access` as the token type, and select `email` from the list of claims.

Then click the `Add` button at the bottom of the form.

For example:

<p align="center">

![Entra icon](/img/entra-9.jpg)

</p>
<br/>

A form will appear. Select the checkbox `Microsoft Graph email permission`,
Then click the `Add` button.

For example:

<p align="center">

![Entra icon](/img/entra-10.jpg)

</p>
<br/>

### Expose an API

Then click on the "Expose an API" item in the left navbar:

<p align="center">

![Entra icon](/img/entra-11.jpg)

</p>
<br/>

Click  `Add a scope`

<p align="center">

![Entra icon](/img/entra-12.jpg)

</p>
<br/>

For the `Application ID URI`, enter the URL where you will be hosting your browZer bootstrapper. For the example used in this documentation, we will use `https://entra-demo.ziti.netfoundry.io`

<p align="center">

![Entra icon](/img/entra-13.jpg)

</p>
<br/>

For the `Scope name`, enter `OpenZiti.BrowZer`.

For `Who can consent`, choose `Admins and users`.

Enter what you like for the descriptions.

Make sure the `State` is `Enabled`.

Then click the `Add scope` button at the borrom of the form.

For example:

<p align="center">

![Entra icon](/img/entra-14.jpg)

</p>
<br/>

### Owners

Then click on the "Owners" item in the left navbar:

<p align="center">

![Entra icon](/img/entra-18.jpg)

</p>
<br/>

Add yourself as an owner of the application:

<p align="center">

![Entra icon](/img/entra-19.jpg)

</p>
<br/>


### API permissions

Then click on the "API permissions" item in the left navbar:

<p align="center">

![Entra icon](/img/entra-15.jpg)

</p>
<br/>

The `User.Read` permission is not needed for browZer, so you may use the 3-dot menu on the right side to remove it.

<p align="center">

![Entra icon](/img/entra-16.jpg)

</p>
<br/>

Now click `Add a permission`.

<p align="center">

![Entra icon](/img/entra-17.jpg)

</p>
<br/>

Now click `My APIs`.

<p align="center">

![Entra icon](/img/entra-22.jpg)

</p>
<br/>

Now click the item representing the URL where you will be hosting your browZer bootstrapper. For the example used in this documentation, we will use `https://entra-demo.ziti.netfoundry.io`

<p align="center">

![Entra icon](/img/entra-23.jpg)

</p>
<br/>

Select the checkbox for `OpenZiti.BrowZer`, then click the `Add permissions` button at the bottom of the form.

<p align="center">

![Entra icon](/img/entra-24.jpg)

</p>
<br/>

### Manifest

Then click on the "Manifest" item in the left navbar:


Now click `Microsoft Graph App Manifest`, then scroll the JSON down to line 31 where you see `requestedAccessTokenVersion`. This field defaults to `null`.
Change the value to `2`. This is extremely important. Failure to complete this step will results in invalid `access_token`'s being produced by Entra during the `PKCE` process performed between browZer and Entra when a user authenticates.

Then click `Save`

For example:

<p align="center">

![Entra icon](/img/entra-26.jpg)

</p>
<br/>

### Gather IdP Information

Your OpenZiti network must be configured to become aware of your Entra identity provider.  OpenZiti refers to the identity provider as an `External JWT Signer`.  Before you can set up the new JWT signer, you must gather some information from the new Entra Application that you just created:
- the `clientId`
- the `issuer`
- the `jwks_uri`
<br/>
<br/>

#### Gather `clientId`

The `clientID` value can be found in the `Overview` tab of the Application you Registered above:

<p align="center">

![Auth0 clientId](/img/entra-27.jpg)

</p>
<br/>

#### Gather `issuer`

The `issuer` can be found via the openid-configuration endpoint that all OIDC-compliant identity providers expose.  

The openid-configuration endpoint URL for Entra looks like this:

<p align="center">

`https://login.microsoftonline.com/<YOUR_TENANT_ID>/v2.0/.well-known/openid-configuration`

</p>

where the value for `<YOUR_TENANT_ID>` can be found in the `Overview` tab of the Application you Registered above:

<p align="center">

![Auth0 Domain](/img/entra-28.jpg)

</p>

When you enter the openid-configuration endpoint URL (`https://login.microsoftonline.com/<YOUR_TENANT_ID>/v2.0/.well-known/openid-configuration`) into a browser, you will receive a response resembling the following:

<p align="center">

![Auth0 OIDC config](/img/entra-29.jpg)

</p>
<br/>

Take note of the `issuer` value.
<br/>


#### Gather `jwks_uri`
Take note of the `jwks_uri` value returned from the above openid-configuration endpoint URL.
<br/>

### Create External JWT Signer
Using the values described above, use the `ziti` CLI to configure an external JWT signer that represents your Auth0 identity provider.  You can find details on how to do this in the [BrowZer Quickstart documentation](/docs/learn/quickstarts/browzer/)

