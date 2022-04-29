# Configuration
Ziti has the capability to define a configuration schema for an application and provide service configuration for those applications which need additional metadata. 

## Why Centralized Configuration?
One might ask why have this feature in Ziti when applications can store configuration data in local configuration files. While this approach works, centralized management makes deployments much easier. It can be difficult or impossible to update a file on a device out in the field, whereas updating the configuration in Ziti is easy, and running clients will quickly be notified of service changes.

The Ziti tunneler applicatons provide an example how configuration data can be used. 

* Tunnelers need to know what ip/dns and port(s) to intercept for services they are proxying on the client side
* Tunnelers need to know where to reach out to applications they are proxying on the server side

## Overview
The configuration store has four components:

1. **Configuration types** 
    1. Configuration types define a type of configuration, including an optional JSON schema that the configuration data must conform to.
    1. Configuration types have the following attributes: 
        1. A name 
        1. An optional JSON schema to validate configurations of the type
        1. Standard edge attributes: id, tags, createdAt, updatedAt
1. **Configurations** 
    1. Configurations have the following attributes: 
        1. A name
        1. The configuration data, which is arbitrary JSON data, so long as it conforms to the type schema (if specified)
       1. Standard edge attributes: id, tags, createdAt, updatedAt
1. **Services** 
    1. Each service can be linked to multiple configuration. Services can have one configuration linked for each configuration type.
1. **Identities** 
    1. An identity can have a configuration specified for a given service and configuration type. This will override any configuration for the service for that type 

This configuration model has the following properties:
* Different applications have can their own configuration for the same service
* Applications can have multiple configuration types for themselves where it makes sense
    * Ziti tunnelers have one type for the client side and one for the server side, since they have different properties and not every service with use both
* Since an application can support multiple configuration types, applications can version their configuration types as their needs change