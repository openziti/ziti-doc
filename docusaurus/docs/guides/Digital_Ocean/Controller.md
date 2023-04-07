---
sidebar_position: 20
sidebar_label: Controller
title: Controller Config 
---

# 1.0 Configure the controller
## 1.1 Create a VM on Digital Ocean
Login to the Digital Ocean console, create a **Droplets** from the dropdown menu on the upper right hand side.

![Diagram](/img/digital_ocean/Create1.jpg)

On the "Create Droplets" screen, Choose "**Ubuntu**", version "**22.04**". For the Size, choose the appropriate size for your application.  For this guide, a smaller size was used. 
![Diagram](/img/digital_ocean/Create2.jpg)

Next, choose a ssh-key to login to the VM. (We highly discourage login to the VM using Password), then **Create Droplet**
![Diagram](/img/digital_ocean/Create3.jpg)

## 1.2 Login and Setup Controller
Once the VM is created, we can get the IP address of the droplet from the Resources screen. Login to the VM by using user "root" and IP address:
```bash
ssh root@<ip>
```

Then follow the [Host OpenZiti Anywhere](/docs/learn/quickstarts/network/hosted/) to setup the controller. Skip the setup for the "EXTERNAL_DNS" when following the guide.

## 1.3 Helpers

Following helpers are needed to complete the guides for router and services.

### 1.3.1 Add Environment Variables Back to the Shell
Source the environment variables when you log back in the shell
```bash
source ~/.ziti/quickstart/$(hostname -s)/$(hostname -s).env
```

If the environment variables are sourced correctly, you can do the following to check:
```bash
echo $ZITI_HOME
```
**Output:**
```
/root/.ziti/quickstart/OMSINER
```
 
### 1.3.2 Change Ziti edge admin password
Find the Current admin edge login password of controller (if you forget the password):
```bash
grep "export ZITI_PWD" ~/.ziti/quickstart/$(hostname -s)/$(hostname -s).env
```
Or if you have environment variable setup correctly:
```bash
echo $ZITI_PWD
```
To update the passwd
```bash
ziti edge update authenticator updb -s
```
**Important:** if you change the password, you must update the passwd (ZITI_PWD) in the "~/.ziti/quickstart/$(hostname -s)/$(hostname -s).env" file. 

### 1.3.3 Some useful command for the Router
** login the CLI**
```bash
zitiLogin
```

**Verify ER status**
```
ziti edge list edge-routers
```

**Delete the ER**
```
ziti edge delete edge-routers $ROUTER_NAME
ziti edge delete edge-routers $ROUTER_ID
```

**Update the ER**
```
ziti edge update edge-router $ROUTER_NAME [flags]
ziti edge update edge-router $ROUTER_ID [flags]
```
example to update attributes: 
```
ziti edge update edge-router $ROUTER_NAME -a private
```
