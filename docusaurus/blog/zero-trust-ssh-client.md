---
title: "Zero Trust *ssh.Client"
seoTitle: "Zero Trust SSH Client Explained"
seoDescription: "Learn how to implement a zero trust ssh client using OpenZiti and Go for enhanced security and simplicity"
date: 2024-09-09T00:09:12Z
cuid: cm0u8wknc000109mk6xivbmlq
slug: zero-trust-sshclient
authors: [ClintDovholuk]
image: /blogs/openziti/v1725370192508/92d59b16-3273-4213-9918-01a0dc5ba343.png
tags: 
  - golang
  - ssh
  - zero-trust
  - openziti

---

A few years ago, the [OpenZiti project](https://github.com/openziti/ziti) developed and published two client tools to 
make ssh and scp available over an OpenZiti overlay network without requiring the sshd port to be exposed to the 
internet. If interested, read the original posts [about zssh](https://blog.openziti.io/zitifying-ssh) and 
[zscp](https://blog.openziti.io/zitifying-scp). Continuing with the belief that security-related code should be open 
source and auditable, the project is [available on GitHub](https://github.com/openziti-test-kitchen/zssh).

<!-- truncate -->

![](/blogs/openziti/v1725040827487/7810a66b-c739-43d9-b7a8-fd607adb04e6.gif)

The [OpenZiti](https://openziti.io/docs/learn/introduction/) project provides SDKs that developers can use to create secure connections. The `zssh` client demonstrates that adopting an OpenZiti SDK into an application is no harder than developing any application that uses traditional IP-based, underlay connectivity.

Secondly, though uncommon, there are still vulnerabilities found in `ssh`. Just this year (2024) [RegreSSHion](https://en.wikipedia.org/wiki/RegreSSHion) was discovered and was given a staggering [CVSS score](https://www.first.org/cvss/) of 9.8. Scores greater than 9 are generally deemed a "patch this as soon as possible" type of CVE. Yes, today's `ssh` clients are incredibly robust, but if it's easy to remove a substantial portion of attackers from attacking a service by using a zero trust overlay network like OpenZiti, why wouldn't you?

## Using `*ssh.Client`

The go ecosystem provides extended packages from the `golang.org/x/*` modules. One of these modules is `golang.org/x/crypto`. Within this module, there is an `ssh` package that provides everything needed to make a functional ssh client. In there is `ssh.Client`, the main thing you'll interact with. This struct, along with `ssh.NewClientConn` and the Golang standard library, provides all the functionality needed to create a simple ssh client.

Shown below is all the code needed to make a very contrived ssh example. Any errors are ignored, and all values are hard-coded or expected as arguments to the program to keep the example small. In total, there are fewer than 30 total lines. Hopefully, the example is straightforward enough to understand.

```go
package main

import (
	"golang.org/x/crypto/ssh"
	"os"
)

func main() {
	key, _ := os.ReadFile(os.Args[1])
	signer, _ := ssh.ParsePrivateKey(key)
	config := &ssh.ClientConfig{
		User:            "ubuntu",
		Auth:            []ssh.AuthMethod{ssh.PublicKeys(signer)},
		HostKeyCallback: ssh.InsecureIgnoreHostKey(),
	}
	sshClient, _ := ssh.Dial("tcp", os.Args[2], config)
	defer sshClient.Close()
	session, _ := sshClient.NewSession()
	defer session.Close()
	session.RequestPty("xterm", 80, 40, ssh.TerminalModes{})
	session.Stdout = os.Stdout
	session.Stderr = os.Stderr
	session.Stdin = os.Stdin
	session.Shell()
	session.Wait()
}
```

Try it out! That's really all there is to it. You'll be able to ssh to any machine that uses key-based authentication. Although it's not a robust example, it demonstrates the overall idea and shows off how amazing the go ecosystem can be. Note that `ssh.InsecureIgnoreHostKey` is used for the `HostKeyCallback`, to keep the example short. See [`zssh`'s implementation](https://github.com/openziti-test-kitchen/zssh/blob/main/zsshlib/ssh.go#L471) if interested

## Layering in Zero Trust Connectivity

The Golang standard library is well thought out. The [abstractions in place make it amazing for building applications embedding zero trust](https://blog.openziti.io/go-is-amazing-for-zero-trust). Adapting an application that uses normal IP-based connectivity (like the ssh example shown above that uses "tcp") to use an OpenZiti SDK is generally straightforward. From the example above, a single line needs to be changed: the line that creates the `ssh.Client`. This line:

```go
	sshClient, _ := ssh.Dial("tcp", host, config)
```

Creating the `sshClient` needs to be adapted away from using IP-based underlay networking. Instead of "tcp" and "remote-machine-name:22", it needs to use a zero trust connection provided by the OpenZiti Golang SDK. Below is a simplified function that uses an OpenZiti identity file to create an OpenZiti context and dial an OpenZiti service, creating a Golang `net.Conn` that can be used to create an `ssh.Client`. Again, the example omits error handling and robustness for simplicity's sake, and looks like this:

```go
func obtainZitiConn() net.Conn {
	cfg, _ := ziti.NewConfigFromFile(os.Args[3])
	ctx, _ := ziti.NewContext(cfg)
	dialOptions := &ziti.DialOptions{
		Identity:       host,
	}
	c, _ := ctx.DialWithOptions("zsshSvc", dialOptions)
	return c
}
```

With the IP-based underlay `net.Conn` connection replaced with a zero trust connection, an `ssh.Client` can be created by replacing the call to `ssh.Dial`, and instead using a call to `ssh.NewClientConn` combined with a call to `ssh.NewClient`. With the `ssh.Dial` line adapted, it looks like this:

```go
	//adapted sshClient, _ := ssh.Dial("tcp", host, config)
	c, chans, reqs, _ := ssh.NewClientConn(obtainZitiConn(), "", config)
	sshClient := ssh.NewClient(c, chans, reqs)
```

Everything else in the example remains identical; these are the only lines that need to change! The full source for `zssh` is available on GitHub at [https://github.com/openziti-test-kitchen/zssh](https://github.com/openziti-test-kitchen/zssh). You'll find the examples shown above in that repo as individual, compilable go files available in [the `example` folder](https://github.com/openziti-test-kitchen/zssh/tree/main/zssh/example).

If you're interested in `zssh`, the OpenZiti project and zero trust in general, check out [the next article](https://blog.openziti.io/multifactor-zero-trust-ssh). It focuses on using `zssh` and using OpenZiti's OIDC-based authentication mechanisms and uses [Keycloak](https://www.keycloak.org/) for federated authentication to GitHub or Google.

## **Share the Project**

![](/blogs/openziti/v1702330572628/7bb2b76c-af3f-45c6-83ab-d519f183024d.png?auto=compress,format&format=webp)

If you find this interesting, please consider [**starring the projects on GitHub**](https://github.com/openziti/ziti/). It really does help to support the project! And if you haven't seen it yet, check out [**https://zrok.io**](https://github.com/openziti/ziti/). It's a totally free sharing platform built on OpenZiti and uses the OpenZiti Golang SDK and is also [**all open source!**](https://github.com/openziti/zrok/)

Tell us how you're using OpenZiti on [**X <s>twitter</s>**](https://twitter.com/openziti), [**reddit**](https://www.reddit.com/r/openziti/), or over at our [**Discourse**](https://openziti.discourse.group/). Or, if you prefer, check out [**our content on YouTube**](https://youtube.com/openziti) if that's more your speed. Regardless of how, we'd love to hear from you.
