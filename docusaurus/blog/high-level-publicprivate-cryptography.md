---
slug: high-level-publicprivate-cryptography
title: "High-Level Public/Private Cryptography"
authors: [AndrewMartinez]
date: 2022-10-19
tags:
  - cryptography
  - public key
  - security
---
# High-Level Public/Private Cryptography

I find myself writing this high-level overview of public/private key cryptography often. Sometimes I even call it "an overview of asymmetric encryption." It depends on my mood. Rather than hunt for a simple overview and fail to find one I like, I created this. An article that I can control and point to in the future. Welcome. This is my high-level overview of public-private key cryptography.

# Public Private Key Cryptography

Public Private Key cryptography is based on math. It allows two huge numbers to work in tandem. To make them work in tandem, we must know some information about what type of cryptography is in use (RSA, EC) and then additional parameters that are specific to that type. One of those numbers represents the public key, and the other is the private key. Both keys can encrypt data that only the other key can decrypt.

The public key is meant to be shared, it is not secret. The private key is highly secret and is not meant to be shared. Private keys are sometimes stored in hardware to make them safer from operating system and software attacks. 

Sharing the public key means that anyone can send encrypted data to the private key holder and only they will be able to decrypt it. This functionality is the basis of TLS that powers HTTPS. It is used for a client to send an encrypted second key that only the target server will have and is then used to send responses to the client that no one else can read.

The private key can be used to encrypt data that any holder of the public key can decrypt. This seems useless from a data privacy standpoint, but it does something else that is vitally important. Any data decrypted by the public key must have been encrypted with the private key. This means we know who sent the data with a high degree of certainty. This is the basis of "signing data." In scenarios where signing large amounts of data is necessary, rather than encrypting the entire data payload, we take a hash of the data and encrypt that, and include it with the original data.

Hashing data makes a statistically unique fingerprint. Changing even one bit in the data means will generate a different hash. Hashing allows us to deterministically generate fingerprints that are smaller than the original data. The algorithm to sign data is to hash the data into a fingerprint and then encrypt the fingerprint with a private key to generate a signature. To verify a signature, the verifier hashes the data into a fingerprint. That fingerprint is compared to the value of the decrypted signature. If the values match, the data was sent by the private key holder, and the data wasn't changed.

Two examples of where signatures are used is in JWTs and x509 certificates. They are signed documents - they include data and a signature. Verifying the signature ensures the authenticity and author of the data. And that's it!