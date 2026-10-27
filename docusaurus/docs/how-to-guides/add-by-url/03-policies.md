# Step 3: Grant access by IdP group

![The service policies on the controller highlighted, matching IdP groups.](/img/add-by-url/step-03-policies.svg)

My demo network has a Keycloak realm with two groups, `engineering` and `finance`. `alice` is in `engineering` and
`bob` is in `finance`. OpenZiti has two services and a Dial policy for each group:

```bash
ziti edge create service-policy engineering-dial Dial \
  --identity-roles '#engineering' --service-roles '@eng-wiki'
ziti edge create service-policy finance-dial Dial \
  --identity-roles '#finance' --service-roles '@finance-ledger'
```

## Done when

- [x] A Dial service policy exists for each IdP group that needs access
