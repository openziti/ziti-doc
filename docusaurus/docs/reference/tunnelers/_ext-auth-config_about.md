## Configuring External Auth in OpenZiti

To configure an External Provider for use with an OpenZiti tunneler, create an `ext-jwt-signer`.

This can be accomplished using the `ziti` CLI or through the Ziti Admin Console (ZAC). Properly configuring the external
jwt signer will require careful attention, as even one stray character can prevent authentication from working. It is 
very easy to add an extra slash or remove an important slash. Remember, the fields all must match exactly or authentication
will fail.

The following fields are used creating an external JWT signer:
* issuer - the issuer (iss) to expect
* audience - the audience (aud) the JWT is expected to be for, for example: `openziti`
* client-id - a string assigned by the provider, used when performing the Auth Flow with PKCE process
* jwks-endpoint - a URL used by the OpenZiti Controller to verify the provided JWT
* claims-property to match (often `email`). The JWT must contain a claim with the provided value
* scopes - additional scopes to request from the provider. Often `email` or `profile`
* external-auth-url - the URL users are directed to for authentication with the external provider
