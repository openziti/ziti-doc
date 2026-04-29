---
title: How to set up Okta
sidebar_label: Okta
hide_table_of_contents: true
---

import { CallbackUrls } from '../../../_imports';
import Details from '@theme/MDXComponents/Details';

# Okta

<img src="@static/icons/logo-okta.svg" alt="Okta logo" height="100px"/>

The following fields are necessary in order to configure an external JWT signer with OpenZiti. This configuration will
enable authentication via JWTs obtained through an
[Authorization Code Flow with PKCE or PKCE flow](https://oauth.net/2/pkce/). The fields below are found in the Okta
admin web interface either under the **Applications** or **Security** sections on the left navigation.

The **OpenID discovery endpoint** can contain fields needed to configure the external jwt signer. Verify the URL used by
your Okta instance. Often this is the main tenant URL concatenated with '.well-known/openid-configuration' such as
https://trial-3520298.okta.com/oauth2/auspqk0v3fpttP8fZ697/.well-known/openid-configuration

| Field                 | Where to Find the Value in the Okta UI                                         | Example                                                                        |
|-----------------------|--------------------------------------------------------------------------------|--------------------------------------------------------------------------------|
| **Issuer**            | Security->API, from the list of Authorization Servers, the **Issuer URI** column | https://trial-3520298.okta.com/oauth2/auspqk0v3fpttP8fZ697                     |
| **Client ID**         | Applications->Applications, from the list of Applications the **Client ID**    | 0oapqjp4snmzqejuh197                                                           |
| **Audience**          | Security->API, from the list of Authorization Servers, the **Audience** column | openziti-aud                                                                   |
| **External Auth URL** | Same as the **Issuer**                                                         | https://trial-3520298.okta.com/oauth2/auspqk0v3fpttP8fZ697                     |
| **JWKS Endpoint**     | Use the `jwks_uri` field from the OpenID discovery endpoint.                   | https://trial-3520298.okta.com/oauth2/auspqk0v3fpttP8fZ697/.well-known/v1/keys |
| **Claims Property**   | Often `email`, but can also be `sub` or any other claim contained in the JWT   | email                                                                          |
| **Scopes**            | `openid` is always included.                                                   | profile offline_access                                                         |

---

## Create App Integration

From the Okta admin dashboard, expand the Applications left-side navigation and click **Applications** and click the 
**Create App Integration** button.

:::info[Create Application]
![Create Application](/img/idps/okta/create-app.png)
:::

On the following screen, ensure the **OIDC - OpenID Connect** and **Single-Page Application** are selected and click
the **Next** button.

:::info[Create a new app integration]
![Create a new app integration](/img/idps/okta/create-app-type.png)
:::

Finalize the new Single-Page App Integration by filling out the **App integration name**. Next, decide if the
application should allow for longer-lived sessions via the **Grant type** and the **Refresh Token** (recommended).
Finally, add the redirect URIs for the specific OpenZiti technology you are looking to enable.

### Callback URLs

<CallbackUrls/>

:::info[Add Application]
![Add Application](/img/idps/okta/finalize-app-integration.png)
:::

## Add an Authorization Server

Within the Okta platform, an **Authorization Server** is used to control the audience (`aud` field) added to security 
tokens. To create an audience usable by an external JWT signer for your OpenZiti Network, create a new 
**Authorization Server** by going to the admin interface, click **Security** on the left navigation and find and click 
**API**. On the resultant page, click **Add Authorization Server**.

:::info[Add Authorization Server]
![Add Authorization Server](/img/idps/okta/add-auth-server.png)
:::

In the popup, enter values for the **Name**, **Audience** and **Description**. Any values are acceptable. Whatever 
**Audience** used will be the value that needs to be assigned to the external JWT signer.

:::info[Add Authorization Server Details]
![Add Authorization Server Details](/img/idps/okta/add-auth-server-popup.png)
:::

## Add an Authorization Server Policy

Okta will require you to add an **Access Policy** to the **Authorization Server** mapping it to a particular set of 
users. Here you can choose any user or more finely control which Okta clients will leverage this **Authorization Server**.
Add a **Name** and **Description** and choose which clients to assign the policy to.

:::info[Add Authorization Server Policy]
![Add Authorization Server Policy](/img/idps/okta/add-auth-server-policy.png)
:::

## Add an Authorization Server Policy Rule

After adding the new **Access Policy**, you also need to add a **Rule** which decides when the **Authorization Server** is 
used. Click the **Add rule** button to add a new rule to the **Authorization Server**. Here, make the appropriate 
decisions. If you're not sure what to use, talk to your IdP administrator and ask for guidance. Add a **Rule Name**, 
decide which **Grants** to allow, which **Users** are assigned and which **Scopes** will activate the rule and then 
click **Create Rule** at the bottom of the form.

:::info[Add Authorization Server Policy Rule]
![Add Authorization Server Policy Rule](/img/idps/okta/add-auth-server-rule.png)
:::

## Adding an Email Claim to the Access Token

If you want to use the user's email address as a claim in your access token, this can be accomplished by creating a 
**Claim** on the **Authorization Server**. From the **Authorization Server** detail page, find the **Claims** tab and select 
it. On the form, under **Claim type** click **Access** to select the Access token then click **Add Claim**.

:::info[Add Claim]
![Add Email Claim](/img/idps/okta/add-email-claim.png)
:::

To finalize the claim fill out the fields shown and click **Create** when done:
* **Name** - the name of the claim **as it appears in the JWT**. You likely want this to be `email`
* **Value** - use the expression/value of `user.email` as the **Value** to get the user's email
* **Include in** - what scopes if requested will activate the claim. Using `openid` alone is sufficient to always 
  return it in tokens. Assign other claims such as `profile` or `email` to activate the claim more specifically

:::info[Add Email Claim - Details]
![Add Email Claim](/img/idps/okta/add-email-claim-detail.png)
:::

## Verify Token in Okta Web Portal

The Okta web portal can also help verify tokens before using them with OpenZiti. This functionality can be quite 
helpful. From the **Authorization Server**, click the **Token Preview** tab. Fill out the **OAuth/OIDC client**, **Grant 
type**, **User** and **Scopes**, then click **Preview Token**. The resulting `id_token` or (access) `token` will be 
shown in the **Preview** pane to the right. Use this preview to ensure the OpenZiti overlay is configured correctly.

:::info[Verify Token in Okta Web Portal]
![Verify Token in Okta Web Portal](/img/idps/okta/verify-token.png)
:::