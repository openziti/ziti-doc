# Host Ziti Anywhere

You can absolutely choose to host your [Ziti Network](xref:zitiOverview#overview-of-a-ziti-network) anywhere you like.
It is not necessary for the server to be on the open internet. If it works better for you to deploy Ziti on your 
own network, great, do that.  The only requirement to be aware of is that every piece of the a network will need to 
be able to communicate to the controller at least one edge router. If these components are all on your local network,
that's perfectly fine. Just remember, the only components able to participate on this network will need to be able to
contact the controller and at least one edge router.

With all that said, if you have a server on the open internet, or you are going to provision one to stand up Ziti that's
ideal. With a Zero Trust overlay network provided by Ziti, you can rest assured that your traffic is safe even when 
using commodity internet. You also do not need to worry about being on a network you trust as all networks are 
considered untrustworthy, even your work/home network!

## Installation

When starting out deploying a [Ziti Network](xref:zitiOverview#overview-of-a-ziti-network), we recommend you follow
and use the `expressInstall` function provided by the OpenZiti project. Once you're familiar with the network and 
the configuration options available you'll be better equipped to make changes. 

### Firewall

The first issue you will need to deal with is opening some ports. A network will consist of at least one controller and 
at least one edge router. Both of these components will require ports to be open. For the controller you will need to 
open two ports through your firewall, one port for the REST API, and one the control plane. Edge routers will also 
require two ports open. One for the links created between routers to form the mesh network, and one port for incoming 
client connections.

The ports you choose are not important but unless you change them these ports will default to the following:

Controller
- REST API: 1280 (port 8441 used below)
- Control plane: 6262

Edge Router
- Edge connections: 3022 (port 8442 used below)
- Fabric links: 10080

It would be reasonable to change all these ports to use ports 443 and 80 since those ports are almost **always** open 
outbound from all but the most strict networks. If you're going to be making connections from one of those networks, also 
verify that outbound access to these ports is available.

## Express Install

With the firewall ports open you will now be able to source the script which provides the expressInstall function and 
execute it. You probably should consider DNS names before actually running the script. By default, the script will use 
the bash `hostname` function to determine a reasonable default for the PKI that will be generated as well as the 
configuration files that are output.  The script allows you to configure these values and if you are deploying to a cloud 
provider (AWS, Azure, OCI, IBM, Digital Ocean, GCP, etc.) you will almost certainly want to use the **public** DNS name 
of your instance. You possibly  want to override the IP address to use as well, but using DNS names is superior to using 
IP addresses in case your IP changes.

The quickest and easiest thing to do, is simply find your external DNS name and set it into the EXTERNAL_DNS environment 
variable. For example:
```bash
export EXTERNAL_DNS="ec2-18-100-100-100.us-east-2.compute.amazonaws.com"
```

> [!Note]
> Make sure you have `jq` installed on your machine. From ubuntu that would look like:
> ```bash
> sudo apt update && sudo apt install jq -y
> ```

Once you do that, you'll be able to 
execute these commands just as 
shown to have your 
controller and 
first edge router 
configured and ready to turn on:

```bash
export EXTERNAL_IP="$(curl -s eth0.me)"       
export ZITI_EDGE_CONTROLLER_IP_OVERRIDE="${EXTERNAL_IP}"
export ZITI_EDGE_ROUTER_IP_OVERRIDE="${EXTERNAL_IP}"
export ZITI_EDGE_CONTROLLER_HOSTNAME="${EXTERNAL_DNS}"
export ZITI_EDGE_ROUTER_HOSTNAME="${EXTERNAL_DNS}"
export ZITI_EDGE_CONTROLLER_PORT=8441
export ZITI_EDGE_ROUTER_PORT=8442

# now download, source, and execute the expressInstall function
source /dev/stdin <<< "$(wget -qO- https://raw.githubusercontent.com/openziti/ziti/release-next/quickstart/docker/image/ziti-cli-functions.sh)"; expressInstall
```

### Systemd

If the operating system you are deploying on supports it, after the commands above are run there will two other useful
functions defined in your shell which will allow you to generate a systemd file for the controller and the edge router. This
is useful to make sure the controller can restart automatically should you shutdown/restart the server. To generate these 
files run:
```bash
createControllerSystemdFile
createRouterSystemdFile "${ZITI_EDGE_ROUTER_RAWNAME}"

# example:
ubuntu@ip-172-31-23-18:~$ createControllerSystemdFile
Controller systemd file written to: /home/ubuntu/.ziti/quickstart/ip-172-31-23-18/ip-172-31-23-18-edge-controller.service
ubuntu@ip-172-31-23-18:~$ createRouterSystemdFile "${ZITI_EDGE_ROUTER_RAWNAME}"
Router systemd file written to: /home/ubuntu/.ziti/quickstart/ip-172-31-23-18/ip-172-31-23-18-edge-router.service
ubuntu@ip-172-31-23-18:~$
```

After the files are generated, you can then install them for use by systemd by running:

```bash
sudo cp "${ZITI_HOME}/${ZITI_EDGE_CONTROLLER_RAWNAME}.service" /etc/systemd/system/ziti-controller.service
sudo cp "${ZITI_HOME}/${ZITI_EDGE_ROUTER_RAWNAME}.service" /etc/systemd/system/ziti-router.service
sudo systemctl daemon-reload
sudo systemctl start ziti-controller
sudo systemctl start ziti-router
```

Now, both the controller and the edge router will restart automatically!  After a few seconds you can then run these 
commands and verify systemd has started the processes and see the status:

```bash
sudo systemctl -q status ziti-controller --lines=0 --no-pager
sudo systemctl -q status ziti-router --lines=0 --no-pager

● ziti-controller.service - Ziti-Controller
     Loaded: loaded (/etc/systemd/system/ziti-controller.service; disabled; vendor preset: enabled)
     Active: active (running) since Thu 2021-11-11 19:05:46 UTC; 8s ago
   Main PID: 2375 (ziti-controller)
      Tasks: 7 (limit: 1154)
     Memory: 43.7M
     CGroup: /system.slice/ziti-controller.service
             └─2375 /home/ubuntu/.ziti/quickstart/ip-10-0-0-1/ziti-bin/ziti-v0.22.11/ziti-controller run /home/ubuntu/.ziti/quickstart/ip-10-0-0-1/co…
ubuntu@ip-10-0-0-1:~$ sudo systemctl -q status ziti-router --lines=0 --no-pager
● ziti-router.service - Ziti-Router for ip-10-0-0-1-edge-router
     Loaded: loaded (/etc/systemd/system/ziti-router.service; disabled; vendor preset: enabled)
     Active: active (running) since Thu 2021-11-11 19:05:47 UTC; 8s ago
   Main PID: 2385 (ziti-router)
      Tasks: 6 (limit: 1154)
     Memory: 231.4M
     CGroup: /system.slice/ziti-router.service
             └─2385 /home/ubuntu/.ziti/quickstart/ip-10-0-0-1/ziti-bin/ziti-v0.22.11/ziti-router run /home/ubuntu/.ziti/quickstart/ip-10-0-0-1/ip-10…
```

## Adding Environment Variables Back to the Shell

If you log out and log back in again you can source the '.env' file located at: 
`. ~/.ziti/quickstart/$(hostname)/$(hostname).env`. Below is an example of logging in, not having ZITI_HOME set, sourcing the
.env file and then showing ZITI_HOME set:

```bash
Last login: Thu May 20 11:36:25 2021 from 67.246.244.61
ubuntu@ip-10-0-0-1:~$ echo $ZITI_HOME

ubuntu@ip-10-0-0-1:~$ . ~/.ziti/quickstart/$(hostname)/$(hostname).env

adding /home/ubuntu/.ziti/quickstart/ip-10-0-0-1/ziti-bin/ziti-v0.20.2 to the path
ubuntu@ip-10-0-0-1:~$ echo $ZITI_HOME
/home/ubuntu/.ziti/quickstart/ip-10-0-0-1
```

## Install Ziti Admin Console (ZAC) [Optional]

Once you have the network up and running, if you want to install the UI management console, the ZAC, [follow along with
the installation guide](~/ziti/quickstarts/zac/installation.md)

## Using the Overlay

Now you have your zero trust overlay network in place, you probably want to try it out. Head on over to 
[the services quickstart](~/ziti/quickstarts/services/index.md) and start the journey to understanding how to use OpenZiti.