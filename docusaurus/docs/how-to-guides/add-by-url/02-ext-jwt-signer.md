# Step 2: Create the external JWT signer

![The external JWT signer on the controller and the IdP highlighted.](/img/add-by-url/step-02-ext-jwt-signer.svg)

OpenZiti 2.0 added another ease-of-use feature: creating the identity during that enrollment. In the Ziti Admin
Console, it's called **Auto Enrollment** (**Auto-Enroll to Cert** and **Auto-Enroll to Token**). In the API, it's
`enrollToCertEnabled` and `enrollToTokenEnabled` on the external JWT signer, the controller object that says which
IdP's tokens to accept. When it's on, the administrator doesn't have to create identities ahead of time. They
configure the external JWT signer once, and each user's identity is created automatically the first time that user
signs in.

## Create the signer and auth policy

I created the signer for my demo Keycloak realm with auto enrollment turned on:

```bash
IDP=https://idp.example.com:8443/realms/acme

SIGNER_ID=$(ziti edge create ext-jwt-signer acme-idp "$IDP" \
  --jwks-endpoint "$IDP/protocol/openid-connect/certs" \
  --audience openziti \
  --claims-property email \
  --external-auth-url "$IDP" \
  --client-id openziti --scopes openid --scopes profile --scopes email \
  --enroll-to-token --enroll-to-cert \
  --enroll-name-claims-selector preferred_username \
  --enroll-attr-claims-selector groups)

POLICY_ID=$(ziti edge create auth-policy idp-users \
  --primary-cert-allowed \
  --primary-ext-jwt-allowed --primary-ext-jwt-allowed-signers "$SIGNER_ID")

ziti edge update ext-jwt-signer acme-idp --enroll-auth-policy "$POLICY_ID"
```

Every new identity gets its fields from the token. `externalId` comes from `email`, the name comes from
`preferred_username`, and the role attributes come from `groups`. New identities land in the `idp-users` auth policy.
It allows both certificate and ext-jwt authentication, which covers both ways a new identity might authenticate
later. The signer and the policy point at each other, so create the signer first, then the policy, then link them.

## Configure the IdP client

The Keycloak client, `openziti`, is a public client that uses Proof Key for Code Exchange (PKCE) with S256. It has
one redirect URI, `http://localhost:20314/auth/callback`, and that's where the tunnelers listen for the browser to
come back. An **Audience** mapper adds `openziti` to the access token. A **Group Membership** mapper named `groups`
has **Full group path** turned off.

## Done when

- [x] `ziti edge list ext-jwt-signers` shows `acme-idp`
- [x] The signer's enroll auth policy is `idp-users`
