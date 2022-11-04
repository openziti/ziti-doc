---
id: router-update
title: Update
---

You can list, update certain attributes and delete routers. 
- Router cost can be used to influence the smart routing to not use this router for service traversal unless no other paths are available. 
- No-traversal flag means no service traversal through this router at all. Only the service termination or origination can be completed on it. 
- App-Data can be used to set key/value pair to be used in addressable terminator service for example. 
- The role attribute flag allows to set a list of attributes that can be referenced by all policies for dialing and/or hosting services.

:::info Fun Fact
If there is a need to re-create a router, because the router cert needs to be updated with a new IP for example. The best way is to create routers with the attribute(s) that define(s) a group(s) of routers, i.e. ```--role-attributes azure-eastus2 azure-eastus2-service```. Then, it can be referenced as a group with ```#azure-eastus2 or #azure-eastus2-service``` in the service configuration or service-policy configuration depending if it's a service hosting or dialing router. The replacement router will be added automatically upon creation to the existing policies that a replaced router was part of. No additional configuration needs to be done. 
:::

```bash
ziti edge list edge-routers

ziti edge delete edge-routers $ROUTER_NAME_PREFIX

ziti edge update edge-router $ROUTER_NAME_PREFIX [flags]

    Error: accepts 1 arg(s), received 0
    Usage:
    ziti edge update edge-router <idOrName> [flags]

    Aliases:
    edge-router, er

    Flags:
        --app-data stringToString   Custom application data (default [])
    -i, --cli-identity string       Specify the saved identity you want the CLI to use when connect to the controller with
        --cost uint16               Specifies the router cost. Default 0.
    -h, --help                      help for edge-router
    -n, --name string               Set the name of the edge router
        --no-traversal              Disallow traversal for this edge router. Default to allowed(false).
    -j, --output-json               Output the full JSON response from the Ziti Edge Controller
        --output-request-json       Output the full JSON request to the Ziti Edge Controller
    -a, --role-attributes strings   Set role attributes of the edge router. Use --role-attributes '' to set an empty list
        --tags stringToString       Custom management tags (default [])
        --timeout int               Timeout for REST operations (specified in seconds) (default 5)
    -t, --tunneler-enabled          Can this edge router be used as a tunneler
        --use-put                   Use PUT to when making the request
        --verbose                   Enable verbose logging
```