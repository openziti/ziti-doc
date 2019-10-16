## Creating an Identity

The mechanism for creating identities is influenced by how your Ziti network is setup, specifically how the PKI is
established. Identities are itegrally linked to the PKI configured in a given Ziti network and directly affects how
identites are created. There are generally three groups of identities which can be created:

* One Time Token (ott) identites using the configured PKI
* One Time Token (ott) identites using a 3rd Party CA
* 3rd Party auto-enrolled identities

### One Time Token (OTT)

One time token identities are the type of identities available to all Ziti networks.  A one time token identity will
have a token generated at the time of the identity's creation.  This token is then submitted at some point in the future
as part of the [enrollment](./enrolling.md) process.  Once an identity is successfully enrolled - the one time token is
no longer valid and cannot be used to enroll the same identity again.  

One time tokens are delivered from the Ziti Controller as a [jwt](https://tools.ietf.org/html/rfc7519) and the token
expires 24 hours after the identity is created.  The token is downloadable via the basic UI provided in the [Ziti Edge -
Developer Edition](./intentionally_broken_link_to_ami.md). After you create a user you can go to the Identities page and
click the icon that looks like a certificate to download the .jwt file.

You can also create a one time token identity using the `ziti` cli tool available on the path of the [Ziti Edge -
Developer Edition](./intentionally_broken_link_to_ami.md).  This command will create a new identity and output the jwt
to the selected path. You can then transfer the .jwt file to its intended destination.

[!include[](../cli-snippets/create-identity.md)]

### 3rd Party CA - Overview

It's possible that your organization wants to reuse an existing PKI rather than to incorporate a new PKI for
Ziti-powered networks. If you have an existing PKI setup you wish to reuse or if you are just interested in learning how
to use a 3rd Party CA this section is for you.

> [!NOTE]
Reusing a PKI is not a simple topic and managing and maintaining a PKI is out of the scope of this guide.

A 3rd Party CA will need to be created and the public certificate uploaded into the Ziti Controller. After using an
existing PKI to reuse/generate a certificate, the Ziti Controller will be to create identities which will be expected to
present a certificate during the connection process that is valid per the provided certificate.

#### Adding a 3rd Party CA to the Ziti Controller

Adding a certifate to the Ziti Controller is easy using the Ziti Console provided in the [Ziti Edge -
Developer Edition](./intentionally_broken_link_to_ami.md).

#### [New CA via UI](#tab/tabid-new-ca-ui)

1. On the left side click "Certificate Authorities"
1. In the top right corner of the screen click the "plus" image to add a new Certificate Authority
1. Enter the name of the Certificate Authority you would like to create
1. Choose if the CA should be used for Enrollment (yes) and Auth (yes)
1. Click save

#### [New CA via REST](#tab/tabid-new-ca-cli)

[!include[](../../api/rest/create-ca-json.md)]

***

#### 3rd Party CA - One Time Token



#### 3rd Party CA - Auto Enrolled

