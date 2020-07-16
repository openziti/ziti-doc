Bootstrapping Trust

## Part 5 Bootstrapping Trust

If you have read through the entire series up to here, welcome! If you
have not, please consider reading the whole series:

- [Part 1: Encryption Everywhere](./part-01.encryption-everywhere.md)
- [Part 2: A Primer On Public-Key Cryptography](./part-02.a-primer-on-public-key-cryptography.md)
- [Part 3: Certificates](./part-03.certificates.md)
- [Part 4: Certificate Authorities & Chains Of Trust](./part-04.certificate-authorities-and-chains-of-trust.md)
- [Part 5: Bootstrapping Trust](./part-05.bootstrapping-trust.md)

### Ziti

In this series of articles we are exploring bootstrapping trust and what
that means and how it enables Zero Trust security methodologies. Ziti
provides a method to bootstrap trust via its enrollment process. For
Ziti the enrollment process is bootstrapping trust. All identities in
Ziti have a key pair that identifies that individual. The enrollment
process abstracts away the process of setting up keys, certificates,
CSRs, CAs, and having each software component of Ziti trust the
necessary certificates. The Ziti SDK can be embedded within any
application and enroll with a Ziti network - instantly granting it
secure, encrypted, and trusted connections that provide part of Ziti's
Zero Trust model.


Ziti has the concept of the Edge, which sits on top of the Fabric. The
Fabric provides long haul mesh routing while the Edge focuses on
enrolling Ziti components, managing access via policies, and maintaining
the trust necessary to provide the foundation of a Zero Trust network
without the hassle of setting it up yourself. Together they are a
powerful combo of optimized long halt routing and access and trust
management.

<img src="./images/fabric-edge.png" style="width: 50%; margin: 0 auto; display: block;">

A small scale example Ziti system appears as follows:

<img src="./images/ziti-system.png" style="width: 80%; margin: 0 auto; display: block;">

Ziti Edge has the concepts of identities for endpoint SDKs and routers.
Both require certificates signed by a trusted CA, and Ziti can generate
the PKIs for you. This PKI and its CAs will form the backbone of the
trust system that Ziti will deploy for you. In the system diagram above,
the Ziti Controller will manage an intermediate CA and a secure
enrollment process that will bootstrap trust for each router and SDK.
After bootstrapping trust, the controller will maintain data to manage
the entire life cycle of the certificates it generates. This life cycle
encompasses all the concerns from part one of this series, including
bootstrapping, revoking, renewing, and rotating keys.

So let us review the components a Ziti Controller must have to function:

1. A CA (intermediate or root)
2. A server certificate generated for the Controller's IP/hostname/etc.
   Signed by the CA or a public CA
3. A Ziti Controller configured and ready to run

This article series has touched on items one and two, but not three. For
information on how to configure a Ziti Controller refer to the
documentation on Github. You will also find details on how to use the
Ziti CLI to generate items one and two there. However, here is a simple
command that will help get the controller started.

```
 ziti pki create ca test1
 ziti pki create server --dns myserver.com
```

## Enrollment

Once a Ziti controller is up and running, it is possible to create a new
identity and enroll it. Behind the scenes, many things happen, but for
now, let us focus on what an administrator would have to perform.

Authenticate via the Ziti CLI, Ziti Admin Console (ZAC), or Edge REST
API Issue a request to create a new identity for an SDK or router
Receive an enrollment JWT Use the JWT on the enrolling device/server to
enroll

In those four steps, we have performed many complex interactions.

- The enrolling identity:
  - validated the enrollment JWT cryptographically
  - validated the Ziti Controller as a suitable trust anchor
    cryptographically
  - bootstrapped its trust pool of CAs as additional trust anchors over
    a secure connection
  - generated a key pair
  - generated a CSR
- The controller has:
  - asserted its identity cryptographically
  - asserted the validity of the enrolling identity
  - provided a CA store of trust anchors
  - fulfilled the CSR request for the identity

All of these items performed, making no assumptions and securely
verifying along each step. This process cannot suffer from
man-in-the-middle attacks. It is also possible for the controller and
enrolling identity to check each other for compatibility. It provides
many benefits! Below is a detailed image of each step of the enrollment
process.

<img src="./images/enrollment-full.png" style="width: 50%; margin: 0 auto; display: block;">


Let's break those steps down:

1. Via the Ziti CLI, ZAC, or Edge REST API the admin authenticates and
   requests to create an identity
2. The admin receives a JWT that is signed by the controller and is
   cryptographically verifiable. The JWT contains all the information
   for the enrolling device/server to contact the controller and verify
   its identity. It also includes a secret enrollment token.
3. The JWT is email/transmitted/etc. to the enrolling device
4. The device parses the JWT, verifies all the information is present to
   enroll
5. Retrieves the public certificate from the controller at the address
   specified in the JWT
6. confirms that server is, in fact, the owner of the private key for
   that certificate
7. Uses the retrieved certificate to verify the signature on the JWT
8. Verifies content has not changed
9. Verifies the issuing server is the server we are communicating with
10. Make a secure connection to the server and request the CAs to trust
    by trusting only the controller's certificate.
11. The enrolling identity generates key pair if necessary, and a CSR.
    The CSR is submitted in a request with the JWT's enrollment token.
12. The controller verifies the CSR, verifies the enrollment token,
    verifies the client connection, and then returns the necessary
    signed certificates.

At the end of the process, which took four simple human steps, but
numerous cryptographically secure software steps. The controller now has
a record of the certificates issued to a specific identity. That
identity now has certificates that can be used to make connections to
other enrolled Ziti components. All components in the system can verify
the identity of any other Ziti component. At every step, every link is
validated as trusted. No individual piece of software trusts any other
for inbound or outbound connections. Trust has been successfully
bootstrapped! Now we enter a maintenance window where trust has to be
verified continuously and maintained.

# Conclusion

Thank you for reading this far! If you completed the entire series, I hope
it has been helpful. Zero Trust is a complicated topic and it requires a
serious foundation in bootstrapping trust to get right. Hopefully this series
starts you on your way. If you have time, please checkout (Ziti)[https://github.com/openziti]! It is the
Zero Trust network overlay solution that I have personally worked on
and was the inspiration for this series!

---

Written By: Andrew Martinez  
June 2020
