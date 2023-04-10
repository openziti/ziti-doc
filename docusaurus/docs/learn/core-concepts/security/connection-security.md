# Connection Security

Ziti networks use robust modern cryptography and security mechanisms. Each component within a Ziti network uses
security technology that fits its role and use-cases.

Here are the different types of connections:

- `control` -  connections between a controller and a router that manage network state. Secured via mTLS 1.2+
- `link` - connections between a routers. Secured via mTLS 1.2+
- `edge` - a multiplexed connections between an SDK and an Edge Router that facilitates service traffic. Secured via mTLS 1.2+
- `controller APIs` - connections between a controller and an SDK or other software via HTTPS and/or secure websockets. Secured via TLS, mTLS 1.2+
- `service` - connections are nested routed through an edge connection and establish connection between a client SDK and a host SDK. They carry application data is end-to-end encrypted. Secured via libsodium public private key cryptography and inherits the security of its edge connection.

Below is a diagram showing the `control`, `link`, `edge`, and `controller API` connections. The `service` connections
exist within an `edge` connection and are pictured in more detail in the subsequent diagram.

![image](/img/connections.png)


Connections between SDKs and Edge Routers are called `edge` connections. `edge` connections are multiplexed and carry
multiple service specific streams of data. Each stream is a connection for a specific service secured with end-to-end 
encryption in order to transport application/service data securely.

![image](/img/connections-edge-sdk-sdk.png)

# Connection Walkthrough

Routers work in concert with Ziti to establish a mesh network of `link` connections between routers. Routers coordinate
with a controller over a `control` connection. These connections are initialized and maintained while the network is in
operation. 

An SDK coordinated authentication with a controller via `controller APIs` - specifically the Edge Client API. These
interactions used to coordinate router discovery, service discovery, and to obtain security tokens used initiate and
maintain `edge` connections to Edge Routers. 

Connections to a specific services available on a Ziti network are authorized by a service session security token 
obtained from the controller's Edge Client API. A session security token is used via the `edge` connection with an
Edge Router, request dial (connect) or bind (host) a service. 

The `edge` connection is multiplexed, meaning it carries multiple streams of data. These streams are the individual 
`service` connections. Each stream is end-to-end encrypted per service per connection. 