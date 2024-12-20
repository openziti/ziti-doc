Once the JWT is accepted, a new identity will be added to the ZDEW. Initially, the identity will not be authorized and a
new icon will show up indicating the user needs to authorize via the external provider. If a single external provider is
configured for this OpenZiti overlay network, clicking the icon will being the Auth Flow with PKCE process. During this
time, the ZDEW will be listening on port 20314.

![Authenticating 1](/img/ext-jwt-signer/windows-auth-1.png)

After successfully completing the authentication with the external provider, the browser will redirect to the listening
port and complete the authentication flow. The user will be shown a screen that looks similar to this. The first time
this screen is shown in a browser session, it will not automatically close. Subsequent authentication events should
result in the tab automatically closing.

![pkce-success](/img/ext-jwt-signer/zac-pkce-success.png)

Assuming everything succeeds, the user will see the normal information shown by an authenticated identity.

![after-pkce-success.png](/img/ext-jwt-signer/windows-after-pkce-success.png)