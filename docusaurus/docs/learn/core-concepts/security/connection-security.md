# Connection Security

Ziti networks use robust modern cryptography and security mechanisms. Each component within a Ziti network uses
security technology that fits its role and use-cases.

Here are the different types of connections:

- `control` -  connections between a controller and a router that manage network state. Secured via mTLS 1.2+
- `link` - connections between a routers. Secured via mTLS 1.2+
- `edge` - a multiplexed connections between an SDK and an Edge Router that carries `service` connections. Secured via mTLS 1.2+
- `controller APIs` - connections between a controller and an SDK or other software via HTTPS and/or secure websockets. Secured via TLS, mTLS 1.2+
- `service` - connections are routed through an `edge` connection and establish connection between a client SDK and a host SDK. They carry application data is end-to-end encrypted. Secured via libsodium public private key cryptography and inherits the security of its `edge` connection.

Below is a diagram showing the `control`, `link`, `edge`, and `controller API` connections. The `service` connections
exist within an `edge` connection and are pictured in more detail in the second diagram.

![image](/img/connections.png)


Connections between SDKs and Edge Routers are called `edge` connections. `edge` connections are multiplexed and carry
multiple `service` connections. Each connection is for a specific service and secured with end-to-end encryption in 
order to transport application/service data securely between the two intended parties only.

![image](/img/connections-edge-sdk-sdk.png)

# Connection Walkthrough

Routers work in concert with a controller to establish a mesh network of `link` connections between routers. Routers coordinate
with a controller over a `control` connection. These connections are initialized and maintained while the network is in
operation. `control` and `link` connections are always authenticated using mTLS.

SDKs coordinate authentication with a controller via a `controller API` - specifically the [Edge Client API](../../../reference/developer/api/01-edge-client-reference.mdx). 
Authentication credentials have many forms: mTLS/certificates, SSO via External JWT Signers, or UPDB/username password 
([See Authentication](authentication/auth.md)or full details). The Edge Client API is also used for router discovery, 
service discovery, and to obtain security tokens. After authentication, an SDK will receive an API Session security 
token used to make further requests. An SKD may then establish ephemeral [API Session Certificates](authentication/20-api-session-certificates.md) 
to enable `edge` mTLS connections. If the SDk already has a certificate used for mTSL/certificate authentication, that
certificate may be used as well - negating the need for n API Session Certificate.

Connections to a specific services available on a Ziti network are authorized by a service session security token 
obtained from the controller's Edge Client API. A session security token is used via the `edge` connection with an
Edge Router, request dial (connect) or bind (host) a service. 

The `edge` connection is multiplexed, meaning it carries multiple streams of data. These streams are the individual 
`service` connections. Each stream is end-to-end encrypted per service per connection. 