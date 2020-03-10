# Service Policies

Service Policies are entities within the Ziti Controller which provide 
identities authorization to services. Having at least one Service Policy 
is vital because without at least one the Ziti network will have no 
identities authorized to send traffic over the Ziti network.

[!include[](./creating-service-policies.md)]

# Edge Router Policies

Edge Router Policies are entities within the Ziti Controller which provide 
identities access to edge routers. Having at least one Edge Router Policy 
is vital because without at least one, no identities will be able to send 
traffic over the Ziti network because traffic must enter the network via 
an edge router.

[!include[](./creating-edge-router-policies.md)]

# Service Edge Router Policies

Service Edge Router Policies are entities within the Ziti Controller which provide 
services access to edge routers. Having at least one Service Edge Router Policy 
is vital because without at least one, no services will be able to accept 
traffic over the Ziti network because traffic must enter the network via 
an edge router.

[!include[](./creating-service-edge-router-policies.md)]