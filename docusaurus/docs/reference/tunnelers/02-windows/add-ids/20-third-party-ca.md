# Third-Party CA

OpenZiti supports adding identities where the key and certificate are provided by a third-party CA.

## Prerequisites
* ZDEW 2.5.2+
* a third-party-ca (`ca`) has been configured and verified in the OpenZiti Network

* an identity exists with an `external-id` field set to a value provided from the external provider
* the OpenZiti Controller is configured to serve a pre-configured trusted certificate. The certificate must be verifiable
  by the OS without additional information such as using a widely trusted CA or the Windows administrator has
  added the certificate chain to the OS trust store


