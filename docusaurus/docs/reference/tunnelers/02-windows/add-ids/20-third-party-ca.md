# Third-Party CA

OpenZiti supports adding identities where the key and certificate are provided by a third-party CA.

## Prerequisites
* ZDEW 2.5.2+
* a third-party-ca (`ca`) has been configured and verified in the OpenZiti Network
* an identity exists with an `external-id` properly mapped to a claim, 
  see [External Id & x509 Claims](/docs/learn/core-concepts/security/authentication/10-third-party-cas.md#external-id--x509-claims)
* The CA's JWT has been transferred to the computer running the ZDEW

## Adding the Identity

With the JWT for the CA on the machine running the ZDEW, click on the "ADD IDENTITY" button in the top right of the
screen. After the context menu pops up choose "With JWT". In the file dialog, select the third-party CA JWT file.

![windows-with-jwt](/img/ext-jwt-signer/windows-with-jwt.png)

After selecting the file, a dialog will appear asking for the key and certificate to use when adding the identity. 
Select the appropriate key and certificate and click "Join Network"

![third party ca](/img/ext-jwt-signer/windows-3rd-party-ca.png)
