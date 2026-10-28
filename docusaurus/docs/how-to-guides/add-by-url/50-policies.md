---
sidebar_label: 5. Policies by group
---

# Step 5: Grant access by IdP group

![The service policies on the controller highlighted, matching IdP groups.](/img/add-by-url/step-05-policies.svg)

The lab's Keycloak realm has two groups, `engineering` and `finance`. `alice` is in `engineering` and `bob` is in
`finance`. Each group gets one service.

Create a Dial policy for each group:

```bash
ziti edge create service-policy engineering-dial Dial \
  --identity-roles '#engineering' --service-roles '@eng-wiki'
ziti edge create service-policy finance-dial Dial \
  --identity-roles '#finance' --service-roles '@finance-ledger'
```

## Done when

- A Dial service policy exists for each IdP group that needs access
