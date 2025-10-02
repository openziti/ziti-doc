---
title: "zrok VPN"
date: 2024-05-21T15:17:50Z
cuid: clwgjhize000d0ck18y703n52
slug: zrok-vpn
authors: [EugeneKobyakov]
image: "@site/blogs/openziti/v1716212137599/451cee0f-8d37-4ab2-8548-8a62b42656af.png"
imageDark: "@site/blogs/openziti/v1716212137599/451cee0f-8d37-4ab2-8548-8a62b42656af.png"
tags: 
  - zerotrust
  - zrok

---

The latest version of [`zrok`](https://zrok.io/) has a new capability -- host-to-host VPN tunnel.

<!-- truncate -->

## TL;DR version

On VPN *host*

```plaintext
$ sudo -E zrok share private --headless --backend-mode vpn
[   0.542]    INFO sdk-golang/ziti.(*listenerManager).createSessionWithBackoff: {session token=[589d443c-f59d-4fc8-8c48-76609b7fb402]} new service session
[   0.705]    INFO main.(*sharePrivateCommand).run: allow other to access your share with the following command:
zrok access private 3rq7torslq3n
[   0.705]    INFO zrok/endpoints/vpn.(*Backend).Run: started
```

On VPN *client*

```plaintext
$ sudo -E zrok access private --headless 3rq7torslq3n
[   0.201]    INFO main.(*accessPrivateCommand).run: allocated frontend '50B5hloP1s1X'
[   0.662]    INFO main.(*accessPrivateCommand).run: access the zrok share at the following endpoint: VPN:
[   0.662]    INFO main.(*accessPrivateCommand).run: 10.122.0.1 -> CONNECTED Welcome to zrok VPN
[   0.662]    INFO zrok/endpoints/vpn.(*Frontend).Run: connected:Welcome to zrok VPN
```

At this point your VPN host and client are connect with VPN -- you can access host resources via host IP address (10.122.0.1), client IP will be from 10.122.0.0/16 block.

## Longer Read

If you just want to learn more and what options are available the best place to start is on zrok [doc page](https://docs.zrok.io/docs/guides/vpn/). Also check out a ZitiTV episode where I discuss zrok VPN with the host, Clint.

%[https://www.youtube.com/live/OG9z1_8FbDg?si=FNXqs8SYAMPMLggn] 

## Why? What took so long?

Both fair questions, so a little background. We ([OpenZiti](https://openziti.io) project) and me personally do not consider VPN solutions particularly zero-trust-worthy. There a number of reasons for that:

* VPNs operate at the network packet level not application level. This means that they will forward any matching packet into the private network whether or not there is a legitimate target for it.
    
* VPNs have no concept of application access control -- meaning everyone connecting to a private network gets the same access to network resources.
    

For those reasons we built OpenZiti on the foundation of [strong zero-trust principals](https://openziti.io/docs/learn/introduction/features).

...But people still *want* an easy way of remote access to home or office with *good enough* security that VPN gives them.

So, you want a VPN I'll build you a VPN. How hard can it really be??

## Enter zrok

If you have not yet tried or heard about zrok, I invite you to read the [zrok series](./tags/zrok) on this very blog.

The reasons we chose to implement VPN as part of [zrok](https://zrok.io/) are the following:

* super easy to start and use
    
* well established share/access pattern: both side are in sync on what mode is used
    
* easy to add another `backend` mode
    

## VPN implementation

Under the hood, the zrok framework already has all the necessary components for creating shares, accessing them, and establishing connections between the `access` and `share` sides. So all I needed to do to implement VPN mode:

* open virtual network device (tun)
    
* configure network addresses and routes
    
* read packets and forward them
    
* ... Wait ... that was it? Took me a few hours. What was the fuss about?
    

## zrok VPN future

The initial zrok VPN release is somewhat simple and minimal. It currently provides only a host-to-host VPN functionality. We have some ideas how we want to continue improving it: better routing support, DNS, VPN mesh, mobile client -- are just some of them.

Please give it a try and let us know how you like it, what features you want to see, and, of course, any bugs that you encounter.

* Reach us on [Discourse](https://openziti.discourse.group/)
    
* Check out (and star!) our repos: [zrok](https://github.com/openziti/zrok), [ziti](https://github.com/openziti/ziti), and [more](https://github.com/openziti)