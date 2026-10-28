---
sidebar_label: 7. Check identities
---

# Step 7: Check the new identities

![The identities the controller created highlighted, with role attributes from IdP groups.](/img/add-by-url/step-07-check-identities.svg)

Neither `alice` nor `bob` existed in OpenZiti when the lab started. Each of them added the network by URL and signed
in. Nobody ran `ziti edge create identity` for either of them, but the controller has both now:

```text
$ ziti edge list identities
│ NAME  │ ATTRIBUTES  │ AUTH-POLICY │
│ alice │ engineering │ acme-users  │
│ bob   │ hr          │ acme-users  │
```

The policy advisor shows which services each identity is allowed to dial or bind:

```text
$ ziti edge policy-advisor identities -q alice
OKAY : alice (1) -> eng-wiki (1) Common Routers: (1/1) Dial: Y Bind: N

$ ziti edge policy-advisor identities -q bob
OKAY : bob (1) -> hr-portal (1) Common Routers: (1/1) Dial: Y Bind: N
```

Nobody typed those attributes. The controller copied them from the `groups` claim in the user's IdP token when it
created the identity.

## What to know

- **Attributes based on IdP groups are currently only added to the OpenZiti identity once, at enrollment time.** If you
  add alice to `hr` in Keycloak and alice then enrolls on a second device, alice still has only the
  `engineering` attribute. OpenZiti does not sync group state between the IdP and OpenZiti.
  The [NetFoundry platform](https://netfoundry.io/docs/platform/access-management/integrations/scim) offers that sync as
  an enterprise feature through SCIM.
- **A user with no groups can still enroll.** They just get no attributes assigned automatically. If your service
  policies use attributes to control access, that identity has no services by default. This follows the zero trust
  least privilege ethos. Every identity starts with no access and is granted only the access it needs.

## Done when

- `alice` and `bob` each have an identity with the `acme-users` auth policy
- `alice` has the `engineering` attribute and `bob` has `hr`, the groups they had when they enrolled
