---
sidebar_label: 5. Policies by group
---

# Step 5: Grant access by IdP group

![The service policies on the controller highlighted, matching IdP groups.](/img/add-by-url/step-05-policies.svg)

A [service policy](../../learn/core-concepts/security/authorization/policies/overview.mdx#service-policies) grants
identities access to services. A Dial policy controls who can use a service, and a Bind policy controls who can host
it. Step 4 created the Bind policy. This step creates the Dial policies.

The policies select identities by
[role attribute](../../learn/core-concepts/security/authorization/policies/overview.mdx#roles-and-role-attributes), not
by name. `#engineering` matches every identity with the `engineering` attribute. No user identities exist yet.
When `alice` signs in during step 6, the controller creates her identity with the `engineering` attribute from her
IdP groups, and this policy already covers her. The administrator writes one policy per group, once, instead of
granting each new user by hand.

The lab's Keycloak realm has two groups, `engineering` and `finance`. Each group gets one service:

```text
ziti edge create service-policy engineering-dial Dial \
  --identity-roles '#engineering' \
  --service-roles '@eng-wiki'

ziti edge create service-policy finance-dial Dial \
  --identity-roles '#finance' \
  --service-roles '@finance-ledger'
```

## Done when

- A Dial service policy exists for each IdP group that needs access
