---
sidebar_label: 1. Public certificate
---

# Step 1: Give the controller a public certificate

![The controller highlighted, presenting a public certificate on its client API.](/img/add-by-url/step-01-public-certificate.svg)

JWT enrollment needs no public certificate. The controller signs the enrollment token, and the token itself is the
trust, so the controller can run on its own private PKI (public key infrastructure). See the
[five-part series on bootstrapping trust](https://openziti.io/blog/bootstrapping-trust-part-1-encryption-everywhere)
for how that works.

Add by URL has no token, so it has nothing to bootstrap trust from. The tunneler must trust the controller enough to
download its network JWT, so the URL it downloads from must present a valid certificate the operating system trusts.
That certificate comes from a public CA such as Let's Encrypt, or from an enterprise CA your mobile device management
(MDM) tool put in the OS trust store. Users are part of that trust too: give them the URL to enter, and tell them not
to enter any other.

## Configure the controller

Follow [Add a public certificate](../deployments/public-certificate.md). Pick any two names you like. The lab uses
these examples throughout, so swap in your own names wherever they appear:

| Name | Example | Certificate |
| --- | --- | --- |
| Public | `ctrl.example.com` | A Let's Encrypt wildcard for `*.example.com` |
| Private | `ctrl-pki.example.com` | The controller's private PKI |

## Done when

- The browser opens `https://ctrl.example.com:1280` with no certificate warning
- The controller's CA bundle lists only the private PKI:

  ```text
  curl -s https://ctrl.example.com:1280/.well-known/est/cacerts \
    | base64 -d | openssl pkcs7 -inform DER -print_certs | grep subject=
  ```
