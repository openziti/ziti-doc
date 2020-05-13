# Policies
Ziti policies control which identities can access or host which services
via which edge routers. There are three kinds of policies, and we'll walk 
through what kind of access each policy type grants, as well as walk through
some use cases.

Each policy type relates two of the following entity types: identities, services and edge routers.
 
![image](~/images/policy-entities.png)

## Service Policies
Service policies are entities within the Ziti Controller which provide 
identities authorization to services. 

![image](~/images/service-policies.png)

There are two kinds of service policies:

  * **Dial** policies, which control who can use a service
  * **Bind** policies, which control who can provide a service
  
They are separate because in most cases a given identity will not 
both use and provide any given service, so it's important to be able
to distinguish between the two privileges.   

Service policies are how access to application can be segmented. Each service 
(and corresponding application) can be accessed only by the identities 
which are given access to it. An identity can have access to any number 
of services, and it is straightforward to add or remove identities from 
service policies. With roles and role attributes (described below), it's
easy to group entities and minimize manual maintenance of groups.

Having at least one Service Policy is vital because without any 
service policies the Ziti network will have no identities authorized 
to send traffic over the Ziti network.

## Edge Router Policies

Edge router policies are entities within the Ziti Controller which provide 
identities access to edge routers. In order to access or provide a 
service the identity must first access the Ziti network fabric. Edge
routers are the points through which SDK based applications can
get that access.  

![image](~/images/edge-router-policies.png)

Not every identity should necessarily be allowed to use every edge router. 
Identities or groups of identities may have dedicated edge routers for a 
number of reasons.

  * For resource isolation due to SLAs
  * For resource isolation because they are hosting a service 
  * Edge routers may be colocated with a set of identities
  * A group of identities may need to use a particular version of an edge router 

Having at least one Edge Router Policy is necessary because without at least one, 
no identities will be able to send traffic over the Ziti network because traffic 
must enter the network via an edge router.

## Service Edge Router Policies
Service edge router policies are entities within the Ziti Controller which provide 
services access to edge routers. They are similar to edge router policies except
they determine via which edge routers a service can be used or provided. 

![image](~/images/service-edge-router-policies.png)

There are a few reasons you might want to have pools of edge routers dedicated 
particular services or service groups.

  * Resource isolation due to SLAs
  * Geographic/political boundaries. Some services may need to be accessible only from specific areas to comply with local laws 

Having at least one Service Edge Router Policy is vital because without at least one, 
no services will be able to accept traffic over the Ziti network because traffic must 
enter the network via an edge router.

## Roles and Role Attributes
In order for policies to work they need a way to specify which entities to include
in the policy. All Ziti policies work the same way. 

  * The entities included in policies (identities, serviced and edge routers) can all be assigned role attributes
      * For example: an identity could be given the attributes `sales`, `eu` if that identity belongs to a sales person from the European Union
  * Each policy has two list of roles, one for each entity type that the policy is relating 
      * Service policies have identityRoles and serviceRoles
      * Edge router policies have identityRoles and edgeRouterRoles
      * Service edge router policies have edgeRouterRoles and serviceRoles
  * Each list can contain role attributes, which are prefixed by hash tags, and ids, which are prefixed with at-symbols.
      * For example: a service policy might have 
          * `identityRoles = [#sales, #north-america, @81cc68d0-700a-491f-8e98-4b43a0b30a9f]` 
          * `serviceRoles = [#office, @738006f2-e33e-4964-945f-7431000d229f]`
      * Note that external tools such as the CLI and the ZAC will likely use names instead of IDs. So the roles might instead look like 
          * `identityRoles = [#sales, #north-america, @jsmith-laptop]` 
          * `serviceRoles = [#office, @crm-suite]`
  * Each policy also has a semantic. The semantic dictates how multiple role attributes will be interpreted. `[#sales, #eu]` could mean every identity which has `#sales` *and* `#eu`, or it could mean every identity which has `#sales` *or* `#eu`
      * The `allOf` semantic will include only entities have *all* the listed role attributes
      * The `anyOf` semantic will include all entities that have *any of* the listed role attributes
  * No matter the semantic, any entities which are listed by `@id` will be included in the policy
  * There is a special role attribute `#all` which will include all entities of a given type. This is useful for simpler setups which may not be segmenting edge routers, as well as for development and testing.

## Policy Interaction
**Important Note:** When an identity is using a service, the identity
 and service must have at least one on-line edge router in common in 
 order for a connection to be made. 
 
When an identity is trying to establish a session to use or host a service the Ziti
controller will verify that they access via service policy. Once the session is 
established, the controller will return a list of edge routers that the identity 
can use to connect to that service. The list will be all edge routers which **both**
the identity and service have access to. It is possible that an identity may have
access to a service and access to edge routers, but none of those edge routers
can be used to access that particular service. 

### Policy Advisor 
To help diagnose issues there is a policy advisor API which the CLI has a wrapper for.


    $ ziti edge controller policy-advisor services -q
    OKAY : simple-client (1) -> simple (1) Common Routers: (1/1) Dial: Y Bind: N 

    OKAY : simple-server (1) -> simple (1) Common Routers: (1/1) Dial: N Bind: Y

    $ ziti edge controller policy-advisor services ssh simple-client -q
    ERROR: simple-client (1) -> ssh (1) Common Routers: (1/1) Dial: N Bind: N 
      - No access to service. Adjust service policies.
 

The policy advisor can look at all services or identities, or a specific service
 and identity, and see if there are any common problems, such as:

  * Does an identity not have access to any services?
  * Does a service have no one who can access it?
  * Do a service and identity have no edge routers in common?
  * Do a service and identity have edge routers in common, but they are all off-line?

# Managing Policies
## Service Policies

[!include[](./creating-service-policies.md)]

## Edge Router Policies

[!include[](./creating-edge-router-policies.md)]

## Service Edge Router Policies
[!include[](./creating-service-edge-router-policies.md)]
