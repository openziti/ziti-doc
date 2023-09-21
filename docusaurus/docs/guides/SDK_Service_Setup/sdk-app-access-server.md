---
title: SDK App Access Server
sidebar_label: SDK App Access Server
sidebar_position: 10
---

# SDK App Access Server

This guide walks through how to setup OpenZiti service to access a server from a SDK enabled application via public cloud.

## Network Diagram

This diagram shows the components of the example network.

![image](/img/SDK-app-access-server.jpg)

It has the following components:

* An OpenZiti controller
* One SDK Application client which implements zitified curl
* One OpenZiti Edge-Tunnel that accesses a webserver locally

## OpenZiti Controller

Please setup an [OpenZiti Controller](https://openziti.io/docs/guides/Public_Cloud_Deployment/Controller) by following steps 1.1-1.3. Setup ZAC is optional.

**Note**: you will want to assign an elastic IP to the VM before installing OpenZiti so the certificates created will remain valid after this node is restarted for any reason.

## SDK Application client

We are going to use an existing [SDK implementation](https://github.com/openziti/sdk-golang/tree/main/example/curlz) for this guide.

Please create a linux server (i.e. Ubuntu22.04) that can compile golang. Install **go** before you proceed further.

Check out the code from the [github repo](https://github.com/openziti/sdk-golang.git).

cd to the curlz directory (example/curlz).

build the curlz binary
```bash
go mod tidy
go build .
```

If all goes well, you will find a **curlz** binary under that directory.

Next, you need to create an identity for this SDK Application.

Login to the controller
```bash
# source the aliases for ziti (do it the first time you login to the VM)
source ~/.ziti/quickstart/$(hostname -s)/$(hostname -s).env
# connect to ziti cli (do this when the token expired)
zitiLogin
# create identity for server
ziti edge create identity curlz-client -a curlz.clients -o curlz-client.jwt
# enroll identity
ziti edge enroll --jwt curlz-client.jwt
```
Once the enrollment is complete, there will be a **curlz-client.json** file under the current directory. Transfer the file (**curlz-client.json**) to your SDK Application client machine, place it under the **curlz** directory.

## Web Server

We are going to use linux client for this demonstration. 

Please go to the controller first to create an identity for the Web Server.
```bash
# connect to ziti cli
zitiLogin
# create identity for client
ziti edge create identity curlz-server -a curlz.servers -o curlz-server.jwt
```

Please create a linux VM to be used as the client. Follow the [Linux Ziti Tunneler installation guide](https://openziti.io/docs/reference/tunnelers/linux/) to install tunneler. Use the **curlz-server.jwt** created earlier.

## Service creation

At this point, you have all the nodes ready to access the webserver by using the SDK application. Now we will setup service to make magic happen.

### Configs

There is only one config we need to create: host config.

The host config is used to instruct the server-side tunneler how to offload the traffic from the overlay, back to the underlay. We are dropping the traffic off our loopback interface, and we going to use the port 8000.

```bash
ziti edge create config curlz.hostv1 host.v1 '{"protocol":"tcp", "address":"localhost","port":'8000'}'
```

### Service
Now we need to put the config into a service.

```bash
ziti edge create service curlzService --configs "curlz.hostv1" 
```

### Service Policies

We need to create service policies to connect service to ingress and egress endpoints.

The dial policy specifies intercept side endpoints (the SDK application).

```bash
ziti edge create service-policy curlz-client-dial Dial --identity-roles '#curlz.clients' --service-roles '@curlzService'
```

The bind policy specifies host side endpoints.

```bash
ziti edge create service-policy curlz-client-bind Bind --identity-roles '#curlz.servers' --service-roles '@curlzService'
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

Go to the web server VM, create an index.html file to be accessed by the application
```bash
cat > index.html
.....----==== Welcome to the Test Server for curlz ====----....
<ctrl-d>
```

Then start a webserver on port 8000
```bash
python3 -m http.server
```

**Output**
```
$ python3 -m http.server
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
```

### Test from client

Make sure you are under the "curlz" directory, start the application by using the service name and the registered client identity.
```bash
./curlz http://curlzService curlz-client.json
```

**output**
```
$ ./curlz http://curlzService curlz-client.json
.....----==== Welcome to the Test Server for curlz ====----.....
```


## Conclusion

The OpenZiti enables SDK application securely access a webserver. 
