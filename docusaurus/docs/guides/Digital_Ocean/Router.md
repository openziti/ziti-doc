---
sidebar_position: 30
sidebar_label: Router
title: Create new router
---
# 2.0 Configure new router using open ziti

## 2.1 Create an VM on Digital Ocean
Please follow **Section 1.1** of the [Controller Guide](/docs/guides/Digital_Ocean/Controller/) to setup an VM to be used as Router. 

## 2.2 Login and Update the repo and apps on VM
Once the VM is created, we can get the IP address of the droplet from the Resources screen. Login to the VM by using user "root" and IP address:
```bash
ssh root@<ip>
```

```bash
sudo apt update
sudo apt upgrade
```

## 2.3 Setup Router using ziti_router_auto_enroll

**ziti_router_auto_enroll** is an easy way to setup your router automatically.

### 2.3.1 Download binary
```bash
wget https://github.com/netfoundry/edge-router-registration/releases/latest/download/ziti_router_auto_enroll.tar.gz
tar xf ziti_router_auto_enroll.tar.gz
```
You should have a file **ziti_router_auto_enroll** under the directory.

For detail info on ziti_router_auto_enroll, please checkout this page on github: https://github.com/netfoundry/edge-router-registration/tree/main/ziti_router_auto_enroll

### 2.3.2 Info needed for create Router
In order to create the Router, the VM needs to contact controller. We need the following information before we can continue:
- Controller IP
- Controller Fabric Port: On the controller, issue this command **echo $ZITI_CTRL_PORT**
- Controller Management Port: On the controller, issue this command **echo $ZITI_EDGE_CONTROLLER_PORT**
- Controller Passwd: On the controller, issue this command **echo $ZITI_PWD**
- Router Name: Name for this router

### 2.3.3 Create Router
Here is information I gathered from previous step:
- Controller IP: 161.35.108.218
- Controller Fabric Port: 8440 **(default value if following controller setup guide)**
- Controller Management Port: 8441 **(default value if following controller setup guide)**
- Controller Passwd: Test@123
- Router Name: JAMES-ER-SF

We are also going to create the router without healthcheck section and metrics, so the following two options will be used to create the router:
- --disableHealthChecks
- --disableMetrics

If you choose to explore these two functionality, you can remove the options (from command line) when creating router.

#### 2.3.3.1 Create the Router with link listener
```
./ziti_router_auto_enroll -f -n --controller 161.35.108.218 --controllerFabricPort 8440 --controllerMgmtPort 8441 --adminUser admin --adminPassword Test@123 --assumePublic --disableHealthChecks --disableMetrics --routerName JAMES-ER-SF 
```
**output**
```
2023-04-05-04:07:44-INFO-Writing jwt file: JAMES-ER-SF_enrollment.jwt
2023-04-05-04:07:44-INFO-Version not specified, going to check with controller
2023-04-05-04:07:45-INFO-Found version 0.27.7
2023-04-05-04:07:45-INFO-Downloading file: https://github.com/openziti/ziti/releases/download/v0.27.7/ziti-linux-amd64-0.27.7.tar.gz
Downloading: 100%|████████████████████████████████████████████████████████████████████████████████████████████| 115M/115M [00:01<00:00, 67.3MiB/s]
2023-04-05-04:07:47-INFO-Successfully downloaded file
2023-04-05-04:07:47-INFO-Starting binary install
2023-04-05-04:07:50-INFO-Installing service unit file
2023-04-05-04:07:50-INFO-Creating config file
2023-04-05-04:07:50-INFO-Starting Router Enrollment
2023-04-05-04:07:54-INFO-Successfully enrolled Ziti
2023-04-05-04:07:54-INFO-Service ziti-router.service start successful.
Created symlink /etc/systemd/system/multi-user.target.wants/ziti-router.service → /etc/systemd/system/ziti-router.service.
2023-04-05-04:07:55-INFO-Service ziti-router.service enable successful.
```

**Alternative way of creating router**

Instead of passing parameters in the commandline to create routers, the parameters can be specified via environmental varibles. Here is example on how to accomplish that.
```
export CONTROLLER="161.35.108.218"
export CONTROLLERFABRICPORT="8440"
export CONTROLLERMGMTPORT="8441"
export ADMINUSER="admin"
export ADMINPASSWORD="Test@123"

./ziti_router_auto_enroll -f -n --assumePublic --disableHealthChecks --disableMetrics --routerName JAMES-ER-SF
```

#### 2.3.3.2 Create the Router with link listener and tunneler
```
./ziti_router_auto_enroll -f -n --controller 161.35.108.218 --controllerFabricPort 8440 --controllerMgmtPort 8441 --adminUser admin --adminPassword Test@123 --assumePublic --disableHealthChecks --disableMetrics --autoTunnelListener --routerName JAMES-ER-SF
```

#### 2.3.3.3 Create the Router with edge listener only (no link listener)
```
./ziti_router_auto_enroll -f -n --controller 161.35.108.218 --controllerFabricPort 8440 --controllerMgmtPort 8441 --adminUser admin --adminPassword Test@123 --disableHealthChecks --disableMetrics --routerName JAMES-ER-SF 
```
#### 2.3.3.4 Create the Router with edge listener and tunneler
```
./ziti_router_auto_enroll -f -n --controller 161.35.108.218 --controllerFabricPort 8440 --controllerMgmtPort 8441 --adminUser admin --adminPassword Test@123 --disableHealthChecks --disableMetrics --autoTunnelListener --routerName JAMES-ER-SF
```

## 2.4 Auto start the router
After enroll the router, a systemd service file is automatically created and enabled. To check the status of the service file, issue the following command:
```bash
systemctl status ziti-router
```
**Output**
```
● ziti-router.service - Ziti-Router
     Loaded: loaded (/etc/systemd/system/ziti-router.service; enabled; vendor preset: enabled)
     Active: active (running) since Wed 2023-04-05 14:45:59 UTC; 4s ago
   Main PID: 18381 (ziti)
      Tasks: 6 (limit: 2323)
     Memory: 16.5M
        CPU: 222ms
     CGroup: /system.slice/ziti-router.service
             └─18381 /opt/ziti/ziti router run /opt/ziti/config.yaml
```
If the status shows **active (running)**, then the setup finished correctly.

On the controller, you can check the status of the routers. Please refer to the controller guide (usefull command for the Router) section for more information.

