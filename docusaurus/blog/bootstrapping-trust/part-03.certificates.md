# Bootstrapping Trust

## Part 3: Certificates

If you have read through the entire series up to here, welcome! If you
have not, please consider reading the whole series:

- [Part 1: Encryption Everywhere](./part-01.encryption-everywhere.md)
- [Part 2: A Primer On Public-Key Cryptography](./part-02.a-primer-on-public-key-cryptography.md)
- [Part 3: Certificates](./part-03.certificates.md)
- [Part 4: Certificate Authorities & Chains Of Trust](./part-04.certificate-authorities-and-chains-of-trust.md)
- [Part 5: Bootstrapping Trust](./part-05.bootstrapping-trust.md)

In the series, we have covered public-key cryptography, where we learned
about public keys, private keys, and their uses for encryption and
signing. Using keys to sign data will play an essential role in this
article. It is vital that the reader understand that signatures verify
both the content of the data and its source. For a refresher, see
[part two](./part-02.a-primer-on-public-key-cryptography.md) of this
series.

This article covers how certificates and certificate authorities (CAs)
work as "trust anchors." When a CA is a trust anchor, it means that a
system can trust the CA to sign certificates that it can, in turn,
trust. Throughout this entire article, "trusting certificates" is
mentioned. Trusting a certificate (CA or otherwise) is a software or
operating system configuration process. This configuration tells the
system that the specified certificates are trustworthy in the eyes of
the operator.

### Certificates

Part two of this series covered keys, both public and private, but did 
not mention certificates. It is common to hear "certificate" used 
interchangeably with "public key" and, sometimes, "private key." A 
certificate must have the public key inside of it. Some storage formats
allow certificates to be stored along with the matching private key. 
One example of this is PFX files. PFX files, which are PKCS#12 archives,
are also sometimes generically referred to as a "certificates". In this 
article "certificate" will always mean an x509 certificate that contains
only the public key.

Certificates are a simple concept, but years of expansions and
extensions have added to them and can be daunting uninitiated when you
get into the nitty-gritty details. This article will strive to sit above
that detail. If you venture into the realm of generating certificates,
using OpenSSL and its configuration files, it can be a cumbersome
experience to wade through. There are many great articles and tutorials
available to get you started.

For this article, the word "certificate" will mean an "x509
Certificate". x509 is a public standard and is the de-facto standard for
software systems dealing with public-key cryptography. There are other
formats, but they are usually environment-specific, such as Card
Verifiable Certificates. x509 good enough for general purpose use on
most systems.


So, what is a certificate? It is yet another blob of data that is
specially formatted. It can be stored anywhere data can be stored but is
usually a file. For this conversation, we will focus on the following
subset of information that a certificate contains:

- Subject information
  - A public key
  - Distinguished Name
- Issuer Information
- Validity Period
- Usage/Extensions
- Signatures

#### Subject Information

Certificates contain more than keys. The Distinguished Name (DN) are
text fields. They are useful mainly to humans to know what/who owns a
certificate. It is sometimes used by software as display information or
for comparison checks. Since humans provide the DN values or configure
software with values, it is not always distinguishing. DN values have an
alternate name: relatively distinguished names.

Related to the Subject DN is the Issuer Information. The Issuer
Information is the subject of the certificate that issued the
certificate. Because of this, both the issuer information has similar
values to the subject DN. Both can include the following information:

- CN - common name - a name
- SN - surname
- SERIALNUMBER - a number that is usually unique per certificate issuer,
  but not always
- C - country
- L - locality name
- ST or S - state or province
- STREET - street address
- O - organization name
- OU - organizational unit
- T - title
- G or GN - given name
- E - email address
- UID - user id
- DC - domain component

Do not worry about memorizing that list. Simply knowing they exist and
that they may or may not matter is good enough for now. If the reader is
wondering when they might matter, well, that is generally when the
system you are using complains about them.

#### Validity Period

The Validity Period specifies two points in time from when the
certificate is valid. Before and after this window of time, the
certificate is invalid and should not be trusted. Validity periods
should be as small as possible to fit their use case. Shorter periods
reduce the window of time that compromised private key can remain useful
for an attack. The cost of this is overhead reissuing certificates as
they reach the end of their validity period.

#### Usage/Extensions

Usage/Extension Data is interesting because it can limit what roles a
certificate fulfills. Depending on the system, this may be adhered to or
not. Some examples of usage that are common to see:

- key usage: client authentication, server authentication, signatures,
  etc.
- Subject Alternate Names (SANs)
  - Limits what IP address, email address, domain name, etc. the
    certificate can be associated with
- Certificate Authority (CA) flag
- and more

This series will not dive into the details of these usages. However, it
is essential to be aware of them and that they can affect the roles a
certificate can fulfill.

#### Signatures

The signature section of a certificate is a list of signatures from
other entities that trust this certificate. A certificate that signs
itself is a "self-signed certificate." Self-signed certificates must be
individually trusted as no other certificate has expressed trust in it
by signing it. Self-signed certificates are sometimes used for testing
purposes as they are easy to create. They are also used as Root
Certificate Authorities (root CAs).

Each signature on a certificate is the result of taking the contents of
the certificate (without signatures), one-way hashing it, and then
encrypting the hash with the signator's private key. The result is
appended to the end of the signature list. During this process, the
public certificate moves between systems to be signed.

The movement of the public certificate between systems is facilitated by
Certificate Signing Requests (CSRs). CSRs can be transmitted
electronically as files or as a data stream to the signer. CSRs contain
only the public information of a certificate and a signature from the
certificate's private key. Since CSRs only contain public information,
they are not considered sensitive. The signature in a CSR allows the
signer to verify that the CSR is from the subject specified in the CSR.
If the signature is valid, the signator processes the CSR, and the
result is a newly minted certificate with an additional signature.

### Conclusion

Certificates are keys, usually public ones, with additional metadata
that adds conventions and restrictions around certificate usages. They
provide a place for signatures to resides and, through CSRs, provide a
vehicle to request additional signatures. Certificates are useful
because they package all of these concerns into a neat single file. In
[part four](./part-04.certificate-authorities-and-chains-of-trust.md), we
will explore how to create a formidable chain of trust by linking
multiple certificates together.

---

Written By: Andrew Martinez  
June 2020
