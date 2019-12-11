# Ziti Quickstart Azure: Ziti Edge - Developer Edition

This guide will get you up and running with a demonstrable service in only a few minutes.  
If you are unfamiliar with the relevant Ziti concepts refer to the [overview](~/ziti/overview.md).

# From Nothing to Network 

To get started with Ziti here are the steps you will need to accomplish:

1. [Get Ziti](#start-ziti)
  1. Obtain, then change the default password
1. [Create an Identity](#create-an-identity)
  1. [Enroll the Identity](#enroll-the-new-identity)
1. [Create a Service](#create-a-service)
1. [Create an AppWAN](#create-an-appwan)
1. [Test the Service](#test-it)


## Start Ziti

### Getting Started in Azure

This guide will leverage an image delivered via the [Azure Marketplace]
(https://azuremarketplace.microsoft.com/en-us/marketplace/apps/netfoundryinc.ziti-developer-edition).
Using the image you will have an instance of Ziti to use as you please within minutes. If you are
unfamiliar Azure you'll want to take some time to come up to speed. You will need an account and
you'll want to become familiar with the console. Start [here](https://azure.microsoft.com/en-us/get-started/) and when
you feel ready - come back to this guide.

### Important Note for Starting a Ziti Virtual Machine

When starting your virtual machine instance of the Ziti Edge - Developer Edition via the Azure UI you will need to
ensure the following:

* You have an Azure Resource Group and you are able to make the necessary changes
* From the Resource Group - click "Add" and find the Ziti Edge - Developer Edition
* Click "Create" to start the creation wizard
* On the "Basics" tab fill out the required options. Ensure you use the Username "nfziti" and uplaod a public key so you
  can SSH to the machine after its deployed
* Configure and choose options for "Disks"
* Configure and choose options for "Networking"
  * It is important that a "Basic" IP is used. Click "Create New" under the Public IP and make a new IP make sure SKU is
    "Basic" and  Assignment is "Dynamic"
* On the "Management" tab ensure the "System assigned managed identity" is set to "On" (the default is Off so you need
  to change this)
* Advance to and choose options for "Advanced"
* Advance to "Tags" - it's recommended you assingn a "ZEDE" (stands for Ziti Edge - Developer Edition) tag with a value
  that will be easy to find such as "my-ziti" or similar
* Create your virtual machine

After the virtual machine is created and provisioned navigate back to the virtual machine. In the upper-right portion of
the screen under "DNS Name" click configure to establish a DNS name. For simplicity choose a name that is guaranteed to
be unique such as "ziti-${ip.address}". For example if the virtual machine is located in US Central and the IP address
is 52.165.223.129 enter "ziti-52-165-223-129.centralus.cloudapp.azure.com"

The final step is to add the network contributor role so that the machine can automatically discover network settings.
This is used when the machine is rebooted. If the DNS address changes the Ziti Edge - Developer Edition will recreate
certificates for the newly created DNS entry.

* From the Virtual Machine - click "Access control (IAM)"
* Click "Add" -> "Add role assignment"
![image](~/images/azure-add-role.png)
* In the "Add" dialog choose:
  * Role: Network Contributor
  * Assign access to: Virtual Machine
  * Subscription: (choose)
  * Select: (choose your ZEDE virtual machine)
![image](~/images/azure-add-role-to-vm.png)

Once the network contributor role is granted reboot the virtual machine. You are now able to access your "Ziti Edge -
Developer Edition".

[!include[](./common-quickstart.md)]