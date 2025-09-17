---
title: "Announcing OpenZiti v1.0"
date: 2024-04-11T01:11:05Z
cuid: cluujmixu000108jlcumufydf
slug: announcing-openziti-v1
authors: [DaveHart]
image: /blogs/openziti/v1712766359966/2d5059cd-e7d7-4aa0-bc79-4a428a90710e.png
tags: 
  - opensource
  - zerotrust

---

We created [OpenZiti](https://openziti.io) so that anyone can implement distributed applications over the Internet, incorporating the principles of zero-trust networking for free into almost anything and for any use case.

We started the [OpenZiti  GitHub org](https://github.com/openziti/ziti/) back in May 2020. One of the most common questions we get today is, "Why haven't you bumped the version to 1.0 yet?" It's a fair question. OpenZiti boasts a robust feature set and sees widespread use in mission-critical applications, including Fortune 50 environments, with billions of sessions annually.

So, why the long wait? Well, making secure connectivity simple at scale is non-trivial, and we’ve held ourselves to a high standard.

We’ve proved, and our users have proved, that OpenZiti stands up to large-scale production use. But one of the most important things we wanted to do before flipping to v1.0 was show off OpenZiti in action in its most potent use case: as a foundation for what we call “ziti-native apps.” These are applications built from the ground up with security, privacy, and resilience designed in.

zrok - a peer-to-peer sharing application - is the first ziti-native app we built.  It’s completely open source, and we’ve made it available as a [free service](https://zrok.io). zrok has been a tremendous success in its own right, but it also serves as a reference application. Check it out on [GitHub](https://github.com/openziti/zrok) to see how we did it and for inspiration on how you could use OpenZiti in your applications.

We're excited to announce v1.0. It's a milestone marking our commitment to users for system quality, stability, and compatibility throughout major release cycles. It's a proven foundation for the next generation of distributed applications featuring security as a first-class design goal.

## **Background: Some OpenZiti use cases**

OpenZiti approaches networking from a software perspective. Solutions can ‘embed’ full mesh, zero trust overlay networks as software for use cases such as:

1. Developing next-generation network applications with built-in security, privacy, and reliability, using a clean, modern software-first abstraction. (ala [zrok](https://github.com/openziti/zrok))
    
2. Remotely manage your software, devices, or machines in security-conscious sites such as OT environments via your own private, high-performance network without requiring your customers to open inbound firewall ports or provide VPN/bastion-type solutions.
    
3. Enable users or customers to consume private APIs, use private websites, and access private databases without requiring those users or customers to be on the same administrative domain, network, or VPN.
    
4. Enable operations teams to lock down environments such as Kubernetes.  For example, kubectl becomes completely ‘dark’ in an OpenZiti architecture.
    

These are just examples, and you can see more [here](https://github.com/openziti/ziti/blob/release-next/ADOPTERS.md). Secure networking is now software you control. You can use it as you wish.

## **Background: What does OpenZiti provide to enable secure networking as software?**

One way to think about OpenZiti is to ask: If I assume the networks I run on are already compromised, how would I design my application?

OpenZiti answers with the following:

1. **Strong identities** are essential to ensure that all entities on your network are who they claim to be. Validating the identity before allowing it to connect to any protected services is critical. Identities in OpenZiti implement [mutual authentication](https://en.wikipedia.org/wiki/Mutual_authentication) to authenticate both sides of a connection. Logical entities inside the OpenZiti Controller map an X509 certificate to each named identity.
    
2. **Protection from port scanning**. Port scanning is a common attack vector searching for vulnerabilities.  A level of darkness and invisibility mitigates against such attacks, leaving no open inbound ports to your endpoints available for attack. Your applications listen on the OpenZiti overlay, not on the open Internet. There is no need to open inbound ports on the firewall protecting your application.
    
3. A **least privileged access** model to help mitigate against lateral attacks. If an identity is compromised, or a user we chose to trust turns out to be a bad actor, OpenZiti helps limit the damage.  Access is only allowed to what is needed and when it’s needed.
    
4. **Continuous authorization:** Sometimes things change, and what was once appropriate access needs to be revoked. OpenZiti supports posture checks and continuously validates them throughout each session.
    
5. **End-to-end encryption** OpenZiti helps ensure privacy when running over the Internet. Only your endpoints and applications can access your data, regardless of intermediate waypoints across the Internet. In addition to mTLS across each OpenZiti link, end-to-end encryption (ChaCha20-Poly1305) is provided between endpoints.
    
6. **Visibility** Auditing, compliance, and forensics support are built-in through advanced metrics and logging, helping support the zero-trust ethos of “always verify."
    
7. **Permissive (Apache v2.0) open source.** OpenZiti is available to everyone, including the top security experts worldwide who can validate our network security and have the option to find issues and help us improve.
    
8. **Software SDKs, agents, and containers** easily integrate with your applications and networking solutions. The most secure implementations embed the network directly in your code.
    

## **We’re Not Done...**

Far from it! We continue to evolve OpenZiti, including:

* Advancing our core [overlay fabric](https://github.com/orgs/openziti/projects/13t) and [distributed control](https://github.com/orgs/openziti/projects/9)
    
* Adding [BrowZer](https://github.com/orgs/openziti/projects/21) support for agent-less access to the overlay for web apps
    
* Continued evolution of the [zrok project](https://github.com/orgs/openziti/projects/16)
    
* Refreshed tunneling application UIs
    
* Additional deployment models
    
* Additional ziti-native apps beyond zrok (more to come very soon!)
    

And more!

Thank you all, especially those in the community who have helped advance OpenZiti to this point. If you haven’t yet, [try it](https://openziti.io/docs/learn/quickstarts/) and let us know how it goes! And a star on the [main repo](https://github.com/openziti/ziti) is always appreciated.
