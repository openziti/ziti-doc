# Hardware Security Modules (HSM)

A hardware security module (HSM) is a physical piece of equipment which is designed specifically to protect cryptographic keys
and aid with cryptographical processing. HSMs are designed to manage sensitive information and are generally able to be
connected and disconnected from a computer trying to use the HSM.

## Why an HSM

Without a doubt the biggest benefit of an HSM is that it is a physical piece of hardware. This means that any cryptographic keys
protecting data is stored in the HSM and those keys are able to be removed from any given device which had the HSM
attached. Because these keys are not kept as files on a computer and are instead a physical piece of equipment attached
to the computer it is more secure because you can be sure that they only computer with the relevant key is one with the
HSM attached to it.

Another benefit of HSMs is that they are focused on security. The keys stored inside of many if not all HSMs are
designed to not be able to be exported. This means that there's no chance for these keys to be extracted remotely and
used outside of the HSM itself, further increasing the security of these important keys.

## Enabling a Ziti Endpoint Using an HSM

Enabling a Ziti endpoint to utilize an HSM is straight forward but does require a bit of technical understanding. We
have provided 