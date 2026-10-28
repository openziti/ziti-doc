---
sidebar_label: 3. External JWT signer
---

# Step 3: Create the external JWT signer

![The external JWT signer on the controller and the IdP highlighted.](/img/add-by-url/step-03-ext-jwt-signer.svg)

The external JWT signer is the controller object that says which IdP's tokens to accept. It points the controller at
the Keycloak realm from step 2.

Since OpenZiti 2.0, the signer can also create the identity the first time a user signs in. In the Ziti Admin
Console, it's called **Auto Enrollment** (**Auto-Enroll to Cert** and **Auto-Enroll to Token**). In the API, it's
`enrollToCertEnabled` and `enrollToTokenEnabled`. When it's on, the administrator doesn't have to create identities
ahead of time. They configure the external JWT signer once.

The two switches are the two ways a user can enroll: a user session (token) or a device certificate (cert). With both
on, the tunneler asks the user to pick one. The lab uses user sessions.

## Create the signer and auth policy

Create the signer for the lab's Keycloak realm with auto enrollment turned on:

```text
SIGNER_ID=$(ziti edge create ext-jwt-signer acme-idp https://idp.example.com:8443/realms/acme \
  --jwks-endpoint https://idp.example.com:8443/realms/acme/protocol/openid-connect/certs \
  --external-auth-url https://idp.example.com:8443/realms/acme \
  --audience openziti \
  --claims-property email \
  --client-id openziti \
  --scopes openid \
  --scopes profile \
  --scopes email \
  --enroll-to-token \
  --enroll-to-cert \
  --enroll-name-claims-selector preferred_username \
  --enroll-attr-claims-selector groups)

ziti edge create auth-policy idp-users \
  --primary-cert-allowed \
  --primary-ext-jwt-allowed \
  --primary-ext-jwt-allowed-signers $SIGNER_ID

ziti edge update ext-jwt-signer acme-idp \
  --enroll-auth-policy idp-users
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

The signer reads what the step 2 client puts in the token: `--audience openziti` matches the **Audience** mapper,
and `--enroll-attr-claims-selector groups` reads the **Group Membership** mapper.

## Done when

- `ziti edge list ext-jwt-signers` shows `acme-idp`
- The signer's enroll auth policy is `idp-users`
