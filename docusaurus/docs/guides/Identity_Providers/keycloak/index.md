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
    ![Keycloak Realm](/img/kc-create-client.png)
    - Click **Next**
    - Confirm that **Standard flow** is enabled
    - Click **Next**
    - Make these changes under **Login settings**
        - Set **Valid redirect URIs** to `https://<DOMAIN_WHERE_YOU_WILL_RUN_BROWZER_BOOTSTRAPPER>/*`
        - Set **Web origins** to `https://<DOMAIN_WHERE_YOU_WILL_RUN_BROWZER_BOOTSTRAPPER>`
    - Click **Save**





