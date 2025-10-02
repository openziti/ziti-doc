---
title: "Securing Ziti Identities with HSM/TPM"
date: 2025-02-26T15:27:28Z
cuid: cm7m2kag7000009l5ahicajw9
slug: securing-ziti-identities-with-hsmtpm
authors: [EugeneKobyakov]
image: "@site/blogs/openziti/v1740433372226/36a74b0f-3dfc-496f-8907-00e6fb0aabfd.jpeg"
tags: 
  - security
  - hardware
  - zerotrust
  - hsm
  - tpm

---

Regular readers of this blog know that OpenZiti provides secure overlay networking between Ziti identities. 
You can improve security of your OpenZiti edge identities by using hardware-based private keys. 
This guide provides step-by-step instructions on integrating hardware security with OpenZiti. 
It uses Linux built-in TPM as a hardware security device. Similar steps will also work with other HSM devices.

<!-- truncate -->

## This is How I (en)Roll

On my Linux(Ubuntu) laptop I check that the kernel detected TPM hardware and created a device for it.

```bash
ziggy@hermes:~$ ls -l /dev/tpm*
crw-rw---- 1 tss root  10,   224 Apr 26 14:41 /dev/tpm0
crw-rw---- 1 tss tss  253, 65536 Apr 26 14:41 /dev/tpmrm0
```

Device `/dev/tpmrm0` is there, so I can proceed.

Add my user to the `tss` group so that the TPM device can be accessed. You will probably need to restart your login shell for that to take effect, check your groups with `id` command.

```bash
ziggy@hermes:~$ sudo usermod -G tss -a ziggy
```

Install some useful software packages to interact with the TPM device

* `libtpm2-pkcs11-tools` - includes `tmp2_ptool` to initialize PKCS#11 token on TPM device
    
* `libtpm2-pkcs11-1` - TPM PKCS#11 library
    
* `opensc` - includes `pkcs11-tool` for interacting with PKCS#11 token. This is not needed for OpenZiti enrollment but is useful for inspecting tokens
    

```bash
ziggy@hermes:~$ sudo apt install libtpm2-pkcs11-tools libtpm2-pkcs11-1 opensc
```

Now that I have access to the device and the needed software I can initialize the token and test PKCS#11 driver access to it

```bash
ziggy@hermes:~$ tpm2_ptool init
action: Created
id: 1

ziggy@hermes:~$ tpm2_ptool addtoken --pid 1 --sopin 1111 --userpin ziggy1 --label ziggy-tpm

ziggy@hermes:~/ziti$ pkcs11-tool --module /usr/lib/x86_64-linux-gnu/pkcs11/libtpm2_pkcs11.so --list-slots
WARNING: Getting tokens from fapi backend failed.
Available slots:
Slot 0 (0x1): ziggy-tpm
  token label        : ziggy-tpm
  token manufacturer : Infineon
  token model        : SLB9665
  token flags        : login required, rng, token initialized, PIN initialized
  hardware version   : 1.16
  firmware version   : 5.62
  serial num         : 0000000000000000
  pin min/max        : 0/128
Slot 1 (0x2): 
  token state:   uninitialized
```

Note: fapi backend warning can be [ignored](https://github.com/tpm2-software/tpm2-pkcs11/issues/655#issuecomment-781500908).

To enroll I need to get an enrollment token from my Ziti controller. Once I have that I can enroll. Let’s enroll with `ziti-edge-tunnel`

```bash

# enroll identity with ziti-edge-tunnel
ziggy@hermes:~$ ziti-edge-tunnel enroll -j ./ziggy.jwt -i ziggy.json -k 'pkcs11:///usr/lib/x86_64-linux-gnu/pkcs11/libtpm2_pkcs11.so?label=ziggy-key&pin=ziggy1'
(1676722)[        0.000]    INFO ziti-sdk:utils.c:198 ziti_log_set_level() set log level: root=3/INFO
(1676722)[        0.000]    INFO ziti-sdk:utils.c:167 ziti_log_init() Ziti C SDK version 1.5.0 @ga39db85(HEAD) starting at (2025-02-24T15:21:31.292)
(1676722)[        0.000]    INFO ziti-sdk:ziti_enroll.c:112 ziti_enroll() Ziti C SDK version 1.5.0 @ga39db85(HEAD) starting enrollment at (2025-02-24T15:21:31.294)
(1676722)[        0.000]    INFO ziti-sdk:ziti_enroll.c:221 start_enrollment() pkcs11 key not found. trying to generate
```

ZIti identity is stores in the JSON file -- `ziggy.json` in my case. Let take a look

```json
{
  "ztAPI": "https://<my-controller-address>:443",
  "id": {
    "cert": "-----BEGIN CERTIFICATE-----....",
    "key": "pkcs11:///usr/lib/x86_64-linux-gnu/libtpm2_pkcs11.so?label=ziggy-key&pin=ziggy1",
    "ca": "-----BEGIN CERTIFICATE-----...."
   }
}
```

As you can see the .id.key is referencing the private key stored in my laptop's TPM hardware. I can inspect it using `pkcs11-tool`

```bash
ziggy@hermes:~$ pkcs11-tool --module /usr/lib/x86_64-linux-gnu/pkcs11/libtpm2_pkcs11.so --list-objects --pin ziggy1          1 ↵
Using slot 0 with a present token (0x1)
Public Key Object; EC  EC_POINT 384 bits
  EC_POINT:   04610442fa885e120e9c63227aa7c53aeb84a52400264f3452fcf4dc4dbf4ade9ca46e7e15c4d37cc7a317edd860887ccd5746eea70cdea1d106b36b59297ecb93d43c57f4e8aef7029fa55f52cd740292d8de92fbce35c7788d3cc00f528cac2d0e4d
  EC_PARAMS:  06052b81040022 (OID 1.3.132.0.34)
  label:      ziggy-key
  ID:         dad9d0f20cc1d9ec
  Usage:      encrypt, verify, wrap
  Access:     local
Private Key Object; EC
  label:      ziggy-key
  ID:         dad9d0f20cc1d9ec
  Usage:      decrypt, sign, unwrap
  Access:     sensitive, always sensitive, never extractable, local
  Allowed mechanisms: ECDSA,ECDSA-SHA1,ECDSA-SHA256,ECDSA-SHA384,ECDSA-SHA512
```

As you can see my TPM token `ziggy-tpm` now has two objects private, and public keys with same label and id. OpenZiti SDK will use that hardware key to provide identity.

Now I can start `ziti-edge-tunnel` with that identity:

```plaintext
ziggy@hermes:~$ sudo -E ziti-edge-tunnel run -i ziggy.json
```

Note: `-E` flag is required since I initialized TPM token as user `ziggy` and there are some support files created in the user’s `$HOME` directory.
