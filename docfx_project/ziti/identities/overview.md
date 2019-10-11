# Ziti Identities

Ziti is built on the foundation of zero-trust. A solid pillar of that foundation requires that all connections in a
Ziti-enabled network are authenticated.  Identities are the basis for Ziti authentication.  All devices connecting to a
Ziti network will have an Identity which is presented at the time of a connection being established by both the device
initiating the connection and the device receiving the incoming connection.

Conceptually an identity can be thought of as congruent to a user account.  Identities are logical entities stored
inside the Ziti Controller which map an X509 certifcate to a particular named identity.  Identities exist not only to
authenticate connections but are also used to authorize identities within Ziti. See [AppWANs](../appwans/overview.md)
for more information on authoriziation of identities.

[!include[](./creating.md)]

[!include[](./enrolling.md)]
