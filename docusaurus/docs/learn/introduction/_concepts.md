
## Zero Trust/Application Segmentation

Many networking security solutions act like a wall around an internal network. Once you are through the wall, you have access to everything inside. Zero trust solutions enforce not just access to a network, but access to individual applications within that network.

Every client in a Ziti system must have an identity with provisioned certificates. The certificates are used to establish secure communications channels as well as for authentication and authorization of the associated identity. Whenever the client attempts to access a network application, Ziti will first ensure that the identity has access to the application. If access is revoked, open network connections will be closed.

This model enables Ziti systems to provide access to multiple applications while ensuring that clients only get access to those applications to which they have been granted access.

In addition to requiring cert based authentication for clients, Ziti uses certificates to authorize communication between Ziti components.

## Dark Services and Routers

There are various levels of accessibility a network application/service can have.

1. Many network services are available to the world. The service then relies on authentication and authorization policies to prevent unwanted access.
1. Firewalls can be used to limit access to specific IP or ranges. This increases security at the cost of flexibility. Adding users can be complicated and users may not be able to easily switch devices or access the service remotely.
1. Services can be put behind a VPN or made only accessible to an internal network, but there are some downsides to this approach.
    1. If you can access the VPN or internal network for any reason, all services in that VPN become more vulnerable to you.
    1. VPNs are not usually appropriate for external customers or users.
    1. For end users, VPNs add an extra step that needs to be done each time they want to access the service.
1. Services can be made dark, meaning they do not have any ports open for anyone to even try and connect to.

Making something dark can be done in a few ways, but the way it's generally handled in Ziti is that services reach out and establish one or more connections to the Ziti network fabric. Clients coming into the fabric can then reach the service through these connections after being authenticated and authorized.

Ziti routers, which make up the fabric, can also be dark. Routers located in private networks will usually be made dark. These routers will reach out of the private network to talk to the controller and to make connections to join the network fabric mesh. This allows the services and routers in your private networks to make only outbound connections, so no holes have to be opened for inbound traffic.

Services can be completely dark if they are implemented with a Ziti SDK. If this is not possible a Ziti tunneler or proxy can be co-located with the service. The service then only needs to allow connections from the local machine or network, depending on how close you colocate the proxy to the service.

## End-to-End Encryption

Ziti makes sure that when you connect to a service using a Ziti network, your connection is encrypted from start to 
finish. Each connection is secured through public-private-key cryptography provided by
[libsodium](https://libsodium.org). This means that even if your service data is not encrypted on its own, the 
connection between the SDKs will be encrypted and only readable by the intended parties. This feature is available in 
all applications that use Ziti's SDKs, including Ziti's tunneler, desktop, and mobile applications.


Read more about end-to-end encryption and security for other connections on the [Connection Security](/learn/core-concepts/security/connection-security.md) page.
