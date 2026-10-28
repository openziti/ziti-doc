---
sidebar_label: 3. External JWT signer
---

# Step 3: Create the external JWT signer

![The external JWT signer on the controller and the IdP highlighted.](/img/add-by-url/step-03-ext-jwt-signer.svg)

OpenZiti 2.0 added another ease-of-use feature: creating the identity during that enrollment. In the Ziti Admin
Console, it's called **Auto Enrollment** (**Auto-Enroll to Cert** and **Auto-Enroll to Token**). In the API, it's
`enrollToCertEnabled` and `enrollToTokenEnabled` on the external JWT signer, the controller object that says which
IdP's tokens to accept. When it's on, the administrator doesn't have to create identities ahead of time. They
configure the external JWT signer once, and each user's identity is created automatically the first time that user
signs in.

## Create the signer and auth policy

Create the signer for the lab's Keycloak realm with auto enrollment turned on:

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

If you set `--jwks-endpoint`, as shown above, the controller fetches the IdP's signing keys from that URL. The
controller must reach the URL and trust its certificate.

For every signer field, see
[External JWT signers](../../learn/core-concepts/security/authentication/70-external-jwt-signers.mdx).
For how the controller names and matches auto-enrolled identities, see
[Auto external JWT signer enrollment](../../learn/core-concepts/security/enrollment.mdx#auto-external-jwt-signer-enrollment).

## Configure the IdP client

Set up the Keycloak client, `openziti`, as [Keycloak](../identity-providers/keycloak.mdx) describes: a public client
with the tunneler callback URL and an **Audience** mapper that adds `openziti` to the access token. For auto
enrollment, add one more mapper: a **Group Membership** mapper named `groups`, with **Full group path** turned off.

## Done when

- `ziti edge list ext-jwt-signers` shows `acme-idp`
- The signer's enroll auth policy is `idp-users`
