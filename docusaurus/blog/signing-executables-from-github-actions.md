---
title: "Signing Executables From GitHub Actions"
date: 2024-05-15T02:28:38Z
cuid: clw77d8aa00070ammccc55jhc
slug: signing-executables-from-github-actions
authors: [ClintDovholuk]
image: /blogs/openziti/v1715610928648/e1bf8444-484c-440c-ad00-4669c493ff94.jpeg
tags: 
  - digital-signature
  - aws-kms
  - githubactions
  - signtool

---

Hopefully, by now, we all know that we shouldn't download and run random, untrusted executables from the internet. Users want to feel good that the code they are executing is authentic and free from malware. [Windows Defender](https://en.wikipedia.org/wiki/Microsoft_Defender_Antivirus) is one of the better things Microsoft has done to keep the world safe. Defender is a free anti-virus application that scans executables for malicious code. Often criticized for its intrusiveness (among other reasons), it's still a vital tool for millions of Windows users around the globe. While it's not the only anti-virus/endpoint protection tool around, it comes with Windows by default so making sure it doesn't tell your users your application is suspicious by popping up some scary modal dialog is important!

[Signing an executable](https://en.wikipedia.org/wiki/Code_signing) is a cryptographic process that embeds information into the executable, allowing users to verify the software's author and ensure that the software has not been modified/tampered with after the author created and published it. Once signed, inside the file, there will be one or more digital signatures that contain an encrypted version of the file's hash. For a Windows executable, [calculating the file's hash](https://github.com/openziti/desktop-edge-win/blob/release-next/ZitiUpdateService/checkers/PeFile/SignedFileValidator.cs) is [too complex to outline here](https://learn.microsoft.com/en-us/windows/win32/debug/pe-format), but the important point is that one must be able to calculate the same hash for a given file before and after signatures are added, which the PE32 format accounts for.

> using an EV cert with an online build tool like GitHub can be a bit of a pain

The easiest, fastest, and, of course, most expensive way to make it so Windows Defender SmartScreen doesn't tell your users the executable is questionable, is to sign your executables using an [extended validation certificate (EV)](https://en.wikipedia.org/wiki/Extended_Validation_Certificate). You can save money and develop your reputation organically through users running your executable, but until the needed reputation is established, new users will be greeted by a scary modal from Windows. Using an EV cert will immediately establish the necessary trust. The OpenZiti project is sponsored by NetFoundry, so we are fortunate to have the means to purchase one of these EV certificates and use it for signing but using an EV cert with an online build tool like GitHub can be a bit of a pain.

Starting June 1, 2023, you are now required to store your primary key inside a [FIPS 140 Level 2](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.140-2.pdf) module. A level 2 module is one that builds on the level 1 requirements by adding the need for additional security measures such as tamper-evident seals or coatings. As of May 2024, GitHub secrets do not meet this requirement. Previously, we had placed the key and certificate into GitHub as secrets and pulled them out as needed to sign executables but with the new rules, this is no longer adequate. We had to upgrade the mechanism we use to sign executables. Looking around the internet, for a long time, the only cloud-friendly tooling example with something like GitHub Actions I could find was a [great blog from Sudara](https://melatonin.dev/blog/how-to-code-sign-windows-installers-with-an-ev-cert-on-github-actions/), but it leveraged Azure exclusively and required a different tool. I wanted to use AWS since that's where all our dev-related tooling was already. During my search, I discovered that [AWS KMS is FIPS-140 Level 3 certified](https://aws.amazon.com/about-aws/whats-new/2023/05/aws-kms-hsm-fips-security-level-3/). Since it's level 3 is a superset of level 2, we can use it for EV Certificate signing.

## Microsoft SignTool

Microsoft provides a tool to sign executables called `signtool`. Getting Signtool is straightforward. It is included with the Microsoft Windows Software Development Kit but it's also installed by default when you install Visual Studio. If you have Visual Studio installed, you'll have `signtool`.

> you no longer need to keep the private key on the machine running signtool

At some point in the past, signtool [was upgraded](https://learn.microsoft.com/en-us/windows/win32/seccrypto/signtool#sign-command-options) to allow for the digest to be generated out-of-band from the overall signing process. Signing the digest out-of-band makes the overall process of signing an executable only slightly more complex, but has a big benefit. With this process, **you will no longer need to keep the private key on the machine running signtool**. This is *particularly* valuable when signing files from a cloud CI/CD pipeline like GitHub's Actions. Recently, I upgraded the process of how the [OpenZiti project signs](https://github.com/openziti/desktop-edge-win/blob/release-next/Installer/build.ps1#L10-L33) the [Ziti Desktop Edge for Windows](https://github.com/openziti/desktop-edge-win/releases/tag/2.1.16) to leverage detached digest signing.

![](/blogs/openziti/v1715622984201/de8bf432-8f2e-412c-b200-a3125c7d39bd.jpeg)

### AWS KMS Prerequisites

To implement detached digest signing with signtool I needed a few things:

* A private key in AWS KMS
    
* A certificate from our CA (we use [GlobalSign](https://www.globalsign.com/en)) with key usage of "Digital Signature" and enhanced key usage of "Code Signing (1.3.6.1.5.5.7.3.3)".
    
* A new IAM user with access the following permissions so it can list and sign data: "kms:ListKeys", "kms:DescribeKey", "kms:Sign"
    
* Configured the AWS CLI with this new user
    

The first step is to create or import a private key into AWS KMS. With the key in AWS KMS, I had to create a certificate signing request (CSR) using that private key so that I could submit it to our CA (we use [GlobalSign](https://www.globalsign.com/en)) for processing. After going through their vetting process, they created the necessary signing certificate which has the key usage of "Digital Signature" and enhanced key usage of "Code Signing (1.3.6.1.5.5.7.3.3)" I could download and test out.

I also created a new IAM user in AWS with access only to the AWS KMS key. Since I knew I was going to be transferring this process to [a GitHub action](https://github.com/openziti/desktop-edge-win/blob/release-next/.github/workflows/installer.build.yml#L88), I did all my testing with the AWS CLI credentials of this user to ensure once I set the secrets in GitHub, I'd know the process would work.

## Detached Digest Signing With Signtool

With AWS CLI configured for the new user, the private key in AWS KMS, and with the EV signing cert in hand, I was ready to put a process in place to sign the executables built from the action using AWS KMS and signtool.

It really isn't significantly more difficult to use a detached digest signing with signtool but I couldn't find a single guide with examples that outlined the exact process. There are basically three steps you need to complete:

* produce the digest to sign
    
* sign the digest
    
* incorporate the digest into the signature and attach the signature to the file
    

### Producing the Digest

To produce the digest you simply need to run signtool with the `/dg` parameter to indicate you want to emit the digest of the file that needs to be signed. You must also specify `/fd` (the file digest algorithm to use for creating file signatures) and `/f` (the path to the signing certificate). The exact command to generate the digest to be signed looks like this.

```powershell
& "$SIGNTOOL" sign /dg $digestLoc /fd sha256 /f $signingCert $exePath
```

Here you can see the path to signtool is represented with the Powershell variable `$SIGNTOOL`. The `$digestLoc` represents the *directory* you want to emit the digest into. The file name will be the executable name + `.dig`. Don't be confused by that param. Personally, I opted to keep the digest file in the same directory as the executable so they are adjacent to one another. The signing certificate path is specified by the `/f` flag and the final parameter is the path to the executable path you want to sign. This command also creates a `.p7u` file in the `$digestLoc` that is used in the final step.

### Signing the Digest

With the digest generated, next, you need to sign the digest.

```powershell
$tosign = Get-Content "${exePath}.dig" -Raw
$signedData = aws kms sign `
    --message $tosign `
    --message-type DIGEST `
    --signing-algorithm "RSASSA_PKCS1_V1_5_SHA_256" `
    --key-id $env:AWS_KEY_ID `
    --output text `
    --query "Signature"
Set-Content -Path "${exePath}.dig.signed" -Value $signedData
```

The digest file to sign is read into a variable called `$tosign` and is read in using `-Raw` to ensure no spaces nor additional bytes are injected into the digest mistakenly (spaces, newlines, etc). Even one byte will cause the process to fail, as the SHA256 (or whatever algorithm you choose) created will change. This content is provided as the `--message` parameter.

Here we are sending only the digest to AWS KMS to be signed so we **must** specify the `--message-type DIGEST` and since I am using SHA256 in these examples, so I've asked for the corresponding `signing-algorithm`.

Finally, I've used an environment variable injected by [the GitHub action](https://github.com/openziti/desktop-edge-win/blob/release-next/.github/workflows/installer.build.yml#L23) to specify which key is to be used to sign the data (the digest). All this content is then read into the `$signedData` variable and then written to disk as `${exePath}.dig.signed`. This file should be in the same directory as the `.dig` and executable you wish to sign.

### Incorporating the Signed Digest

The last step is to use the signed data file produced in the last step, incorporate it into the signature, and attach the signature to the file.

```powershell
& "$SIGNTOOL" sign /di $digestLoc $exePath
& "$SIGNTOOL" timestamp /tr "http://timestamp.digicert.com" /td sha256 $exePath
```

Notice that to ingest the signed digest into the file you only need to provide the path to the signed digest (and `p7u` file generated in the first step) and the executable itself. When these steps finish, you'll have a signed binary!

![](/blogs/openziti/v1715626991639/0ca65ace-4ee1-4656-b90d-c745eaba593f.png)

It's a good idea to add a timestamp to your signed binary using a Time Stamping Authority (TSA) of your choice. Normally, a digital signature is only considered valid as long as the signing certificate is valid. Once the certificate expires, the signature can no longer be verified. However, if the signature includes a timestamp, it shows that the code was signed while the certificate was still valid, extending the trustworthiness of the signature beyond the certificate's expiration date.

## Summary

Using EV certificates isn't for everyone, it's expensive. However, using an EV cert will gain you instant reputation with Defender and for some people, that price is worth it. Even if you're not using an EV cert, using AWS KMS to sign your binaries has the added benefit of keeping your private key safer. Yes, you still need to give GitHub credentials to list the key and sign data, but if there's a catastrophic bug with GitHub actions, you can feel good that it's impossible to extract the key!

## **Share the Project**

![](/blogs/openziti/v1702330572628/7bb2b76c-af3f-45c6-83ab-d519f183024d.png?auto=compress,format&format=webp)

If you find this interesting, please consider [**starring us on GitHub**](https://github.com/openziti/ziti/). It really does help to support the project! And if you haven't seen it yet, check out [**https://zrok.io**](https://github.com/openziti/ziti/). It's totally free sharing platform built on OpenZiti! It uses the OpenZiti Go SDK since it's a ziti-native application. It's also [**all open source too!**](https://github.com/openziti/zrok/)

Tell us how you're using OpenZiti on [**X <s>twitter</s>**](https://twitter.com/openziti), [**reddit**](https://www.reddit.com/r/openziti/), or over at our [**Discourse**](https://openziti.discourse.group/). Or you prefer, check out [**our content on YouTube**](https://youtube.com/openziti) if that's more your speed. Regardless of how, we'd love to hear from you.
