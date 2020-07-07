# Bootstrapping Trust

## Part 2: A Primer On Public-Key Cryptography

If you have read through the entire series up to here, welcome! If you
have not, please consider reading the whole series:

- [Part 1: Encryption Everywhere](./part-01.encryption-everywhere.md)
- [Part 2: A Primer On Public-Key Cryptography](./part-02.a-primer-on-public-key-cryptography.md)
- [Part 3: Certificates](./part-03.certificates.md)
- [Part 4: Certificate Authorities & Chains Of Trust](./part-04.certificate-authorities-and-chains-of-trust.md)
- [Part 5: Bootstrapping Trust](./part-05.bootstrapping-trust.md)

It isn't easy to talk about bootstrapping trust without covering the
basics of public-key cryptography. The reader may skip this article if
the concepts of encryption, signing, and public/private keys are
familiar. However, if not, I implore that you bear the brunt of this
article as later parts will heavily rely on it.

If you wish, you can dive into the mathematics behind it to prove it to
yourself, but I promise, no math here. When necessary, I will wave my
hands at it, point into the distance, and let the reader journey out.

### Keys

Keys are blobs of data containing rather large numbers. They can be
stored anywhere data can be stored, but are commonly stored in files.
Some secure environments store them in Hardware Security Modules (HSM).
One example of that is mobile devices. A set of public and private keys
is referred to as a "key set" or "key pair."

With public-key cryptography, there is at least one private key
(sometimes called a secret key). There may be more, and each private key
can have a specific purpose. However, there must be at least one. Paired
with that private key is a public key. The two keys are mathematically
entangled, given a particular function and its parameters. Today, those
functions and parameters are generally elliptical curves and are the
basis of a "trapdoor function." Trapdoor functions are attractive to the
cryptographically inclined as they make it easy to encrypt with one key
of a key pair and decrypt with the other.

These two keys have some impressive capabilities. Firstly, it is not
possible to derive one from the other. This allows the public key to be
handed out freely without compromising the private key. Also, both keys
can generate encrypted data that the other key can decrypt. More
clearly:

1. Anyone with the public key can encrypt data only the private key
   holder can decrypt
2. Anyone with the public key can decrypt data from the private key
   holder

Number one can succinctly be called "Public Key Encryption" and number
two "Private Key Encryption." This article explores the merits of both.

#### Public Key Encryption

From the list above, number one is what most people think of as
"encryption." It is "secure" as it allows anyone with the widely
available public key to send messages only the private key holder can
read. This property ensures that communication from the public key
holder to the private key holder is being handled exclusively by the
intended target, the private key holder.

There is quite a bit of pressure to keep the private key extremely safe.
Whoever holds the private key, has a guaranteed identity that is tied to
and verifiable by the public key. It is verifiable because if one can
use the public key to encrypt data, only the private key holder can
decrypt it. This fact means that data can be encrypted and sent that
coordinates on an additional secret. Since only the private key holder
can decrypt the data to see this second level secret, future
communication can use the new secret to encrypted and verify traffic in
both directions. This additional exchange is roughly how part of the TLS
negotiation works for HTTPs. TLS, and by proxy HTTPS, use other
technologies and strategies to be an incredible security proposition.

#### Private Key Encryption

For private key encryption, the same principles as with public key
encryption with the roles reversed. The private key encrypts data only
the public key can decrypt. On the surface, this seems absurd. When the
server encrypts data with its private key, the public key can decrypt
it. The public key is not protected and expected to be widely available.
It seems as if private key encryption is nearly useless as everyone can
read it!

Except it isn't. Private key encryption verifies the identity of the
private key holder. The public key cannot interact with anyone else.
Additionally, this property allows us to generate encrypted data that
could only have come from the private key holder. If that data happens
to be small and describe another document, we call that a "digital
signature" or "signature" for short.

### Digital Signatures

Digital signatures are similar to handwritten ones used to sign legal
documents and checkbooks, but with a significant advantage. They
validate a document has not been altered since it was signed. With
today's computer's graphical abilities, the nefarious can forge images
and handwritten signatures. That puts handwritten signatures at a
significant disadvantage. So how does this work?

The data that will be signed can be anything. What it represents is not
important. It can be text, JSON, an image, a PDF, or anything at all!
That data processed by a one-way hashing algorithm, such as SHA-256.
This process is idempotent, meaning running it repeatedly on the same
data results and results in the same output. The output of this process
is a hash, a string of characters that uniquely identifies the input
data. With sufficiently large input data, the hash is much shorter than
the input data as the hash size is usually fixed length.

For example, here is the Ziti logo:

![Image of the Ziti logo](./images/ziti.png)

This logo's file can be hashed using SHA-256 via the `sha256sum` command
commonly found on Linux.

```
$> sha256sum ziti.png
c3a6681cc81f9c0fa44b3e2921495882c55f0a86c54cd60ee0fdc7d200ad26db  ziti.png
```

That long string "c3a....6db" is the hash of that file! The string is 64
characters long because it is a hex representation of the signature. The
signature only needs 4 bits per character, so the result is: 64 x 4 =
256, which is where SHA-256 gets its name.

The hash itself is not encryption. It is "hashing." Hashing of this
nature is not reversible, and it is impracticable to have two similar
sets of data that have the same function that produces the same hash. In
essence, the hash uniquely represents the data: all of it! Changing even
a single character would generate a different hash.

Next, the private key holder encrypts the hash with the private key to
generate the signature. This process provides the following truths when
working with the signature:

- the private key is the only key capable of producing its signature of
  the data
- the public key can validate the signature given the data and hashing
  algorithm used

Verifying a signature a straightforward process:

- Use the public key to decrypt the signature of the data to reveal the
  original hash
- Use the hashing algorithm that was used initially on the data,
  recreate the hash independently
- Compare the two hashes, and if they are the same the signature is
  valid

Signing data is incredibly powerful. It allows a private key holder to
state that data was approved by them and not altered. It is also
publicly verifiable. This allows many decentralized approaches to
sharing data that can have its source and content verified.

JSON Web Tokens (JWTs) are a prevalent form of bearer token. They are a
document that is signed by a trusted authentication system and contain
data that states the client's identity. This client can then present
that JWT to any system which can then verify that the contents are valid
and from a trusted identity provider as long as the public key is
available. The bearer tokens can also contain claims which grant the
bearer rights on a system.

---
Written By: Andrew Martinez
June 2020