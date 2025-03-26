---
id: extAuthOidc
title: Configuring OIDC
sidebar_position: 100
---

# Configuring for OIDC

:::note
_click here to see a list of guides to help you configure your selected [Identity Provider](./identity-providers/README.mdx)_ 
:::

OpenZiti utilizes and implements the [Authorization Code Flow with PKCE or PKCE flow](https://oauth.net/2/pkce/) 
for authentication. This flow is well-known and numerous excellent resources on the internet explain what PKCE is 
and what it entails. The guides here focuses on correctly configuring an OpenZiti 
[external JWT signer](../../learn/core-concepts/security/authentication/50-external-jwt-signers.md) for use with an OIDC 
provider. 

Correctly configuring an external jwt signer requires the careful attention. The fields below all correspond to fields 
within the JWT returned from the OIDC provider and must be exactly correct.

| Field                 | Description                                                                                                                                 |
|-----------------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| **Issuer**            | The issuer field is a unique HTTPS URL that identifies the OpenID Provider. It must match the `iss` claim provided in the JWT               |
| **Audience**          | The audience, specified as the `aud` field in the JWT, used to verify the JWT is intended for the OpenZiti Controller                       |
| **Claims Property**   | The property within the JWT returned from the OIDC provider that will map to the external ID field of an identity                           |
| **Client ID**         | The unique value provided by the OIDC provider used to identity the application within the provider to use                                  |
| **External Auth URL** | For OIDC, this is the same value as the issuer and should be the base url of the OIDC discovery endpoint (.well-known/openid-configuration) |
| **Scopes**            | The set of scopes to request when generating the authentication request to the OIDC provider                                                |
| **JWKS Endpoint**     | A url the OpenZiti Controller can use to retrieve a [JSON Web Key Set](https://en.wikipedia.org/wiki/JSON_Web_Token), used to verify JWTs   |

## The OIDC Provider Endpoint

OIDC Providers will often provide an OIDC discovery endpoint. Generally, this will be a URl accessible at the well-known
location `./.well-known/openid-discovery` appended to the OIDC provider issuer URL. For example, if the OIDC provider 
is a Keycloak server and the Keycloak server has a realm named `example` the provider will likely be located at 
https://example.keycloak.openziti.io/realms/example. The openid discovery endpoint for this server would be
located at https://example.keycloak.openziti.io/realms/example/.well-known/openid-configuration.

Using the discovery endpoint, gather the following information:

* issuer - use the `issuer` field
* external auth url - use the `issuer` field
* jwks endpoint - use the `jwsk_uri` field

:::note[IMPORTANT!]
The issuer **must** be exactly correct. It is very easy to add an extra slash `/` at the end of the issuer or remove
a `/` when it is required. The issuer must be **exactly** correct. It is recommended to inspect the oidc discovery
endpoint for the correct values. Copy and paste this value exactly.
:::

The `issuer` and `external auth url` are expected to be the same value and should be the same value as
the OIDC provider URL itself. The `jwks endpoint` (along with the `issuer`) is available from the
[oidc discovery endpoint](https://openid.net/specs/openid-connect-discovery-1_0.html). Remember, when configuring
the ext-jwt-signer for use with an OIDC flow, the `issuer` and `external auth url` will be the same value.

The remaining fields will need to be returned from the OIDC provider itself and there is no standard way to
determine the fields. The values supplied will be driven entirely from the configuration of the OIDC provider.

### Callback / Redirect URL Configuration

When configuring the OIDC provider, a callback URL is necessary. This URL specifies to the OIDC provider and the
subsequent clients what URL the OIDC provider will allow redirecting the client to in order to continue the PKCE 
flow. Different pieces of the OpenZiti overlay network will require different redirect URLs to be specified. The 
OpenZiti tunnelers expect to have `http://localhost:20314/auth/callback` specified as a valid callback URL. Ensure 
the OIDC provider is configured to allow this URL callback. 

## Information from the OIDC Provider

The following fields are obtained directly from the OIDC provider configuration. Every provider provides this 
information in different ways. See the specific providers list for more information as to configuring a specific 
provider. The following fields are obtained from the OIDC provider:

* client id
* scopes
* audience
* claims property

### The Authorization Request

The `client_id` is a unique id assigned by the OIDC provider for a given application. This id will be sent to 
clients and used when initiating the PKCE flow, It is public and not considered a secret. It is used by the OIDC 
provider to locate the proper application within the provider in order to generate a correct security token. 

The `scopes` field is also used during the authorization request. The `openid` scope will be applied to all
authorization requests. However, if the OIDC provider supports additional scopes, they may be requested by adding to 
the `scopes` field. For example, if the OIDC provider allows [refresh tokens](https://oauth.net/2/grant-types/refresh-token/),
the `offline_access`scope could be configured. Some OIDC providers will also require additional `scopes` to be 
requested in order to generate a token with the expected fields within it.

The `claims property` defines the field contained within the security token
generated by the OIDC provider that the OpenZiti Controller will use to match a particular token with an identity 
configured in the OpenZiti overlay. As such, it's often necessary to add other scopes to the authorization request. 
For example, if the user's email address is expected to be the field contained within the security token, some OIDC 
providers will require various scopes to be requested during the authorization request such as: `profile`, `email`, 
`user:email` etc. Some OIDC providers may not require additional scopes be requested and may simply allow the OIDC 
provider to be configured to always return the email address.

The `audience` field is used when making an authorization request to the OIDC provider and is also used by the 
OpenZiti Controller to validate the token presented during authentication is intended for the OpenZiti controller. 
The audience **must** be included in the token and the value of the token must match this field exactly. This field 
cannot be empty or validation of the security token will never succeed. Some OIDC providers will also require this field
be specified in the authorization request in order to generate a security token at all.




