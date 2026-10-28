---
sidebar_label: 6. Join
---

# Step 6: Join from a tunneler

![The user's device highlighted, adding the network by URL and signing in to the IdP.](/img/add-by-url/step-06-join.svg)

In this step, `alice` and `bob` each add the network by URL and sign in to the IdP in the browser the tunneler opens.

When the tunneler asks how to enroll, pick **User session**. A user session needs only the URL and an IdP sign-in, and
the same URL works on every device the user has.

## Join

### Windows

In Ziti Desktop Edge for Windows 2.11.1.0 and later, the user picks **With URL** in **Add Identity** and enters the
controller URL. On 2.11.2.9 and later, a user on a network that requires multi-factor authentication (MFA) is walked
into MFA setup right after adding the identity.

For the full Windows walkthrough, see
[By URL](../tunnelers/02-windows/add-ids/ext-providers/40-ext-jwt-url.mdx).

### Linux

These steps were tested with `ziti-edge-tunnel` 1.18.7.

On Linux, `ziti-edge-tunnel` does the same from the command line. With the tunneler running, the user adds the
network by URL. `-m token` picks a user session. The command returns the IdP URL to open in a browser, and that
sign-in enrolls the identity:

```text
sudo ziti-edge-tunnel add \
  -i alice \
  -u https://ctrl.example.com:1280 \
  -m token
```

These commands talk to the running tunneler over a socket only the `ziti` group can open. To run them without
`sudo`, add the user to that group with `sudo usermod -aG ziti $USER`, then sign in again.

A user session needs a second sign-in to connect, and another one each time the tunneler restarts. This command
returns the IdP URL to open in a browser:

```text
sudo ziti-edge-tunnel ext-jwt-login \
  -i /opt/openziti/etc/identities/alice.json \
  -p acme-idp
```

## Check access

Open each service in a browser on each user's device:

| User | `http://eng-wiki.acme.ziti` | `http://finance-ledger.acme.ziti` |
| --- | --- | --- |
| `alice` | Loads the Engineering Wiki | Doesn't load |
| `bob` | Doesn't load | Loads the Finance Ledger |

## Done when

- The tunneler shows each identity, signed in
- `alice` and `bob` each reach only the service in the [Check access](#check-access) table
