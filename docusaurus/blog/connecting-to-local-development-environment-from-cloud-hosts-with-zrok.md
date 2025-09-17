---
title: "Connecting to Local Development Environment from Cloud Hosts with zrok"
date: 2023-02-02T03:28:34Z
cuid: cldmgr6yi000309l2af9p25zs
slug: connecting-to-local-development-environment-from-cloud-hosts-with-zrok
authors: [JensAlm]
image: /blogs/openziti/v1675019484328/e1156433-d3b2-4a5d-b709-1679afe76be3.jpeg
tags: 
  - opensource
  - openziti

---

All developers have at some point used cloud-provided compute hosts. It's very easy, it's very convenient, and it's relatively cheap. One problem that you frequently run into is how to use these hosts in local development.

At work, we use cloud-provided hosts extensively and I often need the hosts to connect back to my local environment to read data. One such example is when we use the Salt stack to manage software on the hosts.

## How We Use Salt

Salt ([https://saltproject.io/](https://saltproject.io/)) is an open-source software project for configuration management and remote execution of commands, designed to manage and automate large-scale infrastructure. Salt needs configuration data to execute those commands. In our case, we need data to configure the [OpenZiti](https://github.com/openziti/) software we're installing on the host.  
I often need the cloud host to read this configuration data from my local machine while I'm developing or testing the integration between Salt and our systems.

## Without zrok

For Salt to be able to read its configuration data from my local development machine I had to:

* Get my public IP
    
* Open a port in my firewall
    
* Set up port forwarding
    
* Use the IP in our configuration
    

This is not necessarily difficult but it does take time and it involves configuring your router to allow incoming connections. You also have to remember to remove it or you are potentially risking someone accessing your computer.  
Unless you also have a static IP, it will change quite frequently and you may have to repeat this process quite often. In the case of Salt, that means reconfiguring Salt every time this happens.

## With zrok

zrok will let us skip parts of the setup above. If you haven't already read the [Introducing zrok](https://blog.openziti.io/introducing-zrok) I suggest you do so, it will give a lot more information about the underlying technology.  
Here are the steps we need to do:

* Create a reserved share
    
* Start sharing
    
* Use the generated <mark>domain name</mark> in our configuration
    

Hop over to [https://zrok.io](https://zrok.io) and create an account (it's free!) and download the binaries for your environment.  
In my Salt scenario, I am trying to share the configuration data on a local service running on port 9302. Let's see how we do that with zrok.

First, let's create the share.

```bash
> zrok reserve public http://localhost:9302 --backend-mode proxy
[   0.374]    INFO main.(*reserveCommand).run: your reserved share token is 'u4eh9mnwl4jb'
[   0.374]    INFO main.(*reserveCommand).run: reserved frontend endpoint: https://9iq4zzirypdu.in.staging.zrok.io/
```

This is creating a *reserved* share which means it is permanent. We started this share in *proxy* mode so all traffic is passed through to our backend service.  
This step is only necessary the first time, the share is reserved until it's deleted, and that means it can be shared any time it's needed.

Next, we start sharing. The token `u4eh9mnwl4jb` is our reserved share from the command above.

```bash
> ./zrok share reserved u4eh9mnwl4jb
```

You can now access your hosted service from anywhere with a URL like `https://u4eh9mnwl4jb.in.zrok.io`, including from any cloud-provided host.  
In our Salt use case, this means we configure the Salt master to connect to this URL.

![](/blogs/openziti/v1675096019317/c7851a8a-c71a-4afb-b7e0-087b18991a53.png)

The output in the terminal will show every request routed to your hosted service.  
A simple `ctrl + c` will stop the share and you no longer have anything open for anyone to take advantage of.

Future uses are even simpler. Since it's a domain name based on the token it won't change so the next time you need it, just start the share by executing the second command above. No need to change any configuration or to update anything.

## Conclusion

zrok simplifies local development while also making it more secure. In our scenario Salt can be configured with the public URL from zrok which connects directly to my local development environment using a connection secured by [OpenZiti](https://github.com/openziti/).

Further reading on the technologies involved in this blog:

* Introducing zrok - [https://blog.openziti.io/introducing-zrok](https://blog.openziti.io/introducing-zrok)
    
* OpenZiti - [https://github.com/openziti/](https://github.com/openziti/)
    
* zrok - [https://zrok.io](https://zrok.io)
    
* zrok Getting Started - [https://docs.zrok.io/docs/getting-started](https://docs.zrok.io/docs/getting-started)
    
* Salt - [https://saltproject.io/](https://saltproject.io/)
    
* SaltStack Meets OpenZiti - [https://netfoundry.io/saltstack-meets-openziti/](https://netfoundry.io/saltstack-meets-openziti/)
