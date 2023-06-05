---
sidebar_position: 20
sidebar_label: Controller
title: Controller Config 
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 1.0 Configure the controller
## 1.1 Create a VM to be used as the Controller

<Tabs
  defaultValue="DigitalOcean"
  values={[
      { label: 'Digital Ocean', value: 'DigitalOcean', },
      { label: 'Azure', value: 'Azure', },
      { label: 'AWS', value: 'AWS', },
      { label: 'Google Cloud', value: 'GCP', },
  ]}
>
<TabItem value="DigitalOcean">

Login to the Digital Ocean console, create a **Droplets** from the dropdown menu on the upper right hand side.

![Diagram](/img/public_cloud/Create1.jpg)

On the "Create Droplets" screen, Choose "**Ubuntu**", version "**22.04**". For the Size, choose the appropriate size for your application.  For this guide, a smaller size was used. 
![Diagram](/img/public_cloud/Create2.jpg)

Next, choose a ssh-key to login to the VM. (We highly discourage login to the VM using Password), then **Create Droplet**
![Diagram](/img/public_cloud/Create3.jpg)
</TabItem>
<TabItem value="Azure">

Login to the Azure console, create a resource from the Azure services on the upper right hand side.

![Diagram](/img/public_cloud/Create-Azure1.jpg)

On the "Create" screen, Choose "**Ubuntu Server 22.04 LTS**".

- From the project details select the **Subscription** to manage deployed resources and costs. 
- Use **resource group** to organize and manage all your resources.
- In the **Instance details** section, enter the **VM name**.
- Select the **Region** to host your VM.
- Leave default **Availability options**, **Security type**(Standard).
- Leave the selected image **Ubuntu Server 22.04 LTS x64 Gen2**.

For the Size, choose the appropriate size for your application.  For this guide, **Standard_B2s(2CPU,4 GB)** size was used.

![Diagram](/img/public_cloud/Create-Azure2.jpg)

- Next, choose a ssh-key to login to the VM. 
- Enter an username (**remember the username, you will need it to login to the VM**).
- Choose your ssh key (We highly discourage login to the VM using Password). 
- For **inbound ports**, select the ssh. You can add extra port based on open ziti requirement. 
- Leave everything default in disks. 

Then **Create VM**
![Diagram](/img/public_cloud/Create-Azure3.jpg)

- In the networking tab select the **Virtual network**
- select the **Subnet**
- Select the auto generated **Public IP**.
- Leave the **NIC network security group** "none". 

Then press **Review + create**

![Diagram](/img/public_cloud/Create-Azure4.jpg)

Once the Validation passed. Press **Create** to create VM.
![Diagram](/img/public_cloud/Create-Azure5.jpg)


</TabItem>
<TabItem value="AWS">

- login to the AWS console. 
- go to the EC2 dashboard. 
- Click on the instance. 
- Launch the instance

![Diagram](/img/public_cloud/Create-AWS1.jpg)

- Name the instance.
![Diagram](/img/public_cloud/Create-AWS2.jpg)

- On the Quick start select **ubuntu**. 
- Select the ubuntu server 22.04 LTS. 
- Select the instance type T2 medium

![Diagram](/img/public_cloud/Create-AWS3.jpg)

- In the **Key pair (login.)** section, choose the key name which you already created.
- In the **Network settings** section, choose the VPC for your VM.
- Select the subnet. 
- Select **Enable** for **Auto assign public IP**

![Diagram](/img/public_cloud/Create-AWS4.jpg)

- ** Create your own security group**
- Name the security group.
- Create the Firewall rule based on controller and ER. 
- For controller. allow the TCP port 8440-8443 along with ssh. 
- For ER we have to allow 80, 443, 22.

**SG For the controller.**
![Diagram](/img/public_cloud/Firewall-AWS-Controller.jpg)

**SG for the ER**
![Diagram](/img/public_cloud/Firewall-AWS-ER.jpg)
Now click on **Launch instance**
</TabItem>
<TabItem value="GCP">

Login to the GCP console. Go to **COMPUTE ENGINE** dashboard. Click on **CREATE INSTANCE**.


![Diagram](/img/public_cloud/Create-GCP1.jpg)


Select the option **Marketplace**


![Diagram](/img/public_cloud/Create-GCP2.jpg)

Search for Ubuntu & from the dropdown select the Ubuntu Pro 22.04 LTS (Jammy) & Launch the VM

![Diagram](/img/public_cloud/Create-GCP3.jpg)

Configure the VM as follows

![Diagram](/img/public_cloud/Create-GCP4.jpg)


In the **Networking** section, under **Network Interfaces**, Choose the **NETWORK, SUB NETWORK & the EXTERNAL IP**. Now click on **DEPLOY**


</TabItem>
</Tabs>

## 1.2 Login and Setup Controller

<Tabs
  defaultValue="DigitalOcean"
  values={[
      { label: 'Digital Ocean', value: 'DigitalOcean', },
      { label: 'Azure', value: 'Azure', },
      { label: 'AWS', value: 'AWS', },
      { label: 'Google Cloud', value: 'GCP', },
  ]}
>
<TabItem value="DigitalOcean">

Once the VM is created, we can get the IP address of the droplet from the Resources screen. 

Login to the VM by using user "root" and IP address:
```bash
ssh root@<ip>
```

Then follow the [Host OpenZiti Anywhere](/docs/learn/quickstarts/network/hosted/) to setup the controller. You must replace the EXTERNAL_DNS with the following command before running the quickstart.
 
**export EXTERNAL_DNS="$(curl -s eth0.me)"**

This ensures the Controller setup by the quickstart is advertising the external IP address of the VM.
</TabItem>
<TabItem value="Azure">

Once the VM is created, we can get the IP address of the VM from the Resources screen. Login to the VM by using defined user "usename", private sshkey and IP address:
```bash
ssh -i <private_key> "username"@<ip>
```

Then follow the [Host OpenZiti Anywhere](/docs/learn/quickstarts/network/hosted/) to setup the controller. You must replace the EXTERNAL_DNS with the following command before running the quickstart.

**export EXTERNAL_DNS="$(curl -s eth0.me)"**

This ensures the Controller setup by the quickstart is advertising the external IP address of the VM.

</TabItem>
<TabItem value="AWS">

Once the VM is created, we can get the IP address of the VM from the Instance(s) screen.

Login to the VM by using user name "ubuntu":
```bash
ssh -i <private_key> "ubuntu"@<ip>
```

Then follow the [Host OpenZiti Anywhere](/docs/learn/quickstarts/network/hosted/) to setup the controller. You must replace the EXTERNAL_DNS with the following command before running the quickstart.

**export EXTERNAL_DNS="$(curl -s eth0.me)"**

This ensures the Controller setup by the quickstart is advertising the external IP address of the VM.
</TabItem>
<TabItem value="GCP">

Once the VM is created, we can login through **SSH** button on the console

![Diagram](/img/public_cloud/GCP-login1.jpg)

Then follow the [Host OpenZiti Anywhere](/docs/learn/quickstarts/network/hosted/) to setup the controller. You must replace the EXTERNAL_DNS with the following command before running the quickstart.

**export EXTERNAL_DNS="$(curl -s eth0.me)"**

This ensures the Controller setup by the quickstart is advertising the external IP address of the VM.

</TabItem>
</Tabs>

## 1.3 Setup Ziti Administration Console (ZAC) 
**Optional**

ZAC provides GUI for managing the OpenZiti network. If you prefer UI over CLI to manage network, please following the [ZAC Setup Guide](/docs/learn/quickstarts/zac/) to setup ZAC before going to the next section.

**Quickfix:**

---

To setup npm executables, you can follow [install Node.js guide](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-22-04).

For example, this is how to install the version of node needed for ZAC.

Setup the repo:
```bash
cd ~
curl -sL https://deb.nodesource.com/setup_18.x -o nodesource_setup.sh
sudo bash nodesource_setup.sh
```

Install nodejs:
```bash
sudo apt install nodejs
```

After the nodejs is installed, following the rest of [ZAC Setup Guide](/docs/learn/quickstarts/zac/#cloning-from-github) to setup ZAC.

---

## 1.4 Firewall

<Tabs
  defaultValue="DigitalOcean"
  values={[
      { label: 'Digital Ocean', value: 'DigitalOcean', },
      { label: 'Azure', value: 'Azure', },
      { label: 'AWS', value: 'AWS', },      
      { label: 'Google Cloud', value: 'GCP', },
  ]}
>
<TabItem value="DigitalOcean">

DigitalOcean by default does not setup firewall for the VM.
</TabItem>
<TabItem value="Azure">

Azure's default firewall is blocking all incoming access to the VM. You will need to open ports you specified for controller and ZAC (if you plan to use ZAC). Here is a example of the firewall ports if you used the default ports.

![Diagram](/img/public_cloud/Controller-Firewall-Azure.jpg)

</TabItem>
<TabItem value="AWS">
Azure's default firewall is blocking all incoming access to the VM. You will need to open ports you specified for controller and ZAC (if you plan to use ZAC). Here is a example of the firewall ports if you used the default ports.

![Diagram](/img/public_cloud/Firewall-AWS-Controller.jpg)

</TabItem>
<TabItem value="GCP">

GCP’s default firewall is blocking all incoming access to the VM. You will need to open ports you specified for controller and ZAC (if you plan to use ZAC). Here is a example of the firewall ports if you used the default ports.


For controller we have to allow the TCP port 8440-8443 along with SSH port.

![Diagram](/img/public_cloud/Controller-Firewall-GCP.jpg)


For Public ER we have to allow 80, 443, 22.

![Diagram](/img/public_cloud/PublicER-Firewall-GCP.jpg)

</TabItem>
</Tabs>

## 1.5 Helpers

Following helpers are needed to complete the guides for router and services.

### 1.5.1 Add Environment Variables Back to the Shell
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
 
### 1.5.2 Change Ziti edge admin password
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

### 1.5.3 Some useful command for the Router
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
