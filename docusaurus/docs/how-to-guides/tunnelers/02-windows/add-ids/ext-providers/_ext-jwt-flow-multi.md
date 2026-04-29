If your network is configured with more than one external provider, a popup will be shown when clicking on
the "authorize IdP" icon. The popup will contain a list of the providers to select from. Choosing a provider from the
list will begin the authorization flow for the selected provider.

![more than one provider](/img/ext-jwt-signer/windows-more-than-one-provider.png)

### Saving a Default Provider

When using external providers, it's likely users will want to assign a provider as a default. Before
authenticating, click on the detail entry for the given identity a default should be assigned to. A new screen will
appear looking like the image shown below.

![more than one provider](/img/ext-jwt-signer/windows-provider-prefs.png)

To assign a default provider, click the desired provider and click the "Default provider?" checkbox. The UI will remember
the setting when it is clicked. There is no need to 'save' this setting. When a default provider is selected on a network
with multiple providers, no popup will be shown when clicking the "authorize IdP" icon.

#### Saving a Default Provider When Authenticated

If already authenticated, clicking on the Identity Detail page will show the services assigned and accessible to the user.
The default provider selection screen can be accessed by clicking the green oidc icon in the top left, shown below. This
icon will toggle between default provider selection and service view.

![oidc / service detail toggle](/img/ext-jwt-signer/windows-oidc-toggle.png)

### Resetting a Default Provider

To reset the default provider simply uncheck the "Default provider" checkbox. When first opening the identity details
page, the default provider will be automatically selected. If another provider is highlighted, choose the default provider
and uncheck the "Default provider" box. There is no need to 'save' this setting, the values is stored immediately.

### Non-Default Provider

If a default provider has been selected, users may still elect to authenticate with a different provider. To use a
different provider than the default, open the identity details page and select the provider to authenticate with. Once
selected, click "Authenticate With Provider" and the selected provider will be used to authenticate.
