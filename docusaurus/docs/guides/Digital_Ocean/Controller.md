---
sidebar_position: 20
sidebar_label: Controller
title: Controller Config 
---

# 1.0 Configure the controller
## 1.1 Create an VM on Digital Ocean
Login to the Digital Ocean console, create a **Droplets** from the dropdown menu on the upper right hand side.

![Diagram](/img/digital_ocean/Create1.jpg)

On the "Create Droplets" screen, Choose "**Ubuntu**", version "**22.04**". For the Size, choose the appropriate size for your application.  For this guide, a smaller size was used. 
![Diagram](/img/digital_ocean/Create2.jpg)

Next, choose a ssh-key to login to the VM. (We highly discourage login to the VM using Password), then **Create Droplet**
![Diagram](/img/digital_ocean/Create3.jpg)

## 1.2 Login and Update the repo and apps on VM
Once the VM is created, we can get the IP address of the droplet from the Resources screen. Login to the VM by using user "root" and IP address:
```bash
ssh root@<ip>
```

```bash
sudo apt update
sudo apt upgrade
```

## 1.3 Firewall

### 1.3.1 Digital Ocean firewall
By default, digital ocean does not setup a firewall for the VMs. If you turn on the firewall, please make sure the following ports are open.
- 8440/tcp: Edge Controller providing router control plane
- 8441/tcp: Edge Controller providing client sessions
- 8442/tcp: Edge Router providing client connections
- *8443/tcp: Ziti Admin Console (ZAC) [optional]*

![Diagram](/img/digital_ocean/Controller1.jpg)

### 1.3.2 ufw 
The ufw is also disabled on the Ubuntu22.04 machine by default.  If you turn on the ufw (or other firewalls on the OS), please make sure port 8440-8443/tcp are open

## 1.4 Prerequisites

### 1.4.1 Install jq and curl
```bash
sudo apt install jq -y
sudo apt install curl -y
```

### 1.4.2 Setup Variable for Install

```bash
export EXTERNAL_DNS="$(curl -s eth0.me)"
export EXTERNAL_IP="$(curl -s eth0.me)"
export ZITI_EDGE_CONTROLLER_IP_OVERRIDE="${EXTERNAL_IP}"
export ZITI_EDGE_ROUTER_IP_OVERRIDE="${EXTERNAL_IP}"
export ZITI_EDGE_CONTROLLER_HOSTNAME="${EXTERNAL_DNS}"
export ZITI_EDGE_ROUTER_HOSTNAME="${EXTERNAL_DNS}"
export ZITI_CTRL_PORT=8440
export ZITI_EDGE_CONTROLLER_PORT=8441
export ZITI_EDGE_ROUTER_PORT=8442
```
 

## 1.5 Run expressInstall
```bash
source /dev/stdin <<< "$(wget -qO- https://get.openziti.io/quick/ziti-cli-functions.sh)"; expressInstall
```
**Example Output:**
```

                          _   _     _
                    ____ (_) | |_  (_)
                   |_  / | | | __| | |
                    / /  | | | |_  | |
                   /___| |_|  \__| |_|
-------------------------------------------------------------

This script will make it trivial to setup a very simple environment locally which will allow you to start
learning ziti. This environment is suitable for development work only and is not a decent representation of
a fully redundant production-caliber network.

Please note that this script will write files to your home directory into a directory named .ziti.
For you this location will be: /root/.ziti/quickstart

Prerequisites confirmed
Let's get started creating your local development network!


___________   _______________________________________^__
 ___   ___ |||  ___   ___   ___    ___ ___  |   __  ,----\
|   | |   |||| |   | |   | |   |  |   |   | |  |  | |_____\
|___| |___|||| |___| |___| |___|  | O | O | |  |  |        \
           ||| ===== EXPRESS ==== |___|___| |  |__|         )
___________|||______________________________|______________/
           |||                                        /--------
-----------'''---------------------------------------'

ZITI_EDGE_CONTROLLER_HOSTNAME OVERRIDDEN: 165.22.60.124
ZITI_EDGE_ROUTER_HOSTNAME OVERRIDDEN: 165.22.60.124
ZITI_EDGE_ROUTER_PORT OVERRIDDEN: 8442

******** Setting Up Environment ********
using default ZITI_HOME: /root/.ziti/quickstart/OMSINER
ZITI HOME SET TO: /root/.ziti/quickstart/OMSINER
ZITI_BINARIES_VERSION: v0.27.5
Downloading https://github.com/openziti/ziti/releases/download/v0.27.5/ziti-linux-amd64-0.27.5.tar.gz to /root/.ziti/quickstart/OMSINER/ziti-bin/ziti-linux-amd64-0.27.5.tar.gz
UNZIPPING /root/.ziti/quickstart/OMSINER/ziti-bin/ziti-linux-amd64-0.27.5.tar.gz into: /root/.ziti/quickstart/OMSINER/ziti-bin/ziti-v0.27.5
Marking executables at /root/.ziti/quickstart/OMSINER/ziti-bin/ziti-v0.27.5 executable
Generating new network with name: OMSINER
ZITI_NETWORK set to: OMSINER
Do you want to keep the generated admin password 'HxuNryY0frWCJmov2o0dU7GoQfeJTjeX'? (Y/n) n
Type the preferred admin password and press <enter>Test@123
env file written to: /root/.ziti/quickstart/OMSINER/OMSINER.env
environment file sourced from: /root/.ziti/quickstart/OMSINER/OMSINER.env
Checking if Controller's port (8440) is available
Checking if Edge Router's port (8442) is available
Checking if Edge Controller's port (8441) is available
Checking if Controller Management Plane's port (10000) is available

******** Setting Up Public Key Infrastructure ********
Generating PKI
Creating CA: OMSINER-root-ca
Success

Creating CA: 165.22.60.124-root-ca
Success

Creating CA: OMSINER-signing-root-ca
Success

Creating intermediate: OMSINER-root-ca OMSINER-intermediate 1
Using CA name:  OMSINER-root-ca
Success

Creating intermediate: 165.22.60.124-root-ca 165.22.60.124-intermediate 1
Using CA name:  165.22.60.124-root-ca
Success

Creating intermediate: OMSINER-signing-root-ca OMSINER-signing-intermediate_spurious_intermediate 2
Using CA name:  OMSINER-signing-root-ca
Success

Creating intermediate: OMSINER-signing-intermediate_spurious_intermediate OMSINER-signing-intermediate 1
Using CA name:  OMSINER-signing-intermediate_spurious_intermediate
Success

Creating server cert from ca: OMSINER-intermediate for OMSINER,localhost,OMSINER,165.22.60.124,165.22.60.124 / 127.0.0.1,165.22.60.124,165.22.60.124
Using CA name:  OMSINER-intermediate
Success
Creating client cert from ca: OMSINER-intermediate for OMSINER,localhost,OMSINER,165.22.60.124,165.22.60.124
Using CA name:  OMSINER-intermediate
Success

Creating server cert from ca: 165.22.60.124-intermediate for OMSINER,localhost,OMSINER,165.22.60.124,165.22.60.124 / 127.0.0.1,165.22.60.124,165.22.60.124
Using CA name:  165.22.60.124-intermediate
Success
Creating client cert from ca: 165.22.60.124-intermediate for OMSINER,localhost,OMSINER,165.22.60.124,165.22.60.124
Using CA name:  165.22.60.124-intermediate
Success

******** Setting Up Controller ********
wrote CA file to: /root/.ziti/quickstart/OMSINER/pki/cas.pem
Controller configuration file written to: /root/.ziti/quickstart/OMSINER/OMSINER.yaml
ziti-controller initialized. see /root/.ziti/quickstart/OMSINER/OMSINER-init.log for details
[1] 20616
ziti-controller started as process id: 20616. log located at: /root/.ziti/quickstart/OMSINER/OMSINER.log
waiting for the controller to come online to allow the edge router to enroll
waiting for https://165.22.60.124:8441
Token: 74b7d95e-3949-4bf3-ac7c-f0654e17c975
Saving identity 'default' to /root/.ziti/quickstart/OMSINER/ziti-cli.json

******** Setting Up Edge Routers ********
----------  Creating an edge router policy allowing all identities to connect to routers with a #public attribute
----------  Creating a service edge router policy allowing all services to use #public edge routers
USING ZITI_EDGE_ROUTER_RAWNAME: OMSINER-edge-router
Creating server cert from ca: OMSINER-intermediate for OMSINER-edge-router,localhost,127.0.0.1,OMSINER / 165.22.60.124
Using CA name:  OMSINER-intermediate
Success
Creating client cert from ca: OMSINER-intermediate for OMSINER-edge-router,localhost,127.0.0.1,OMSINER
Using CA name:  OMSINER-intermediate
Success

edge router configuration file written to: /root/.ziti/quickstart/OMSINER/OMSINER-edge-router.yaml
----------  Creating edge-router OMSINER-edge-router....
----------  Enrolling edge-router OMSINER-edge-router....

Controller stopped.
Edge Router enrolled. Controller stopped.

Congratulations. Express setup complete!
Start your Ziti Controller by running the function: startController
Start your Ziti Edge Router by running : startRouter

[1]+  Done                    "${ZITI_BIN_DIR-}/ziti-controller" run "${ZITI_HOME_OS_SPECIFIC}/${ZITI_EDGE_CONTROLLER_RAWNAME}.yaml" &> "${log_file}"
```
## 1.6 Systemd service files
### 1.6.1 Generate systemd service files
We provide command to generate systemd service files:
```bash
createControllerSystemdFile
createRouterSystemdFile "${ZITI_EDGE_ROUTER_RAWNAME}"
```
**Output:**
```
Controller systemd file written to: /root/.ziti/quickstart/OMSINER/OMSINER.service
Router systemd file written to: /root/.ziti/quickstart/OMSINER/OMSINER-edge-router.service
```
### 1.6.2 Install and Enable systemd service files
After the systemd service units are generated, you can then install them by running:
```bash
sudo cp "${ZITI_HOME}/${ZITI_EDGE_CONTROLLER_RAWNAME}.service" /etc/systemd/system/ziti-controller.service
sudo cp "${ZITI_HOME}/${ZITI_EDGE_ROUTER_RAWNAME}.service" /etc/systemd/system/ziti-router.service
sudo systemctl enable ziti-controller
sudo systemctl enable ziti-router
```
**Output:**
```
Created symlink /etc/systemd/system/multi-user.target.wants/ziti-controller.service → /etc/systemd/system/ziti-controller.service.
Created symlink /etc/systemd/system/multi-user.target.wants/ziti-router.service → /etc/systemd/system/ziti-router.service.
```

### 1.6.3 Start the Controller and Router
**Controller**
```bash
sudo systemctl start ziti-controller
```
**Router**
```bash
sudo systemctl start ziti-router
```

### 1.6.4 Check the status of Controller and Router
```bash
systemctl status ziti-controller
```
```bash
systemctl status ziti-router
```
**Output:**
```
ziti-controller.service - Ziti-Controller
     Loaded: loaded (/etc/systemd/system/ziti-controller.service; enabled; preset: enabled)
     Active: active (running) since Tue 2023-02-28 07:23:29 UTC; 3min 2s ago
   Main PID: 20883 (ziti-controller)
      Tasks: 7 (limit: 2323)
     Memory: 47.1M
        CPU: 1.065s
     CGroup: /system.slice/ziti-controller.service
             └─20883 /root/.ziti/quickstart/OMSINER/ziti-bin/ziti-v0.27.5/ziti-controller run /root/.ziti/quickstart/OMSINER/OMSINER.yaml
ziti-router.service - Ziti-Router for OMSINER-edge-router
     Loaded: loaded (/etc/systemd/system/ziti-router.service; enabled; preset: enabled)
     Active: active (running) since Tue 2023-02-28 07:23:32 UTC; 2min 59s ago
   Main PID: 20927 (ziti-router)
      Tasks: 8 (limit: 2323)
     Memory: 21.0M
        CPU: 1.049s
     CGroup: /system.slice/ziti-router.service
             └─20927 /root/.ziti/quickstart/OMSINER/ziti-bin/ziti-v0.27.5/ziti-router run /root/.ziti/quickstart/OMSINER/OMSINER-edge-ro…
```

If the status shows **active (running)**, then the setup finished correctly.

## 1.7 Helpers

### 1.7.1 Add Environment Variables Back to the Shell
Source the environment variables when you log back in the shell
```bash
source ~/.ziti/quickstart/$(hostname -s)/$(hostname -s).env
```
**Output:**
```
  adding /root/.ziti/quickstart/OMSINER/ziti-bin/ziti-v0.27.5 to the path
```
If the environment variables are sourced correctly, you can do the following to check:
```bash
echo $ZITI_HOME
```
**Output:**
```
/root/.ziti/quickstart/OMSINER
```
 
### 1.7.2 Change Ziti edge admin password
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

### 1.7.3 Some usefull command for the Router
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