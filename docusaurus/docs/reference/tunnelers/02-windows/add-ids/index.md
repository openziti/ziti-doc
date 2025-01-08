# Adding Identities

Adding an identity is often referred to as enrolling an identity. This is the act of bootstrapping trust between
the computer adding an identity and the OpenZiti Controller.

There are numerous mechanisms to bootstrap this trust and enroll an identity to a tunneler. The most common
is probably via a JWT using a one-time token. There are however, other enrollment types. Currently, each type of
enrollment comes in the form of a JWT with one notable exception - the URL.

## Types of Enrollment Supported

* [One-Time Token](./ott) - Add an identity with a single use token. The most common option
* [Third-Party CA](./third-party-ca) - Add an identity using a third-party CA
* [External JWT Provider - JWT](./ext-providers/ext-jwt) - Add an identity using the configured provider and network JWT
* [External JWT Provider - URL](./ext-providers/ext-jwt-url) - Add an identity using the configured provider and URL