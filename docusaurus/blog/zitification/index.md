# Zitification

"Zitification" or "zitifying" is the act of taking an application and incorporating a Ziti SDK into that application. Once an
application has a Ziti SDK incorporated into it, that application can now access network resources securely from anywhere in
the world provided that the computer has internet access: NO VPN NEEDED, NO ADDITIONAL SOFTWARE NEEDED.

Integrating a Ziti SDK into your application and enrolling the application itself into a Ziti Network provides you with *
tremendous* additional security. An application using a [Ziti Network][2] configured with a truly zero-trust mindset will be
**IMMUNE** to the "expand/multiply" phases of classic [ransomware attacks][1]. As recent events have shown, it's probably not
a case of if your application will be attacked, but when.

In these posts we're going to explore how common applications can be "zitified". The first application we are going to focus
on will be `ssh` and it's corollary `scp`. At first, you might think, "why even bother" zitifying (of all things) `ssh`
and `scp`? These applications are vital to system administration, and we have been using `ssh` and
`scp` "safely" on the internet for years. Hopefully you're now interested enough to find out in the first post:
[zitifying ssh][3]

If you'd prefer to read about other zitifications, a running list of zitified apps will be updated below:

* [ssh->zssh][3]
* [scp->zscp][4]
* [Kubernetes cluster manager - kubectl][5]

[1]: https://netfoundry.io/ztna-ransomware/
[2]: /docs/introduction/intro#overview-of-a-ziti-network
[3]: /blog/zitification/zitifying-ssh/
[4]: /blog/zitification/zitifying-scp/
[5]: /blog/zitification/kubernetes/