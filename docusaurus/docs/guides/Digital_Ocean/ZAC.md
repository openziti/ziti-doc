---
sidebar_position: 40
sidebar_label: ZAC
title: Ziti Admin Console
---

# 3.0 Ziti Admin Console (Optional)

This guide describes how to setup ZAC on the controller we stand up in the previous guide. We will need the **IP of the controller** before we start this guide.

## 3.1 Installation
### 3.1.1 login to controller
```bash
ssh root@<controller ip>
```
### 3.1.2 Install Node.js
Digital Ocean Community offers an extensive guide on how to [install Node.js](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-22-04). ZAC needs node and npm executables from Node.js v16+. So, use the "Installing Node.js with Apt from the Default Repositories" is not applicable. 

Here is how to install the version of node needed for ZAC.

Setup the repo:
```bash
cd ~
curl -sL https://deb.nodesource.com/setup_18.x -o nodesource_setup.sh
sudo bash nodesource_setup.sh
```

**output**
```
## Installing the NodeSource Node.js 18.x repo...


## Populating apt-get cache...

+ apt-get update
Hit:1 http://mirrors.digitalocean.com/ubuntu jammy InRelease
Get:2 http://mirrors.digitalocean.com/ubuntu jammy-updates InRelease [119 kB]
Hit:3 https://repos-droplet.digitalocean.com/apt/droplet-agent main InRelease
Get:4 http://mirrors.digitalocean.com/ubuntu jammy-backports InRelease [108 kB]
Hit:5 http://security.ubuntu.com/ubuntu jammy-security InRelease
Fetched 226 kB in 1s (185 kB/s)
Reading package lists... Done

## Confirming "jammy" is supported...

+ curl -sLf -o /dev/null 'https://deb.nodesource.com/node_18.x/dists/jammy/Release'

## Adding the NodeSource signing key to your keyring...

+ curl -s https://deb.nodesource.com/gpgkey/nodesource.gpg.key | gpg --dearmor | tee /usr/share/keyrings/nodesource.gpg >/dev/null

## Creating apt sources list file for the NodeSource Node.js 18.x repo...

+ echo 'deb [signed-by=/usr/share/keyrings/nodesource.gpg] https://deb.nodesource.com/node_18.x jammy main' > /etc/apt/sources.list.d/nodesource.list
+ echo 'deb-src [signed-by=/usr/share/keyrings/nodesource.gpg] https://deb.nodesource.com/node_18.x jammy main' >> /etc/apt/sources.list.d/nodesource.list

## Running `apt-get update` for you...

+ apt-get update
Hit:1 http://mirrors.digitalocean.com/ubuntu jammy InRelease
Hit:2 http://mirrors.digitalocean.com/ubuntu jammy-updates InRelease
Hit:3 https://repos-droplet.digitalocean.com/apt/droplet-agent main InRelease
Get:4 https://deb.nodesource.com/node_18.x jammy InRelease [4563 B]
Hit:5 http://mirrors.digitalocean.com/ubuntu jammy-backports InRelease
Hit:6 http://security.ubuntu.com/ubuntu jammy-security InRelease
Get:7 https://deb.nodesource.com/node_18.x jammy/main amd64 Packages [776 B]
Fetched 5339 B in 1s (3745 B/s)
Reading package lists... Done

## Run `sudo apt-get install -y nodejs` to install Node.js 18.x and npm
## You may also need development tools to build native addons:
     sudo apt-get install gcc g++ make
## To install the Yarn package manager, run:
     curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor | sudo tee /usr/share/keyrings/yarnkey.gpg >/dev/null
     echo "deb [signed-by=/usr/share/keyrings/yarnkey.gpg] https://dl.yarnpkg.com/debian stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
     sudo apt-get update && sudo apt-get install yarn
```

Install nodejs:
```bash
sudo apt install nodejs
```
**output**
```
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
The following NEW packages will be installed:
  nodejs
0 upgraded, 1 newly installed, 0 to remove and 1 not upgraded.
Need to get 28.7 MB of archives.
After this operation, 187 MB of additional disk space will be used.
Get:1 https://deb.nodesource.com/node_18.x jammy/main amd64 nodejs amd64 18.15.0-deb-1nodesource1 [28.7 MB]
Fetched 28.7 MB in 0s (72.5 MB/s)
Selecting previously unselected package nodejs.
(Reading database ... 93864 files and directories currently installed.)
Preparing to unpack .../nodejs_18.15.0-deb-1nodesource1_amd64.deb ...
Unpacking nodejs (18.15.0-deb-1nodesource1) ...
Setting up nodejs (18.15.0-deb-1nodesource1) ...
Processing triggers for man-db (2.10.2-1) ...
Scanning processes...
Scanning candidates...
Scanning linux /docusaurus/static/img/imagees...

Restarting services...
Service restarts being deferred:
 systemctl restart networkd-dispatcher.service
 systemctl restart unattended-upgrades.service

No containers need to be restarted.

No user sessions are running outdated binaries.

No VM guests are running outdated hypervisor (qemu) binaries on this host.
```

Check the node version:
```bash
node -v
```

**output**
```
v18.15.0
```
**Make sure this version is higher than v16**

### 3.1.3 Install ziti-console
```bash
source ~/.ziti/quickstart/$(hostname -s)/$(hostname -s).env
cd ~/
git clone https://github.com/openziti/ziti-console.git "${ZITI_HOME}/ziti-console"
cd "${ZITI_HOME}/ziti-console"
npm install
```

## 3.2 Link Certificates
We are using the controller certificates for ZAC

```bash
ln -s "${ZITI_PKI}/${ZITI_EDGE_CONTROLLER_HOSTNAME}-intermediate/certs/${ZITI_EDGE_CONTROLLER_HOSTNAME}-server.chain.pem" "${ZITI_HOME}/ziti-console/server.chain.pem"
ln -s "${ZITI_PKI}/${ZITI_EDGE_CONTROLLER_HOSTNAME}-intermediate/keys/${ZITI_EDGE_CONTROLLER_HOSTNAME}-server.key" "${ZITI_HOME}/ziti-console/server.key"
```

## 3.3 Setup systemd service to start ZAC
```bash
source /dev/stdin <<< "$(wget -qO- https://get.openziti.io/quick/ziti-cli-functions.sh)";createZacSystemdFile
sudo cp "${ZITI_HOME}/ziti-console.service" /etc/systemd/system
sudo systemctl enable ziti-console
sudo systemctl start ziti-console
```
**output**
```
ziti-console systemd file written to: /root/.ziti/quickstart/James-NC/ziti-console.service
Created symlink /etc/systemd/system/multi-user.target.wants/ziti-console.service → /etc/systemd/system/ziti-console.service.
```

Check the status of the ZAC:
```bash
systemctl status ziti-console
```
**output**
```
● ziti-console.service - Ziti-Console
     Loaded: loaded (/etc/systemd/system/ziti-console.service; enabled; vendor preset: enabled)
     Active: active (running) since Wed 2023-04-05 18:23:11 UTC; 56s ago
   Main PID: 22098 (node)
      Tasks: 11 (limit: 2323)
     Memory: 31.1M
        CPU: 991ms
     CGroup: /system.slice/ziti-console.service
             └─22098 /usr/bin/node /root/.ziti/quickstart/James-NC/ziti-console/server.js
```
If the status shows **active (running)**, then the setup finished correctly.

## 3.4 Login and use ZAC
Now we can access ZAC via **https://<controller-ip\>:8443** using a browser.
```
Example: https://157.245.203.171:8443/
```
### 3.4.1 connection is not private
Since we are using **self-signed certificate** during installation, the browser will display warning for accessing the ZAC.

![Diagram](/img/digital_ocean/ZAC1.jpg)

Click on **Advanced**, then click **Proceed to xx.xx.xx.xx (unsafe)** to continue.

### 3.4.2 Setup Controller Info on the ZAC

Eventhough Controller and ZAC are running on the same VM, ZAC is still a separate entity.  We will need to setup the controller Info.

On the ZAC welcome screen, setup the controller name, and the URL (controller-ip:8441)

![Diagram](/img/digital_ocean/ZAC2.jpg)

Hit **SET CONTROLLER** to continue

### 3.4.2 Login to Controller on the ZAC
You will need the username (**admin**) and password to login to the controller.  Please refer to Controller Guide on how to find your password if you forget your password.

![Diagram](/img/digital_ocean/ZAC3.jpg)

After enter the correct password, you will enter the Dashboard.  From there, you can setup / manage your ziti network.

![Diagram](/img/digital_ocean/ZAC4.jpg)
