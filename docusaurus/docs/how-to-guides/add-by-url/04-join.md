# Step 4: Join from a tunneler

![The user's device highlighted, adding the network by URL and signing in to the IdP.](/img/add-by-url/step-04-join.svg)

The user adds the network by URL, picks user session or device certificate if the tunneler asks, and signs in to the
IdP in the browser the tunneler opens.

## User session or device certificate

When the external JWT signer has both **Auto-Enroll to Token** and **Auto-Enroll to Cert** turned on, the tunneler
asks the user to pick one of two ways to enroll:

| The tunneler asks | The controller calls it | What lands on the device |
| --- | --- | --- |
| **User session** | Token enrollment | Controller URLs and a certificate authority (CA) bundle, with no key or secret |
| **Device certificate** | Certificate enrollment | A private key and a certificate for this device |

- A **user session** identity is the *person*. The user signs in to the IdP each time they need to authenticate to
  the overlay, so disabling the account in the IdP stops the next sign-in. Nothing on the device is tied to the
  identity, so the user can connect from as many devices as they need to. On a new laptop or a reinstalled
  OS, the user enters the same URL and signs in as the identity they already have. I ran two tunnelers
  side by side as `alice`. Both of them reached `eng-wiki`, and the controller still had only one `alice` identity.

  From a user's perspective, there is one small tradeoff. A user who enrolls with a JWT logs in with a certificate
  and never has to sign in to an IdP again. It's different for a user session. If the user is offline long enough for
  the IdP session or the OpenZiti session to expire, they will need to sign in to the IdP again before the tunneler
  reconnects to the overlay. That should be a button click in the tunneler. Linux is a bit more work since there's no
  UI.

- A **device certificate** identity is the *machine*. The user signs in to the IdP once, during enrollment, and the
  tunneler generates a key on that machine *only*. It'll come up on boot with nobody logged in, and it keeps working
  when the IdP is down. Disabling the account in the IdP doesn't stop it, either. An administrator has to disable or
  delete the identity in OpenZiti. In my demo, `alice` picked user session and `bob` picked device certificate. The
  `alice` identity file has no key in it at all. The `bob` file has a private key and a certificate.

:::warning A device certificate is one device
Certificate enrollment binds the identity to the key generated on that device. The key and the certificate live in
the identity file. Together they're the credential, and each user gets *one* device certificate identity. The user
can't re-enroll that device or enroll a device certificate on another machine without an administrator. An open
[feature request](https://github.com/openziti/desktop-edge-win/issues/1093) asks to change that and allow enrolling on
multiple devices.

**Forget** on the tunneler doesn't free that one up. Forget removes the identity from the device, but the identity
still exists on the controller. To move a device certificate to a new machine, or to add it again after a forget,
an administrator deletes the identity first:

```bash
ziti edge delete identity bob
```

Then the user adds by URL again. Don't copy the identity file to the new machine instead. A copied key is a shared
identity. You can't tell the two machines apart anymore, and you can't revoke one of them on its own.
:::

### Windows

In Ziti Desktop Edge for Windows 2.11.1.0 and later, the user picks **With URL** in **Add Identity** and enters the
controller URL. On 2.11.2.9 and later, a user on a network that requires multi-factor authentication (MFA) is walked
into MFA setup right after adding the identity.

<!-- WIN_PLACEHOLDER_ADD_BY_URL -->

### Linux

On Linux, `ziti-edge-tunnel` does the same from the command line. With the tunneler running, the user adds the
network by URL. The command returns the IdP URL to open in a browser, and that sign-in enrolls the identity:

```bash
# -m token for a user session, -m cert for a device certificate
sudo ziti-edge-tunnel add -i alice -u https://ctrl.example.com:1280 -m token
```

These commands talk to the running tunneler over a socket only the `ziti` group can open. To run them without
`sudo`, add the user to that group with `sudo usermod -aG ziti $USER`, then sign in again.

A device certificate is ready after that one sign-in. A user session needs a second sign-in to connect, and another
one each time the tunneler restarts:

```bash
# returns the IdP URL to open in a browser
sudo ziti-edge-tunnel ext-jwt-login -i /opt/openziti/etc/identities/alice.json -p acme-idp
```

`ext-jwt-login` takes the path to the identity file, not the name you gave `add`. With only the name, it fails with
`ziti context not found`. The first `ext-jwt-login` after the tunneler starts also needs `-p` with the signer name,
even when the controller has only one signer. Without it, the login fails with `failed to start external auth`.

## Done when

- [x] The tunneler shows the identity, signed in
- [x] The user reaches the services their IdP group allows
