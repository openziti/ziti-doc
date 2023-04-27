---
sidebar_position: 20
sidebar_label: Using Ziti-Edge-Tunnel
title: Ziti-Edge-Tunnel as Gateway
---
# 1.0 Introduction

## 1.1 Network Description
This guide demonstrates how to setup LAN gateways with **Ziti-Edge-Tunnel** for the purpose of transferring data between non-Ziti endpoints across Ziti Fabric.

For the demonstration, we will setup the network like below:

---
![Diagram](/img/local_gw/LocalGW21.png)

---

- There are two Ziti-Edge-Tunnels (**local-tunnel** and **remote-tunnel**) as LAN gateways. 
- The Windows machine (**Windows Client**) is in the same subnet (172.16.31.0/24) as Tunneller (**local-tunnel**).
- The Ubuntu 22.04 server (**Ubuntu Server**) is in the same subnet (172.16.240.0/24) as Tunneller (**remote-tunnel**).
- The data (ssh) will be passed between the Windows Client and the Ubuntu Server.


## 1.2 Prerequisite
Please complete the following steps before continue with this demo.
- An open-ziti network should be created already. If not, please follow this quickstart [Host OpenZiti Anywhere](/docs/learn/quickstarts/network/hosted/) guide to setup open-ziti network first.
- Created two *tunnellers* already. The tunnelers should be running on **Ubuntu 22.04**. Please note, we support wide range of OSes for tunneler deployment. However, this demo uses Ubuntu 22.04 as example. 
- Created one *windows client* already. Suggested windows version Windows 10 or Windows 11. Windows servers should work fine as well.
- Created one *ubuntu server* already. This can be any server capable of accepting ssh connection.

# 2.0 Setup Tunnellers
## 2.1 Create Tunnellers on the Controller
Login to your controller and create two identities named **local-tunnel** and **remote-tunnel**
```
ssh <user>@68.183.139.122
```
Then source the environmental file (only need to perform once per login).  
```bash
source ~/.ziti/quickstart/$(hostname -s)/$(hostname -s).env
```
Login to ziti cli.
```bash
zitiLogin
```
Create identities.
```bash
ziti edge create identity user local-tunnel -o local-tunnel.jwt
ziti edge create identity user remote-tunnel -o remote-tunnel.jwt
```
**output**
```
root@LocalGWDemoNC:~# ziti edge create identity user local-tunnel -o local-tunnel.jwt
New identity local-tunnel created with id: PVen7KeIY5
Enrollment expires at 2023-04-26T23:02:10.200Z
root@LocalGWDemoNC:~# ziti edge create identity user remote-tunnel -o remote-tunnel.jwt
New identity remote-tunnel created with id: LtnYRL2IY
Enrollment expires at 2023-04-26T23:06:01.955Z
root@LocalGWDemoNC:~# ls -l *jwt
-rw------- 1 root root 893 Apr 26 20:02 local-tunnel.jwt
-rw------- 1 root root 892 Apr 26 20:06 remote-tunnel.jwt
```
**add attribute to the identity**, now we want to update the identities to have some attribute. The local-tunnel has attribute "clients". The remote-tunnel has attribute "hosts".
```bash
ziti edge update identity local-tunnel -a clients
ziti edge update identity remote-tunnel -a hosts
```
![Diagram](/img/local_gw/LocalGW22.png)

## 2.2 Setup the Tunneller For Windows Subnet
### 2.2.1 Register Identities
Login to your **local-tunnel** machine/VM. Follow [Install Linux Package:](/docs/reference/tunnelers/linux/) **Ubuntu Jammy 22.04** section to install and register your ziti-edge-tunnel. Use the **local-tunnel.jwt** created earlier for its identity token.

After the tunnel is registered, check the status and make sure it is running correctly. The status should show "active (running)"

![Diagram](/img/local_gw/LocalGW23.png)

### 2.2.2 setup ufw
The following steps turn on the ufw firewall and opens the ports for this demo.
```bash
sudo ufw enable
sudo ufw allow from any to 172.16.31.175/32 port 53 proto udp
sudo ufw allow from any to 172.16.31.175/32 port 22 proto tcp
sudo ufw allow from any to 172.16.31.175/32 port 80 proto tcp
```
### 2.2.3 setup forwarding
First setup IP forwarding in the Linux system.
```bash
echo "net.ipv4.ip_forward = 1" | sudo tee /etc/sysctl.d/01-ipforward.conf >/dev/null
sudo sysctl -p /etc/sysctl.d/01-ipforward.conf
```
Second, setup forwarding from local interface to the tun0.

Find the local interface first, if you have only one local interface, this command can help you find the name of the interface.
```bash
ip -o -4 route show to default | awk '{print $5}'
```
**output**
```
ziggy@local-tunnel:~$ ip -o -4 route show to default | awk '{print $5}'
ens160
```
Now setup the forwarding
```bash
sudo ufw route allow in on ens160 out on tun0
```

## 2.3 Setup the Router For Ubuntu Server Subnet
### 2.3.1 Register Identities
Login to your **remote-tunnel** machine/VM. Register the Tunneler follow the previous section. This time use **remote-tunnel.jwt** as the token.
### 2.3.2 setup ufw
```bash
sudo ufw enable
sudo ufw allow from any to 172.16.240.130/32 port 53 proto udp
sudo ufw allow from any to 172.16.240.130/32 port 22 proto tcp
```

# 3.0 Setup Client and Server

## 3.1 Ubuntu Server

The Ubuntu Server needs to support **ssh** for our demo.

We also have a service for http, so we need to setup http server on this machine.
```bash
echo "You have reached Remote Web Server." >hello.txt
python3 -m http.server
```

The web server will be listening on the port 8000.

## 3.2 Windows Client
There are two changes we need to make on the windows side.

The first one, we need to change the configuration of the preferred DNS to point to our resolver on the **local-tunnel**, the resolver is listening on "100.64.0.2".

![Diagram](/img/local_gw/LocalGW24.png)

The second change is to setup routing.  We need to route the 100.64.0.0/10 traffic to our **local-tunnel**. And for any IP based traffic redirecting, we also need to setup route to our Tunneler as well. For the demo, we are routing traffics destine for **172.16.240.129**.
To do this, open an cmd window as Administrator.
```bash
route add 100.64.0.0 mask 255.192.0.0 172.16.31.175
route add 172.16.240.129 mask 255.255.255.255 172.16.31.175
```
![Diagram](/img/local_gw/LocalGW25.png)

# 4.0 ssh Service Configuration

The service configuration are done on the controller. Login to the controller and connect to ziti cli first.
```
ssh <user>@68.183.139.122
```
```bash
source ~/.ziti/quickstart/$(hostname -s)/$(hostname -s).env
zitiLogin
```

## 4.1 Create an intercept.v1 config
This config is used for local side connection. We are setting up intercept on dns name "mysimpleservice.ziti"

```bash
ziti edge create config ssh-intercept-config intercept.v1 '{"protocols": ["tcp"], "addresses": ["mysimpleservice.ziti"], "portRanges": [{"low": 22, "high": 22}]}'
```

## 4.2 Create a host.v1 config
This config is used for remote side connection. We are setting up the address the remote server can reach. In this demo, We are dropping the traffic off at "172.16.240.129"

```bash
ziti edge create config ssh-host-config host.v1 '{"address":"172.16.240.129", "protocol":"tcp", "port":22}'
```

If the command finished successfully, you will see two configs:

![Diagram](/img/local_gw/LocalGW26.png)

## 4.3 Create Service
Now we need to put these two configs into a service. We going to name the service "ssh" and assign an attribute "tun-hosted"

```bash
ziti edge create service ssh -c ssh-intercept-config,ssh-host-config -a tun-hosted
```

**Check Service**
![Diagram](/img/local_gw/LocalGW27.png)

## 4.4 Create Service-Edge-Router-Policy
This step is **optional** since the default service-edge-router-policy already includes all services to all routers.

But in case you need to add a policy, here is the command to add the service tag we created (tun-hosted) to all routers
```bash
ziti edge create service-edge-router-policy ssh-serp --edge-router-roles '#all' --service-roles '#tun-hosted' --semantic 'AnyOf'
```
![Diagram](/img/local_gw/LocalGW28.png)

## 4.5 Create Bind policies
Now we need to specify which identity (in our case, **#hosts**) is going to host the service by setting up a bind service policy
```bash
ziti edge create service-policy ssh-bind Bind --identity-roles "#hosts" --service-roles '#tun-hosted' --semantic 'AnyOf'
```
## 4.6 Create Dial policies
Now we need to specify which identity (in this case, **#clients**) is going to intercept the service by setting up a dial service policy
```bash
ziti edge create service-policy ssh-dial Dial --identity-roles "#clients" --service-roles '#tun-hosted' --semantic 'AnyOf'
```
If both policies are setup correctly, you should see two service-policies.

![Diagram](/img/local_gw/LocalGW29.png)

## 4.7 Create Edge-Router-Policy and Public Edge-Router
The Tunnellers need to connect to Public Edge-Router to pass traffic as depict in the network diagram. 

If you decided to create another Edge-Router for your testing, you can follow guide "[Ziti-Edge-Router as Gateway](/docs/guides/Local_Gateway/EdgeRouter/)" to setup your edge router.

Once your edge router is setup, make sure it is assigned to all identities. The easiest way to accomplish this is to set your edge router's attribute to "#public". 

The quickstart already created an public router and edge-router-policy. 


![Diagram](/img/local_gw/LocalGW30.png)

## 4.8 Test the service

Connect to the Windows Client machine, open a cmd window.

First, try to **nslookup mysimpleservice.ziti**. This should resolve to a 100.64.0.* address. 

Then you should be able ssh to mysimpleservice.ziti.

![Diagram](/img/local_gw/LocalGW31.png)

# 5.0 http Service Configuration
In this section, we going to show how to setup interception via IP address. In the previous section (3.2 Windows Client), we already setup the routing on windows to route the intercept traffic to local-tunnel node. (route add 172.16.240.129 mask 255.255.255.255 172.16.31.175)

The service configuration are done on the controller. Login to the controller and connect to ziti cli first.
```
ssh <user>@68.183.139.122
```
```bash
source ~/.ziti/quickstart/$(hostname -s)/$(hostname -s).env
zitiLogin
```

## 5.1 Create an intercept.v1 config
```bash
ziti edge create config http-intercept-config intercept.v1 '{"protocols": ["tcp"], "addresses": ["172.16.240.129"], "portRanges": [{"low": 80, "high": 80}]}'
```

## 5.2 Create a host.v1 config
This config is used for remote side connection. We are setting up the address the remote server can reach. In this demo, We are dropping the traffic off at "172.16.240.129"

```bash
ziti edge create config http-host-config host.v1 '{"address":"172.16.240.129", "protocol":"tcp", "port":8000}'
```

If the command finished successfully, you will see two configs:

![Diagram](/img/local_gw/LocalGW32.png)

## 5.3 Create Service
Now we need to put these two configs into a service. We going to name the service "http" and assign an attribute "tun-hosted"

```bash
ziti edge create service http -c http-intercept-config,http-host-config -a tun-hosted
```
**Check Service**
![Diagram](/img/local_gw/LocalGW33.png)

## 5.4 Service-Edge-Router-Policy
This is done already. Please make sure there is a service-edge-router-policy for service tag (tun-hosted) to all routers.

![Diagram](/img/local_gw/LocalGW28.png)

## 5.5 Bind and Dial policies
We can also reused the Bind and Dial policies we created earlier. Since our host identity (#hosts) and service attribute (#tun-hosted) did not change for bind policy. And our client identity (#clients) and service attribute (#tun-hosted) did not change for dial policy.

![Diagram](/img/local_gw/LocalGW29.png)

## 5.6 Test the service

Connect to the Windows Client machine, open a webbrowser. Enter this address (http://172.16.240.129/hello.txt). You should see the text we entered earlier on the ubuntu server: (You have reached Remote Web Server.)


![Diagram](/img/local_gw/LocalGW34.png)