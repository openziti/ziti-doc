# Ziti Quickstart AWS: Ziti Edge - Developer Edition

This guide will get you up and running with a demonstrable service in only a few minutes.  
If you are unfamiliar with the relevant Ziti concepts refer to the [overview](~/ziti/overview.md).

# From Nothing to Network

To get started with Ziti here are the steps you will need to accomplish:

1. [Get Ziti](#start-ziti)
  1. Obtain, then change the default password
1. [Create an Identity](#create-an-identity)
  1. [Enroll the Identity](#enroll-the-new-identity)
1. [Create a Service](#create-a-service)
1. [Create Policies](#create-policies)
1. [Test the Service](#test-it)

## Start Ziti

### Getting Started in AWS

This guide will leverage an [Amazon Machine Image (AMI) delivered via the AWS Marketplace]
(https://aws.amazon.com/marketplace/pp/B07YZLKMLV).
Using the image you will have an instance of Ziti to use as you please within minutes. If you are
unfamiliar AWS you'll want to take some time to come up to speed. You will need an account, and
you'll want to become familiar with the console. Start
[here](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/introduction.html)
and when you feel ready - come back to this guide.

### Important Note for Starting a Ziti Instance

NetFoundry has provided the [Ziti Edge - Developer Edition]
(https://aws.amazon.com/marketplace/pp/B07YZLKMLV) to make it easy for you to deploy a fully functional
Ziti-based network.  Follow the prompts and launch a new AMI.  You will need to make a few key decisions
that might affect your Ziti-based network.

> [!IMPORTANT]
> This is IMPORTANT. Make sure you consider and understand any security implications of the choices made
> when starting the AMI

* Virtual Private Cloud (VPC): for the instance to be put into. Choosing the VPC will determine what network
resources are available to your Ziti network
* Subnet: The subnet you choose further defines what resources the instance will have access to. If you have
a service that is not visible to the public internet and you want to use Ziti to secure that service
make sure you put the Ziti instance on the proper subnet
* Security Group: You will want to put the Ziti instance into a security group that allows access from
the public internet on ports: 22, 443, 1280, 3022.
  * port 22 - the default port that ssh uses. This is how you will log into the bare AMI after it is launched.
  * port 443 - a small UI is delivered via a web server that runs on port 443, using self-signed certificates
  * port 1280 - the preselected port the Ziti controller will serve its API over
  * port 3022 - the preselected port for data channels to the Ziti Edge Router
* Public IP/DNS: Make sure the EC2 instance is assigned a public IP and a public DNS entry

> [!NOTE]
> One can use CloudFormation template to aide in deploying the ZEDE image to VPC. The following link
> needs to be entered under "Amazon S3 URL" option when creating a CF stack.
> https://s3.amazonaws.com/netfoundry-aws-quickstart/production/zede.template
> As seen in this screen shot.
> ![image](../images/cloudformation01.png)

> [!IMPORTANT]
> Make sure you have the private key corresponding to the public key you choose.
> Without the private key - you will not be able to authenticate to the bare AMI.

Take note of the public ip address assigned to the instance. This ip is used when ssh-ing to the machine and
this is the address that you'll use to access the online Web UI. For example if the ip address assigned is
52.165.223.129. You would ssh to the machine via this ip or the DNS name with 'nfadmin' as your username:

    ssh nfadmin@ec2-52-165-223-129.compute-1.amazonaws.com
    - or -
    ssh nfadmin@52.165.223.129

And you would access the Web UI at https://ec2-52-165-223-129.compute-1.amazonaws.com


[!include[](./common-quickstart.md)]
