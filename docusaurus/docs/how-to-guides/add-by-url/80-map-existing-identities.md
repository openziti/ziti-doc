---
sidebar_label: 8. Map existing identities
---

# Step 8 (optional): Map existing identities instead

![An identity the administrator created highlighted, matched to the IdP sign-in by external ID.](/img/add-by-url/step-08-map-existing-identities.svg)

You don't have to turn on auto enrollment. Without `--enroll-to-token` and `--enroll-to-cert`, add by URL still
works, but an administrator creates each identity ahead of time. The identity's external ID has to match the claim
the signer reads, which is `email` here, and its auth policy has to allow ext-jwt sign-ins.
[External JWT signers](../../learn/core-concepts/security/authentication/70-external-jwt-signers.mdx#usage) covers
how that match works. Role attributes are set by hand, the same as for any other identity:

```bash
ziti edge create identity carol --external-id carol@acme.example \
  --auth-policy idp-users --role-attributes engineering
```

In the lab, with both switches off, `carol` added the network by URL and signed in to Keycloak. The tunneler logged
`enroll_mode=none, skipping enrollment` and signed in as the `carol` identity created above. `carol` stayed one
identity and could reach `eng-wiki`.

## Done when

- The user signs in as the identity you created, and no second identity appears
