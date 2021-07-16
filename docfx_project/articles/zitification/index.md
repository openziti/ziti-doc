# Zitification

"Zitification" or "zitifying" is the act of taking an application and incorporating a Ziti SDK into that application.
Once an application has a Ziti SDK incorporated into it, that application can now access network resources securely from
anywhere in the world provided that the computer has internet access: NO VPN NEEDED, NO ADDITIONAL SOFTWARE NEEDED.

Integrating a Ziti SDK into your application and enrolling the application itself into a Ziti Network provides you
with _tremendous_ additional security. By using the Ziti SDK to access remote resources, your application will become _
IMMUNE_ to classic [ransomware attacks](https://netfoundry.io/ztna-ransomware/) of land, expand/multiply, destroy. An
application using a [Ziti Network](https://openziti.github.io/ziti/overview.html#overview-of-a-ziti-network)
configured with a truly zero-trust mindset will be impervious to the "expand/multiply" phases of
classic [ransomware attacks](https://netfoundry.io/ztna-ransomware/). As recent events have shown, it's probably not a
case of if your application will be attacked, but when.

In these posts we're going to explore how common applications can be "zitified". The first application we are going to
focus on will be `ssh` and it's corollary `scp`. At first, you might think, "why even bother" zitifying (of all
things) `ssh` and `scp`? These applications are vital to system administration, and we have been using `ssh` and
`scp` "safely" on the internet for years. Hopefully your now interested enough to find out in  
the first post: [zitifying ssh]( ./ssh/zitifying-ssh.md)


