# Ziti Services

The primary function of Ziti is providing access to "services". A service encapsulates the definition of any
resource that could be accessed by a client on a traditional network. 

A service is defined by the following components:

* **Name** - the name of the service
* **Termination** - Ziti only provides access to a network service, it does not provide the service itself. The service must be able to get network traffic to whatever application or application cluster is actually providing the service, whether that provider has Ziti embedded or has no knowledge of Ziti
* **Configuration** - Ziti allows application specific configuration to be stored for services. See [Configuration Store](../config-store/overview.md)
* **Authorization** - For a details on controlling access to services, see [Policies](../policies/overview.md).

## Service Name
Ziti services must have names that are unique to their Ziti installation. Service names are how clients address services in order to consume them. Services which are provided by applications with Ziti embedded also use the service name to indicate which service is being provided.
  
Services defined on a Ziti Network have an almost limitless "namespace" available for identifying services. A Ziti service is be defined by a name and this name is registered with the Ziti Controller. Once declared, services can then be addressed directly by name from Ziti-aware clients. This means there are effecitvely a **limitless** number names available with no need for global DNS registration. The names assigned are unique to a Ziti Network and the application developer has total control over service names.

## Service Termination
In Ziti, service termination refers to how a network traffic going over Ziti reaches the application (or application cluster) which is actually providing a service. There are a few basic ways in which a service can be terminated at an application.

There are some trade-offs to consider for each type of termination. 

1. Do you want end-to-end zero trust? If yes, that requires that both the client and server have Ziti identities and can connect securely with provisioned certificates.
1. Do you want Ziti provided end-to-end encryption? Developers can always provide their own end-to-end encryption on top of the connectivity that Ziti provides, but not all modes of service termination allow Ziti to encrypt traffic end-to-end for you.
1. How accessible to non-zero-trust clients do you want your server application to be? With the proper configuration applications can be fully 'dark', meaning they do not listen for connections.  

### SDK Embedded Applications
The server application can embed the Ziti Edge SDK. The application will have an enrolled identity and provisioned certificates. This has several advantages:

1. Connections between the application and Ziti will be secured using certificates. This enables true zero-trust and end-to-end encrypted connections betwen SDK based clients and SDK based servers. 
1. With an identity, the server application can particpate in the Ziti security model. This means you can control which services the application can provide, and revoke access as needed. You can also control which edge routers the application may connect to.
1. The application will be 'dark'. Instead of listening for incoming network connections, the application will make an outgoing, secured connection to one or more Ziti edge routers. It will then receive network requests over these secured connections.

The downside to this approach, specifically for existing applications, is that the application must be refactored to use a Ziti Edge SDK. Depending on language and frameworks used, the effort required can range from updating a few lines of code to writing a new SDK from scratch for a language that's not supported yet.   

### Proxied Applications
For applications where it doesn't make sense to embed the SDK a Ziti SDK based proxy can provide access to the application. Often the proxy may take the form of a sidecar and be co-located with the application. This minimizes the attack surface. There are a few things to note about this approach.

1. The application will not be completely dark. It must accept connections from wherever the proxy is located. The proxy may be co-located with the application, so the attack surface area may be tiny. However, tiny is still bigger than zero.
1. Similarly, traffic can be encrypted between the client and the proxy, but traffic between the proxy and the application will not be covered under the Ziti end-to-end encryption. It may still be encrypted, if the client and server establish their own encryption at the discretion of the client and server implementors. 
1. Via the proxy, the application is still represented by an identity and thus participates in policies.

Services which use proxies for server side termination may require extra configuration, so that the proxing application knows how to connect to the server application. Service configurations are discussed more below.

### Ziti Router Terminated Services
Routers also have the ability to connect to applications providing services. This approach has its own advantages and disadvantages.

1. Like the proxy approach, the application cannot be completely dark. The application must be reachable from the Ziti router. 
2. Ziti currently only offers end-to-end encryption between two SDK applications. Sessions terminating at a router cannot be end-to-end encrypted by Ziti. The data may still be end-to-end encrypted by the client and server, but that is up to the client and server implementors.

### Summary

| Termination Type | End-to-end Zero Trust | Managed by Policies | Ziti Provided End-to-end encryption | Dark Server Application | 
| -----------------| ----------------------|--------------------|-------------------------------------|-------------------------|
| SDK Embedded     | Yes                   | Yes                 | Yes                                 | Yes                     |
| SDK Based Proxy  | No, only to proxy     | Yes (via Proxy)     | Only to proxy. If desired, full end-to-end must be done externally | No. Can be relatively locked down, though |
| Ziti Router      | No                    |No                  | No. If desired, end-to-end must be done externally | No. Can be relatively locked down, though. |

### Terminators
Terminators represent a way to connect to a specific server application for a specific service. 

For SDK based server (whether embedded or proxied), these are created automatically as the application connects and removed when the application disconnects. 

For router terminated services they must be created manually. When creating a terminator manually, the following must be specified.

1. The router which will connect to the server application
1. The binding. This indicates which Xgress component on the router will handle making the connection. This will generally be `transport` for tcp based applications and `udp` for UDP based applications
    1. See the ziti-fabric documentation for more information on the Xgress framework
1. The address to connect to. This will be generally take the form `<protocol>:<host or ip>:<port>`
    1. Example: `tcp:localhost:5432`

## Availability and Scaling
Services can be made highly available and/or horizontally scalable. There are two kinds of availability that server applications need to concern themselves with. 

### Router HA/Scaling 
The first is allowing multiple routers to connect to a single application. 

**Multiple Routers**

![image](~/images/router-ha.png)

This ensures that the application will still be able to service requests even if a router fails or there is network partition separating a router and server application. It also will help ensure that the router layer doesn't become a bottleneck, as more routers can be addeded as necessary to scale out connectivity. Finally, it provides multiple network paths to the application. This gives smart routing more to choose optimal routes from as network conditions change.

### Application HA/Scaling
The second is application availabilty and/or scalability. There will often be multiple instances of a service application running, either for failover or in a load balanced deployment.

**Failover Deployment**

![image](~/images/application-ha.png)

**Horizontal Scale Deployment**

![image](~/images/horizontal-scale.png)

### Xt
All types of availability and scalability involve multiple terminators. What distinguishes an HA failover setup from a load-balanced horizontal scale setup is how new sessions are assigned to terminators. For failover, we want sessions to always go to the same service instance. For horizontal scale, we want to load balance sessions across available instances. 

The fabric contains a framework called Xt (eXtensible Terminators) which allows defining terminator strategies and defines how terminator strategies and external components integrate with smart routing. The general flow of terminator selection goes as follows:

  1. A client requests a new session for a service
  1. Smart routing finds all the active terminators for the session (active meaning the terminator's router is connected)
  1. Smart routing calculates a cost for each terminator then hands the service's terminator strategy a list of terminators and their costs ranked from lowest to highest
  1. The strategy returns the terminator that should be used
  1. A new session is created using that path. 
  
Strategies will often work by adjusting terminator costs. The selection algorithm then simply returns the lowest cost option presented by smart routing. 

#### Costs
There are a number of elements which feed the smart routing cost algorithm.

##### Route Cost
The cost of the route from the initiating route to the terminator router will be included in the terminator cost. This cost may be influenced by things such as link latencies and user determined link costs.

##### Static Cost
Each terminator has a static cost which can be set or updated when the terminator is created. SDK applications can set the terminator cost when they invoke the Listen operation.

#### Precedence
Each terminator has a precedence. There are three precedence levels: `required`, `default` and `failed`.
  
Smart routing will always rank terminators with higher precedence levels higher than terminators with lower precedence levers. So required terminators will always be first, default second and failed third. Precedence levels can be used to implement HA. The primary will be marked as required and the secondary as default. When the primary is determined to be down, either by some internal or external set of heuristics, it will be marked as Failed and new sessions will go to the secondary. When the primary recovers it can be bumped back up to Required.

##### Dynamic Cost 
Each terminator also has a dynamic cost that will move a terminator up and down relative to its precedence. This cost can be driven by stratagies or by external components. A strategy might use number of active of open sessions or dial successes and failures to drive the dynamic cost. 

##### Effective Cost

Each terminator has an associated precedence and dynamic cost. This can be reduced to a single cost. The cost algorithm ensures terminators at different precedence levels do not overlap. So a terminator which is marked failed, with dynamic cost 0, will always have a higher calculated cost than a terminator with default precedence and maximum value for dynamic cost. 

#### Strategies
The fabric currently provides four strategy implementions.

##### `smartrouting`
This is the default strategy. It always uses the lowest cost terminator. It drives costs as follows:

  * Cost is proportional to number of open sessions
  * Dial failures drive the cost up
  * Dial successes drive the cost down, but only as much as they were previously driven up by failures
  
##### `weighted`
This strategy drives costs in the same way as the `smartrouting` strategy. However instead of always picking the lowest cost terminator it does a weighted random selection across all terminators of the highest precedence. If a terminator has double the cost of another terminator it should get picked approximately half as often. 
   
##### `random`
This strategy does not change terminator weights. It does simple random selection across all terminators of the highest precedence. 

##### `ha`
This strategy assumes that one terminator will have `required` precedence and there will be a secondary terminator with `default` precedence. If three consecutive dials to the highest ranked terminator fail in a row it will be marked as failed. This will allow the secondary to take over. If the primary recovers it can be marked as required again via the APIs. 

[!include[](./creating.md)]
