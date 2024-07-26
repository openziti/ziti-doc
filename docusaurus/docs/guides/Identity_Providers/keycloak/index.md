---
title: Keycloak for BrowZer
sidebar_label: Keycloak
slug: /identity-providers-for-browZer-keycloak
---

<head>
  <title>Keycloak for OpenZiti BrowZer</title>
  <meta
    name="description"
    content="How to configure Keycloak for OpenZiti BrowZer."
  />
</head>

<img src="/icons/logo-keycloak.svg" alt="How to configure Keycloak for OpenZiti BrowZer" width="20%"/>

### Create a new `Realm`

A realm in Keycloak is equivalent to a tenant. Each realm allows an administrator to create isolated groups of applications and users. Initially, Keycloak includes a single realm, called master. Use this realm only for managing Keycloak and not for managing any applications.

Use these steps to create a realm for use with BrowZer.

1. Login to your Keycloak Admin Console.
1. Click the word **master** in the top-left corner, then click **Create Realm**:
![Keycloak Realm](/img/kc-realm.png)
1. Enter `browZerDemoRealm` (or whatever you want, but `browZerDemoRealm` will be used throughout this example) in the **Realm name** field:
![Keycloak Realm](/img/kc-realm-2.png)
1. Click **Create**.

<br/>

### Create a new `Client`

Use these steps to create a realm for use with BrowZer.

1. Click the word **master** in the top-left corner, then click **browZerDemoRealm**
1. Click **Clients**
1. Click **Create client**
1. Fill in the form with the following values:
    - **Client type**: `OpenID Connect`
    - **Client ID**: *browZerDemoClient* (or whatever you want, but *browZerDemoClient* will be used throughout this example)
    ![Keycloak Create Client](/img/kc-create-client.png)
    - Click **Next**
    - Confirm that **Standard flow** is enabled
    - Click **Next**
    - Make these changes under **Login settings**
        - Set **Valid redirect URIs** to `https://<DOMAIN_WHERE_YOU_WILL_RUN_BROWZER_BOOTSTRAPPER>/*`
          
          (***NOTE***: the `/*` on the end of the redirect URI is important!)
        - Set **Web origins** to `https://<DOMAIN_WHERE_YOU_WILL_RUN_BROWZER_BOOTSTRAPPER>`
    - Click **Save**

<br/>

### Federate out to `Google`

If you wish to set up Keycloak to be able to federate out to Google as an OpenID Connect (OIDC) authentication provider, follow the instructions below.

- Go to your [Google Developer Console](https://console.developers.google.com/)
- Click on the dropdown near the Google Cloud logo:
![Keycloak Google federate](/img/kc-google-1.png)
<br/>
<br/>
- Click on **NEW PROJECT**
![Keycloak Google federate](/img/kc-google-2.png)
<br/>
<br/>
- In the following form provide a name and an organization, then click on **Create**:
![Keycloak Google federate](/img/kc-google-3.png)
- You will be redirected to a page similar to the one in the following screenshot:
![Keycloak Google federate](/img/kc-google-4.png)
<br/>
<br/>
- Click on **Explore and enable APIs** and you will be redirected to the following page, click on **Credentials**.
![Keycloak Google federate](/img/kc-google-5.png)
<br/>
<br/>
- Now the Google Console reminds us that we need to **Configure the consent screen**. This is a mandatory step for our integration and it configures what users will see when we redirect them to Google for signing in.
Let’s do it now, click on that button.
![Keycloak Google federate](/img/kc-google-6.png)
<br/>
<br/>
- Select **External** if we want to allow any Google account to sign in to our application. Then click on **Create**.
![Keycloak Google federate](/img/kc-google-7.png)
<br/>
<br/>
- We will be redirected to a page with many settings, fill them as follows:
    - Application type: **Public**
    - Application name: **Your application name (anything you want)**
    - Authorized domains: **Your application top level domain name**
    - Application Homepage link: **Your application homepage**

    Then click on Save at the end of the page

<br/>

- Go to the [Credentials page](https://console.developers.google.com/apis/credentials)
![Keycloak Google federate](/img/kc-google-8.png)
<br/>
<br/>
- Click on **Create Credentials**
![Keycloak Google federate](/img/kc-google-9.png)
<br/>
<br/>
- Click on **OAuth client ID**
![Keycloak Google federate](/img/kc-google-10.png)
<br/>
<br/>
- Select **Web Application** as the type of your application, add a name for your application, and into the **Authorized redirect URIs** field add the URL you saved near the end of the first step of this guide. It should be something like:
`https://YOUR_KEYCLOAK_DOMAIN/auth/realms/YOUR_REALM_NAME/broker/google/endpoint`

  You will get now a set of credentials, Client ID and Client Secret
![Keycloak Google federate](/img/kc-google-11.png)
<br/>
<br/>
- Leave the above Google Console page open.  You will need the **Client ID** and **Client Secret** while setting up Keycloak in the next parts of this guide.
- Back in Keycloak admin console, click on **Identity Providers**:

![Keycloak Google federate](/img/kc-identity-providers.png)
<br/>
<br/>

- Click **Add provider**, then select **Google** as the provider:
 
![Keycloak Google federate](/img/kc-add-provider.png)
<br/>
<br/>

- Add the ClientId and Client secret from the above Google Console page into Keycloak:
![Keycloak Google federate](/img/kc-add-provider-2.png)
 
- Click on **Save**
- In Keycloak admin console, click on **Client Scopes**:

![Keycloak Google federate](/img/kc-client-scopes.png)

- Click **Create Client Scope**
- Go to **Mappers** tab for your new Scope

![Keycloak Google federate](/img/kc-mappers.png)

- Create a new Audience Mapper

![Keycloak Google federate](/img/kc-aud-mapper.png)

- Include the *browZerDemoClient*
![Keycloak Google federate](/img/kc-browZer-demo-client.png)

- Ensure the **Include in token scope** checkbox is ON
- Go to **Clients, browZerDemoClient, Client Scopes, dedicated, Scope**, and disable the Full scope allowed checkbox:

![Keycloak Google federate](/img/kc-full-scope.png)

- Click on **Client scopes**:

![Keycloak Google federate](/img/kc-client-scopes.png)

- Click **Create client scope**, then select **browZerDemoScope**:
![Keycloak Google federate](/img/kc-demo-scope.png)

- Click on **Realm settings**, then click **OpenID Endpoint Configuration**:
![Keycloak Google federate](/img/kc-oidc-1.png)

- This will produce JSON resembling the following (take note of the `issuer` and `jwks_uri` fields. *Yours will be slightly different than what is shown here*):
![Keycloak Google federate](/img/kc-oidc-2.png)

### Create External JWT Signer
Using the the `issuer` and `jwks_uri` values described above, use the `ziti` CLI to configure an external JWT signer that represents your Keycloak identity provider.  You can find details on how to do this in the [BrowZer Quickstart documentation](/docs/learn/quickstarts/browzer/)

