---
title: Client Access SDK App
sidebar_label: Client Access SDK App
sidebar_position: 30
---

# Client Access SDK App

This guide walks through how to setup OpenZiti service to access a SDK enabled application via public cloud.

## Network Diagram

This diagram shows the components of the example network.

![image](/img/SDK-server-OpenZiti.jpg)

It has the following components:

* An OpenZiti controller
* One SDK Application server which implements zitified http server
* One OpenZiti Edge-Tunnel that access to the SDK Application server via ziti fabric

## OpenZiti Controller

Please setup an [OpenZiti Controller](https://openziti.io/docs/guides/Public_Cloud_Deployment/Controller) by following steps 1.1-1.3. Setup ZAC is optional.

**Note**: you will want to assign an elastic IP to the VM before installing OpenZiti so the certificates created will remain valid after this node is restarted for any reason.

## SDK Application server

We are going to use an existing [SDK implementation](https://github.com/openziti/sdk-golang/tree/main/example/simple-server) for this guide.

Please create a linux server (i.e. Ubuntu22.04) that can compile golang. Install **go** before you proceed further.

Check out the code from the [github repo](https://github.com/openziti/sdk-golang.git).

cd to the simple-server directory (example/simple-server).

build the simple-server binary
```bash
go mod tidy
go build .
```

If all goes well, you will find a **simple-server** binary under that directory.

By examining the code (simple-server.go), you can see we are using port **8080** for our server. (Note, the port is also mentioned in README file). This port will be used to create host.v1 config later.

Next, you need to create an identity for this SDK Application server.

Login to the controller
```bash
# source the aliases for ziti (do it the first time you login to the VM)
source ~/.ziti/quickstart/$(hostname -s)/$(hostname -s).env
# connect to ziti cli (do this when the token expired)
zitiLogin
# create identity for server
ziti edge create identity simple-server -a simpleserver.servers -o simple-server.jwt
# enroll identity
ziti edge enroll --jwt simple-server.jwt
```
Once the enrollment is complete, there will be a **simple-server.json** file under the current directory. Transfer the file (**simple-server.json**) to your SDK Application server machine, place it under the **simple-server** directory.

## OpenZiti Edge-Tunnel Client

We are going to use linux client for this demonstration. 

Please go to the controller first to create an identity for the client.
```bash
# connect to ziti cli
zitiLogin
# create identity for client
ziti edge create identity simple-client1 -a simpleserver.clients -o simple-client1.jwt
```
**NOTE** If you have multiple clients, you can create different identities by using the command above with different name (i.e. simple-client2, simple-client3 ). Please keep the attribute (-a) the same.

Please create a linux VM to be used as the client. Follow the [Linux Ziti Tunneler installation guide](https://openziti.io/docs/reference/tunnelers/linux/) to install tunneler. Use the **simple-client1.jwt** created earlier.

## Service creation

At this point, you have all the nodes ready to connect the client to the SDK application securely by using Ziti network. Now we will setup service to make magic happen.

### Configs

There are two configs we need to create: intercept config and host config.

The intercept config is used to instruct the intercept-side tunneler how to correctly intercept the targeted traffic and put it onto the overlay. We are setting up intercept on dns name "simpleService.ziti", and we are going to intercept on port 80.

```bash
ziti edge create config simple.interceptv1 intercept.v1 '{"protocols": ["tcp"], "addresses": ["simpleService.ziti"], "portRanges": [{"low": 80, "high": 80}]}'
```

The host config is used to instruct the server-side tunneler how to offload the traffic from the overlay, back to the underlay. We are dropping the traffic off our loopback interface, and since our SDK application is listening to port 8080, we will need to use the port 8080.

```bash
ziti edge create config simple.hostv1 host.v1 '{"protocol":"tcp", "address":"localhost","port":'8080'}'
```

### Service
Now we need to put two configs into a service. So, we know where the traffic comes from (intercept.v1) and where the traffic goes to (host.v1).

```bash
ziti edge create service simpleService --configs "simple.hostv1,simple.interceptv1" --role-attributes simple-service
```

### Service Policies

We need to create service policies to connect service to ingress and egress endpoints.

The dial policy specifies intercept side endpoints.

```bash
ziti edge create service-policy simple-client-dial Dial --identity-roles '#simpleserver.clients' --service-roles '#simple-service'
```

**Note** we are using attribute "simpleserver.clients" to setup the dial policy.  Which implies, any identity has that attribute will be able to intercept the traffic specified in th service. This is useful if you have multiple clients that needs to access the same application. You only need to setup service once and assign the different endpoints with the same attribute.

The bind policy specifies host side endpoints.

```bash
ziti edge create service-policy simple-client-bind Bind --identity-roles '#simpleserver.servers' --service-roles '#simple-service'
```

### Edge Router Policy

The edge route and edge router policy are needed for endpoints to connect to the Ziti Fabric. The default edge router and policy are already setup by the quickstart on the network. You can check both if you encounter issue with your setup.

To check edge router:
```bash
zitiLogin
ziti edge list edge-routers
```

**output**
```
$ ziti edge list edge-routers
╭───────────┬─────────────────────────────────┬────────┬───────────────┬──────┬────────────╮
│ ID        │ NAME                            │ ONLINE │ ALLOW TRANSIT │ COST │ ATTRIBUTES │
├───────────┼─────────────────────────────────┼────────┼───────────────┼──────┼────────────┤
│ .zNn8RLmX │ i-0432c75f7c2bc784c-edge-router │ true   │ true          │    0 │ public     │
╰───────────┴─────────────────────────────────┴────────┴───────────────┴──────┴────────────╯
```

**Make sure the edge router is online and has "public" attributes**.


To check edge router policy:
```bash
ziti edge list edge-router-policies
```

**output**
```
$ ziti edge list edge-router-policies
╭────────────────────────┬──────────────────────────────┬──────────────────────────────────┬──────────────────────────────────╮
│ ID                     │ NAME                         │ EDGE ROUTER ROLES                │ IDENTITY ROLES                   │
├────────────────────────┼──────────────────────────────┼──────────────────────────────────┼──────────────────────────────────┤
│ .zNn8RLmX              │ edge-router-.zNn8RLmX-system │ @i-0432c75f7c2bc784c-edge-router │ @i-0432c75f7c2bc784c-edge-router │
│ 5RyFyXjM8YUldcECuL4Mok │ allEdgeRouters               │ #public                          │ #all                             │
╰────────────────────────┴──────────────────────────────┴──────────────────────────────────┴──────────────────────────────────╯
```

**Make sure there is a policy called "allEdgeRouters"，and it is connecting "#all" identities to "#public" router**

### Service Edge Router Policy

Like the "Edge Router Policy", the "Service Edge Router Policy" is also setup by the quickstart already.

To check the policy:
```bash
zitiLogin
ziti edge list service-edge-router-policies
```
**output**
```
ziti edge list service-edge-router-policies
╭────────────────────────┬──────────────────┬───────────────┬───────────────────╮
│ ID                     │ NAME             │ SERVICE ROLES │ EDGE ROUTER ROLES │
├────────────────────────┼──────────────────┼───────────────┼───────────────────┤
│ 5dBSqEnkn1WxaWByZW6vA5 │ allSvcAllRouters │ #all          │ #all              │
╰────────────────────────┴──────────────────┴───────────────┴───────────────────╯
```

**Make sure there is a policy for "#all" to "#all"**

## Test Service

### Start the server

Go to the SDK Application server VM, make sure you are under the "simple-server" directory, start the server by using the registered server identity and service name.
```bash
./simple-server simple-server.json simpleService
```

**output**
```
$ ./simple-server simple-server.json simpleService
listening for non-ziti requests on localhost:8080
Using the provided service name [simpleService]listening for requests for Ziti service simpleService
INFO[0000] new service session                           session token=806969a4-31d1-4c15-ac56-4998322f9b3e
```

### Test from client

Go to the client VM.
```bash
curl http://simpleService.ziti?name='the-greatest-show-on-earth'
```

**output**
```
$ curl http://simpleService.ziti?name='the-greatest-show-on-earth'
Hello, the-greatest-show-on-earth, from ziti
```


## Conclusion

The OpenZiti enables clients securely access the SDK application. 
