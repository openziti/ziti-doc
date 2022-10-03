---
sidebar_position: 3
id: hsmIndex
---

# Hardware Security Modules (HSM) - PKCS11

A hardware security module (HSM) is a physical piece of equipment which is designed specifically to protect cryptographic keys
and aid with cryptographical processing. HSMs are designed to manage sensitive information and are generally able to be
connected and disconnected from a computer trying to use the HSM.

## Why an HSM

Without a doubt the biggest benefit of an HSM is that it is a physical piece of hardware. This means that any cryptographic keys
protecting data is stored in the HSM and those keys are able to be removed from any given device which had the HSM
attached. Because these keys are not kept as files on a computer but are instead stored inside a physical piece of
equipment attached to the computer it is more secure since there are no files for an attacker to find and copy. With an
HSM you can be sure that they only computer with the relevant key is the one with the HSM attached to it.

Another benefit of HSMs is that they are focused on security. The keys stored inside of many if not all HSMs are
designed to not be able to be exported. This means that there's no chance for these keys to be extracted remotely and
used outside of the HSM itself, further increasing the security of these important keys.

## Enabling a Ziti Endpoint Using an HSM

Enabling a Ziti endpoint to utilize an HSM is straight forward but does require a bit of technical understanding. We
have provided a couple of guides on how to enable an HSM with Ziti. The Ziti SDKs all interact with HSMs which support
and provide a PKCS#11 library. PKCS#11 is a specification that outlines the programming interface software can use to
interact with cryptographic hardware such as smart cards or HSMs.

## Quickstarts

We have included a couple of quickstarts illustrating two different PKCS#11 drivers to help with understanding.

You will want to go to [the OpenSC Project](https://github.com/OpenSC/OpenSC/wiki) as it is what provides the
`pkcs11-tool` which is used to interact with the HSMs.

The [first quickstart](softhsm) is based on [softhsm](https://www.opendnssec.org/softhsm/). This one focuses on software that
provides an *emulated* HSM. This is useful for learning and understandin but it is not an actual HSM. Being software it
doesn't have the important benefit of being a physical device but it does have one substantial advantage; it's entirely
free.

The [second quickstart](./yubikey) uses an actual physical device - a [Yubico](https://www.yubico.com/) Yubikey. The specific key we
used is a [Yubikey 5 nfc](https://www.yubico.com/product/yubikey-5-nfc).
