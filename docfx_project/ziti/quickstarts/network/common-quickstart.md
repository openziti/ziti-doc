### Obtain and Change the Default Password

When first launched - the instace will deposit a file into the file system at
/home/nfadmin/.config/ziti/ziti-controller/credentials.json.

> [!NOTE]
> Since this is your first Ziti deployment this system is expected to be transient. If the IP address or DNS entry
> changes (such as a system reboot) the image needs to be reconfigured becuase the certificates will no longer be valid.
> This file is used to reconfigure the system in this event and it happens automatically on startup.

Now, ssh to the newly created machine. Once there you can obtain the username and password for your
Ziti Controller by issuing this command:

    jq -r .password /home/nfadmin/.config/ziti/ziti-controller/credentials.json

You can choose to keep this password or change it to something easier to remember. If you change the password, please
remember to use a strong password which is not easy to guess.

> [!TIP]
> Once the password is changed - update the credentials.json file with the current password if you want the system to
> automatically update the certificates in the event of the image losing its IP address or DNS entry.

# [Change via UI](#tab/change-pwd-ui)

These AMIs will be provided with a self-signed certificate generated during securely during the bootup process. See
[changing pki](~/ziti/manage/pki.md) for more information.

1. Log into the UI using the password obtained in the prior step
1. In the lower left corner, click the icon that looks like a person and choose "Edit Profile" <br/>
![image](~/images/changepwd_ui.png) <br/>

1. Enter the current password along with a new/confirmed password and click "Save" <br/>
![image](~/images/changepwd_manageprofile.png) <br/>

# [Change via CLI](#tab/change-pwd-cli)

To change the administrator password using the CLI simply issue these commands:

> [!NOTE]
> If you are not already, you will need to be logged in to use the ziti cli

[!include[](~/ziti/cli-snippets/login.md)]
    
    #update the admin user. This command will prompt you to enter the password
    ziti edge controller update authenticator updb -s
    
***

## Create an Identity

All connections to Ziti are mutually authenticated TLS connections. Identites map a given certificate to an identity
within the Ziti Controller. Read more about Identities [here](~/ziti/identities/overview.md) Creating an identity via the UI or CLI is easy:

# [New Identity via UI](#tab/create-identity-ui)

1. On the left side click "Edge Identities"
1. In the top right corner of the screen click the "plus" image to add a new identity
1. Enter the name of the identity you would like to create
1. Choose the type: Device, Service, User (choose User for now)
1. Leave the enrollment type as "One Time Token"
1. Click save

# [New Identity via CLI](#tab/create-identity-cli)

To create a new identity using the CLI simply issue these commands:

[!include[](~/ziti/identities/create-identity-cli.md)]

***

### Enroll the New Identity

Identities are not truly enabled until they are enrolled. Enrollment is a complex process. NetFoundy has created a tool
specifically for this task to ensure safe and secure enrollment of identities.

1. Download the ziti-enroller for your operating system.

[!include[](~/ziti/downloads/enroller.md)]

1. Download the [jwt](https://jwt.io/introduction/) from the UI by clicking the icon that looks like a certificate (save
   the file as NewUser.jwt) or if you used the CLI from the output location specified when creating the user.
1. In a command line editor, change to the folder containing the jwt. Enroll the identity by running `ziti-enroller --jwt NewUser.jwt`

The ziti-enroller will output a new json file named `NewUser.json`. This file is precious and must be protected as it
contains the identity of the given user.

## Create a Service

With an identity created it's now time to create a service. Read more about Services [here](~/ziti/services/overview.md).  For this
example we are going to choose a simple website that is [available on the open internet](http://eth0.me). This site will
return the IP address you are coming from. Click this link now and discover what the your external IP is.

# [New Service Config via UI](#tab/create-service-config-ui)

1. On the left side nav bar, click "Ziti Config"
1. In the top right corner of the screen click the "plus" image to add a new config
1. Enter the name: eth0.ziti.config.ui
1. In the "Types" box choose: "ziti-tunneler-client.v1"
1. In the "Hostname" box enter: `eth0.ziti.ui`
1. In the "Port" box enter: `80`
1. Click save to save the config<br>
![image](~/images/eth0.ui.png)

# [New Service Config via CLI](#tab/create-service-config-cli)

> [!NOTE]
> If you are not already, you will need to be logged in to use the ziti cli

[!include[](~/ziti/cli-snippets/login.md)]
    
    # create the config
    ziti edge controller create config eth0.ziti.config.cli ziti-tunneler-client.v1 '{ "hostname" : "eth0.ziti.cli", "port" : 80 }'

***

# [New Service via UI](#tab/create-service-ui)

1. On the left side nav bar, click "Edge Services"
1. In the top right corner of the screen click the "plus" image to add a new service
1. Choose a name for the service, enter: `eth0.ziti.svc.ui`
1. Under Configurations choose the ziti-tunneler-client.v1 config named: eth0.ziti.config.ui
1. Click save

# [New Service via CLI](#tab/create-service-cli)

To create a new service using the CLI simply issue these two commands:

    # create the service and refernce the cli config added earlier
    ziti edge controller create service ziti.eth0.svc.cli --configs ziti.eth0.config.cli

***

# [New Terminator via UI](#tab/create-terminator-ui)

1. On the left side nav bar, click "Edge Services"
1. On the top nav bar, click "Terminators"
1. In the top right corner of the screen click the "plus" image to add a new terminator
1. In the "Service" dropdown, choose: eth0.ziti.svc.ui
1. In the "Router" dropdown, choose: ziti-er01 <- NOTE: a bug in the UI will make this show up 'empty'
   choose it anyway as shown:
1. In the "Address" box enter: `tcp:eth0.me:80`
1. Click save

# [New Terminator via CLI](#tab/create-terminator-cli)

To create a new service using the CLI simply issue these two commands:

    # create the service and refernce the cli config added earlier
    ziti edge controller create terminator eth0.ziti.svc.cli "ziti-er01" tcp:eth0.me:80

***

## Create Policies

Use policies to 

1. allow identities to access services
1. allow identities to use edge routers
1. allow services to use edge routers

> [!WARNING]
> The policies shown here are for demonstration purposes only. These policies will grant all identities access
> to all routers and all services. This is certainly not what you want in a production setup! Please read more
> about policies and experiment with different combinations to understand how best to apply policies in an 
> actual network

[Read more about Policies here](~/ziti/policies/overview.md)

### [New Policies via UI](#tab/create-policies-ui)

### New Edge Router Policy

1. On the left side nav bar, click "Ziti Policies"
1. It should already be selected, but if not, on the top nav bar, click "Edge Router Policies"
1. In the top right corner of the screen click the "plus" image to add a new Edge Router Policy
1. Choose a name for the Edge Router Policy, enter: `All Edge Routers`
1. Inside the "Router Roles" box, type `#all` and press the enter key. Make sure the `#all` tag gets applied. It should
   look like this: <br> ![image](~/images/all-edge-routers.png)
1. Inside the "Identity Roles" box, type `#all` and press the enter key. Make sure the `#all` tag gets applied. It should
   look like this: <br> ![image](~/images/all-identities.png)
1. Leave the "Semantics" box as "Has Any Role"
1. Click save

### New Service Policy

1. On the left side nav bar, click "Ziti Policies"
1. On the top nav bar, click "Service Policies"
1. In the top right corner of the screen click the "plus" image to add a new Service Policy
1. Choose a name for the Service Policy, enter: `All Services - Dial`
1. In the "Type" dropdown, change select "Dial"
1. Inside the "Service Roles" box, type `#all` and press the enter key. Make sure the `#all` tag gets applied. It should
   look like this: <br> ![image](~/images/all-services.png)
1. Inside the "Identity Roles" box, type `#all` and press the enter key. Make sure the `#all` tag gets applied. It should
   look like this: <br> ![image](~/images/all-identities.png)
1. Leave the "Semantics" box as "Has Any Role"
1. Click save

### New Service Edge Router Policy

1. On the left side nav bar, click "Ziti Policies"
1. On the top nav bar, click "Service Edge Router Policies"
1. In the top right corner of the screen click the "plus" image to add a new Edge Router Policy
1. Choose a name for the Edge Router Policy, enter: `All Edge Routers All Services`
1. Inside the "Router Roles" box, type `#all` and press the enter key. Make sure the `#all` tag gets applied. It should
   look like this: <br> ![image](~/images/all-edge-routers.png)
1. Inside the "Service Roles" box, type `#all` and press the enter key. Make sure the `#all` tag gets applied. It should
   look like this: <br> ![image](~/images/all-services.png)
1. Leave the "Semantics" box as "Has Any Role"
1. Click save

# [New Policies via CLI](#tab/create-policies-cli)

To create some policies using the CLI issue the following commands:

> [!NOTE]
> If you are not already, you will need to be logged in to use the ziti cli.

[!include[](~/ziti/cli-snippets/login.md)]
    
    # Create an edge router policy which allows all identities to use all edge routers 
    ziti edge controller create edge-router-policy all-edge-routers-cli --edge-router-roles '#all' --identity-roles '#all'
    
    # Create a service policy which allows all identities to use all services 
    ziti edge controller create service-policy all-services-dial-cli Dial --service-roles '#all' --identity-roles '#all'
    
    # Create a service edge router policy which allows all services to use all edge routers
    ziti edge controller create service-edge-router-policy all-edge-routers-all-services --edge-router-roles '#all' --service-roles '#all'
    
***

## Test It

Ok, you're almost ready to test your Ziti setup! Now you need to acquire a pre-built client from NetFoundry. The
simplest way to test your setup is to get the [ziti-tunnel](~/ziti/clients/tunneler.md) for your OS.

[!include[](~/ziti/downloads/tunneler.md)]

The
ziti-tunnel has a mode which acts as a proxy into the Ziti overlay network.  You will need the enrolled identity json
file created in the previous step and this will require running a command. Here are the steps to verify your Ziti
network and configuration are all working properly:

* Open a command prompt
* ensure ziti-tunnel and NewUser.json are in the same directory and cd to this directory
* run the ziti-tunnel in proxy mode:
  * `ziti-tunnel proxy -i NewUser.json ethzero-ui:1111`
  * `ziti-tunnel proxy -i NewUser.json ethzero-cli:2222`
* navigate your web browser to (or use curl) to obtain your IP address by going to http://localhost:1111/

At this point you should see the external IP address of your instance. Delivered to your machine safely and
securely over your Ziti network.
