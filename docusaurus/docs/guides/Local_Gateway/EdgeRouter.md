---
sidebar_position: 10
sidebar_label: Using Ziti-Router
title: Ziti-Edge-Router as Gateway
---
# 1.0 Introduction

## 1.1 Network Description
This guide demonstrates how to setup LAN gateways with **Ziti-Edge-Router** for the purpose of transferring data between non-Ziti endpoints across Ziti Fabric.

There is a [video](https://www.youtube.com/watch?v=H0qGRBMGNIA) for this demo. The demo here setup exact same network as described in the video with some changes to the commands.

For the demonstration, we will setup the network like below:

---
![Diagram](/img/local_gw/LocalGW01.png)

---

- There are two Ziti-Edge-Routers (**local-router** and **remote-router**) as LAN gateways. 
- The Windows machine (**Windows Client**) is in the same subnet (172.16.31.0/24) as Router (**local-router**).
- The Ubuntu 22.04 server (**Ubuntu Server**) is in the same subnet (172.16.240.0/24) as Router (**remote-router**).
- The data (ssh) will be passed between the Windows Client and the Ubuntu Server.



## 1.2 Prerequisite
Please complete the following steps before continue with this demo.
- An open-ziti network should be created already. If not, please follow this quickstart [Host OpenZiti Anywhere](/docs/learn/quickstarts/network/hosted/) guide to setup open-ziti network first.
- Ziti Controller IP
- Ziti Controller Fabric Port: On the controller, issue this command **echo $ZITI_CTRL_PORT**
- Ziti Controller Management Port: On the controller, issue this command **echo $ZITI_EDGE_CONTROLLER_PORT**
- Ziti Controller Passwd: On the controller, issue this command **echo $ZITI_PWD**
- Created two *routers* already. The routers should be running under **Ubuntu 22.04**.
- Created one *windows client* already. Suggested windows version Windows 10 or Windows 11. Windows servers should work fine as well.
- Created one *ubuntu server* already. This can be any server capable of accepting ssh connection.

# 2.0 Setup routers
## 2.1 Setup the Router For Windows Subnet
### 2.1.1 Retrieve auto_enroll script and gather setup info
**ssh** into your router VM (**local-router**). 

Retrieve **ziti_router_auto_enroll** to setup your router.
```bash
wget https://github.com/netfoundry/edge-router-registration/releases/latest/download/ziti_router_auto_enroll.tar.gz
tar xf ziti_router_auto_enroll.tar.gz
```
You should have a file **ziti_router_auto_enroll** under the directory.

Here is information I gathered from **Prerequisite** step:
![Diagram](/img/local_gw/LocalGW02.png)
- Controller IP: **68.183.139.122**
- Controller Fabric Port: **8440** (default value if following controller setup guide)
- Controller Management Port: **8441** (default value if following controller setup guide)
- Controller Passwd: **Test@123**

We are going to use Router Name: **local-router**

We are also going to create the router without healthcheck section and metrics, so the following two options will be used to create the router:
- --disableHealthChecks
- --disableMetrics

### 2.1.2 Create and Register Router
```bash
sudo ./ziti_router_auto_enroll -f -n --controller 68.183.139.122 --controllerFabricPort 8440 --controllerMgmtPort 8441 --adminUser admin --adminPassword Test@123 --disableHealthChecks --disableMetrics --autoTunnelListener --routerName local-router
```
What this command does:
- contacts the controller
- creates a router named "local-router" (with tunneler enabled) on the controller
- generates the conf.yml locally
- downloads the jwt file for the router from controller
- enrolls the router with the jwt and the generated conf.yml
- creates the service file to start and stop the router
- and configured the resolver

### 2.1.3 Check the installation
You do not have to perform this step if your installation was successful. 

#### 2.1.3.1 ziti-router service
```bash
systemctl status ziti-router
```

**expected output:** The status should show "active (running)"
![Diagram](/img/local_gw/LocalGW03.png)

#### 2.1.3.2 resolver
```bash
resolvectl
```

**expected output:** The resolver should be set to the IP of the local LAN
![Diagram](/img/local_gw/LocalGW04.png)

#### 2.1.3.3 Check Router and Identity
```bash
/opt/ziti/ziti edge login 68.183.139.122:8441 -u admin -p Test@123 -y
/opt/ziti/ziti edge list edge-routers
/opt/ziti/ziti edge list identities
```
![Diagram](/img/local_gw/LocalGW05.png)


### 2.1.3 setup ufw
The following steps turn on the ufw firewall and opens the ports for this demo.
```bash
sudo ufw enable
sudo ufw allow from any to 172.16.31.173/32 port 53 proto udp
sudo ufw allow from any to 172.16.31.173/32 port 22 proto tcp
```

### 2.1.4 add attribute "clients" to the identity
We want to add attribute "clients" to the identity associated with the edge router. 

**You do not need to login again if your token has not expired yet**
```bash
/opt/ziti/ziti edge login 68.183.139.122:8441 -u admin -p Test@123 -y
/opt/ziti/ziti edge update identity local-router -a clients
```
![Diagram](/img/local_gw/LocalGW06.png)


## 2.2 Setup the Router For Ubuntu Server Subnet

### 2.2.1 Retrieve auto_enroll script and gather setup info
**ssh** into your router VM (**remote-router**). 

Retrieve **ziti_router_auto_enroll** to setup your router automatically.
```bash
wget https://github.com/netfoundry/edge-router-registration/releases/latest/download/ziti_router_auto_enroll.tar.gz
tar xf ziti_router_auto_enroll.tar.gz
```

**Info for the controller is same as previous setup, please refer to section 2.1.1 for detail.**

We are going to use Router Name: **remote-router**

### 2.2.2 Create and Register Router
```bash
sudo ./ziti_router_auto_enroll -f -n --controller 68.183.139.122 --controllerFabricPort 8440 --controllerMgmtPort 8441 --adminUser admin --adminPassword Test@123 --disableHealthChecks --disableMetrics --autoTunnelListener --routerName remote-router
```

### 2.2.3 Check the installation
You do not have to perform this step if your installation was successful. 

#### 2.2.3.1 ziti-router service
```bash
systemctl status ziti-router
```
**expected output:** The status should show "active (running)"


#### 2.2.3.2 resolver
```bash
resolvectl
```
**expected output:** The resolver should be set to the IP of the local LAN.


#### 2.2.3.3 Check Router and Identity
```bash
/opt/ziti/ziti edge login 68.183.139.122:8441 -u admin -p Test@123 -y
/opt/ziti/ziti edge list edge-routers
/opt/ziti/ziti edge list identities
```
![Diagram](/img/local_gw/LocalGW07.png)


### 2.2.3 setup ufw
```bash
sudo ufw enable
sudo ufw allow from any to 172.16.240.128/32 port 53 proto udp
sudo ufw allow from any to 172.16.240.128/32 port 22 proto tcp
```

### 2.2.4 add attribute "hosts" to the identity
We want to add attribute "hosts" to the identity associated with the edge router. 

**You do not need to login again if your token has not expired yet**
```bash
/opt/ziti/ziti edge login 68.183.139.122:8441 -u admin -p Test@123 -y
/opt/ziti/ziti edge update identity remote-router -a hosts
```
![Diagram](/img/local_gw/LocalGW08.png)

# 3.0 Setup Client and Server

## 3.1 Ubuntu Server

The Ubuntu Server does not need any special setup, it just need to support **ssh** for our demo.

## 3.2 Windows Client
There are two changes we need to make on the windows side.

The first one, we need to change the configuration of the preferred DNS to point to our **local-router** (172.16.31.173).

![Diagram](/img/local_gw/LocalGW09.png)

The second change is route the 100.64.0.0/10 traffic to our **local-router** as well.  To do this, open an cmd window as Administrator.
```bash
route add 100.64.0.0 mask 255.192.0.0 172.16.31.173
```
![Diagram](/img/local_gw/LocalGW10.png)

# 4.0 Service Configuration

The service configuration can be done on either the local-router or remote-router.

## 4.1 Create an intercept.v1 config
This config is used for local side connection. We are setting up intercept on dns name "mysimpleservice.ziti"

```bash
/opt/ziti/ziti edge login 68.183.139.122:8441 -u admin -p Test@123 -y
/opt/ziti/ziti edge create config ssh-intercept-config intercept.v1 '{"protocols": ["tcp"], "addresses": ["mysimpleservice.ziti"], "portRanges": [{"low": 22, "high": 22}]}'
```

## 4.2 Create a host.v1 config
This config is used for remote side connection. We are setting up the address the remote server can reach. In this demo, We are dropping the traffic off at "172.16.240.129"

```bash
/opt/ziti/ziti edge create config ssh-host-config host.v1 '{"address":"172.16.240.129", "protocol":"tcp", "port":22}'
```

If the command finished successfully, you will see two configs:

![Diagram](/img/local_gw/LocalGW11.png)

## 4.3 Create Service
Now we need to put these two configs into a service. We going to name the service "ssh" and assign an attribute "rtrhosted"

```bash
/opt/ziti/ziti edge create service ssh -c ssh-intercept-config,ssh-host-config -a rtrhosted
```

**Check Service**
![Diagram](/img/local_gw/LocalGW12.png)

## 4.4 Create Service-Edge-Router-Policy
This step is **optional** since the default service-edge-router-policy already includes all services to all routers.

But in case, you need to add a policy, here is the command to add the service tag we created (rtrhosted) to all routers
```bash
/opt/ziti/ziti edge create service-edge-router-policy ssh-serp --edge-router-roles '#all' --service-roles '#rtrhosted' --semantic 'AnyOf'
```
![Diagram](/img/local_gw/LocalGW13.png)

## 4.5 Create Bind policies
Now we need to specify which identity (in our case, **#hosts**) is going to host the service by setting up a bind service policy
```bash
/opt/ziti/ziti edge create service-policy ssh-bind Bind --identity-roles "#hosts" --service-roles '#rtrhosted' --semantic 'AnyOf'
```
## 4.6 Create Dial policies
Now we need to specify which identity (in this case, **#clients**) is going to intercept the service by setting up a dial service policy
```bash
/opt/ziti/ziti edge create service-policy ssh-dial Dial --identity-roles "#clients" --service-roles '#rtrhosted' --semantic 'AnyOf'
```
If both policies are setup correctly, you should see two service-policies.

![Diagram](/img/local_gw/LocalGW14.png)

# 5.0 Test the service

Connect to the Windows Client machine, open a cmd window.

First, try to **nslookup mysimpleservice.ziti**. This should resolve to a 100.64.0.* address. 

Then you should be able ssh to mysimpleservice.ziti.

![Diagram](/img/local_gw/LocalGW15.png)