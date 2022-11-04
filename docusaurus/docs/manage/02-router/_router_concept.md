(Note: Here is the modification I wantted to see on the front page or concept section for the router concept. I left it using _ here just incase someone want to use these as part of the revamp of those sections. Dariusz Nov/22)

### Ziti Router

Ziti Routers are the fundamental building blocks of the Ziti Network. 
The routers are responsible for securely and reliably delivering traffic 
from clients to services. They have two major deployment modes. 

1. **Fabric mode**
    This enables the network side of the router and it is required.
    - **Link Creation**
        Each router can initiate to create the router link (i.e. link dialer) and/or 
        accept the link creation request (i.e. link listener ). The links created 
        between routers form a network mesh. At least one router in the listen mode 
        is required to form a simple network mesh. This mesh is constantly being 
        monitored for latency and the fastest paths are used when routing traffic 
        to the destination. The monitoring also allows for active failover to 
        ensure a reliable network connection even in the case of a node failure.

1. **Edge mode**
    This enbles both the client and service sides of the router. It is only required
    on the routers deployed close to clients and services. Most of the deployments 
    will need to have it configured.
    - **Listeners** 
        - **Edge Binding**
            This function in conjuction with the Ziti Network Controller allows sdk service 
            and client apps to autheticate, authorize and connect to the Ziti Newtork 
            based on predefined access and service control policies. 
        - **Tunnel Binding**
            When enabled, a router becomes a network gateway. It can be a default gateway, 
            where it forwards all service destinations from a private network 
            (i.e. enterprise data center network, public cloud virtual network, etc) 
            or can be deloyed along side a default gateway and only forward selective 
            service destinations.

    - **CSR**
        It enables enrollment and management of endpoints that make use of the Ziti SDK.
