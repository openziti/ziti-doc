---
sidebar_position: 10
---
# Host OpenZiti Anywhere

You can absolutely choose to host your [OpenZiti Network](../../introduction/01-Introduction.mdx#overview-of-a-ziti-network) anywhere you like.
It is not necessary for the server to be on the open internet. If it works better for you to deploy OpenZiti on your
own network, great, do that.  The only requirement to be aware of is that every piece of the a network will need to be able to communicate to the controller at least one edge router.

If you have a server available on the open internet, or you will provision one for use with OpenZiti, that's the
ideal scenario. With a zero trust overlay network provided by OpenZiti, you can rest assured that your traffic is safe even when using commodity internet. Furthermore, you do not need to worry about being on a network you trust, as all networks are considered untrustworthy, even your work/home network!

## Installation

When starting out deploying a [OpenZiti Network](../../introduction/01-Introduction.mdx#overview-of-a-ziti-network), we recommend you follow
and use the `expressInstall` function provided by the OpenZiti project. Once you're familiar with the network and
the configuration options available you'll be better equipped to make changes.

### Firewall

The first issue you will need to deal with is opening some ports. A network will consist of at least one controller and 
at least one edge router. Both of these components will require ports to be open. For the controller you will need to 
open two ports through your firewall, one port for the Edge API, and one for Edge Router connections.

- `8440/tcp`: Edge Controller listening for clients
- `8441/tcp`: Edge Controller listening for routers
- `8442/tcp`: Edge Router listening for clients
- `8443/tcp`: Ziti Admin Console (ZAC) [optional]

These are the arbitrary ports we'll use in this example for convenience when specifying the firewall exception as a port range.

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

You may override the default administrator password "admin". The secret value will be stored in the `*.env` file inside the express install home directory so that it can be easily referenced by the `zitiLogin` function.

```bash
read -s ZITI_PWD
# type or paste the password (not echoed) and press <enter>
```

:::note
Make sure you have `jq` installed on your machine. From ubuntu that would look like:

```bash
sudo apt update && sudo apt install jq -y
```

:::

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
export ZITI_EDGE_CONTROLLER_PORT=8440
export ZITI_CTRL_PORT=8441
export ZITI_EDGE_ROUTER_PORT=8442

# now download, source, and execute the expressInstall function
source <(wget -qO- https://raw.githubusercontent.com/openziti/ziti/main/quickstart/docker/image/ziti-cli-functions.sh)
expressInstall
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
$ createControllerSystemdFile
Controller systemd file written to: /home/ubuntu/.ziti/quickstart/ip-172-31-23-18/ip-172-31-23-18-edge-controller.service

$ createRouterSystemdFile "${ZITI_EDGE_ROUTER_RAWNAME}"
Router systemd file written to: /home/ubuntu/.ziti/quickstart/ip-172-31-23-18/ip-172-31-23-18-edge-router.service
```

After the files are generated, you can then install them for use by systemd by running:

```bash
sudo cp "${ZITI_HOME}/${ZITI_EDGE_CONTROLLER_RAWNAME}.service" /etc/systemd/system/ziti-controller.service
sudo cp "${ZITI_HOME}/${ZITI_EDGE_ROUTER_RAWNAME}.service" /etc/systemd/system/ziti-router.service
sudo systemctl daemon-reload
sudo systemctl enable --now ziti-controller
sudo systemctl enable --now ziti-router
```

Now, both the controller and the edge router will restart automatically!  After a few seconds you can then run these
commands and verify systemd has started the processes and see the status:

```bash
$ sudo systemctl -q status ziti-controller --lines=0 --no-pager
● ziti-controller.service - Ziti-Controller
     Loaded: loaded (/etc/systemd/system/ziti-controller.service; disabled; vendor preset: enabled)
     Active: active (running) since Thu 2021-11-11 19:05:46 UTC; 8s ago
   Main PID: 2375 (ziti-controller)
      Tasks: 7 (limit: 1154)
     Memory: 43.7M
     CGroup: /system.slice/ziti-controller.service
             └─2375 /home/ubuntu/.ziti/quickstart/ip-10-0-0-1/ziti-bin/ziti-v0.22.11/ziti-controller run /home/ubuntu/.ziti/quickstart/ip-10-0-0-1/co…

$ sudo systemctl -q status ziti-router --lines=0 --no-pager
● ziti-router.service - Ziti-Router for ip-10-0-0-1-edge-router
     Loaded: loaded (/etc/systemd/system/ziti-router.service; disabled; vendor preset: enabled)
     Active: active (running) since Thu 2021-11-11 19:05:47 UTC; 8s ago
   Main PID: 2385 (ziti-router)
      Tasks: 6 (limit: 1154)
     Memory: 231.4M
     CGroup: /system.slice/ziti-router.service
             └─2385 /home/ubuntu/.ziti/quickstart/ip-10-0-0-1/ziti-bin/ziti-v0.22.11/ziti-router run /home/ubuntu/.ziti/quickstart/ip-10-0-0-1/ip-10…
```

Inspect the servers' listening ports.

```bash
$ sudo ss -lntp | grep ziti
LISTEN 0      4096               *:8440             *:*    users:(("ziti-controller",pid=5240,fd=10))
LISTEN 0      4096               *:8441             *:*    users:(("ziti-controller",pid=5240,fd=9)) 
LISTEN 0      4096               *:8442             *:*    users:(("ziti-router",pid=5272,fd=9))     
LISTEN 0      4096               *:10080            *:*    users:(("ziti-router",pid=5272,fd=8))     
```

What are these server ports listening for?

- `8440/tcp`: the Edge Controller listening for API requests. We specified this port as env var `ZITI_EDGE_CONTROLLER_PORT`. You need a firewall exception for this port to allow Ziti identities to obtain an Edge session.
- `8441/tcp`: the Edge Controller listening for Edge Routers. We specified this port as env var `ZITI_CTRL_PORT`. You need a firewall exception because all routers, including the one running on the same host, will connect to the global advertised address of the controller.
- `8442/tcp`: the Edge Router listening for edge connections from identities. We specified this port as env var `ZITI_EDGE_ROUTER_PORT`. You need a firewall exception for this port to allow Ziti identities to connect to Ziti services via the Edge Router.
- `10080/tcp`: the Ziti fabric link listener described below in [Additional Routers](#additional-routers)

## Adding Environment Variables Back to the Shell

If you log out and log back in again you can source the '.env' file located at:
`source ~/.ziti/quickstart/$(hostname)/$(hostname).env`. Below is an example of logging in, not having ZITI_HOME set, sourcing the
.env file and then showing ZITI_HOME set:

```bash
$ source ~/.ziti/quickstart/$(hostname)/$(hostname).env
adding /home/ubuntu/.ziti/quickstart/ip-10-0-0-1/ziti-bin/ziti-v0.20.2 to the path

$ echo $ZITI_HOME
/home/ubuntu/.ziti/quickstart/ip-10-0-0-1
```

## Install Ziti Admin Console (ZAC)

Once you have the network up and running, if you want to install the UI management console, the ZAC, [follow along with
the installation guide](../zac/installation.md)

## Using the Overlay

Now you have your zero trust overlay network in place, you probably want to try it out. Head on over to
[the services quickstart](../services/index.md) and start the journey to understanding how to use OpenZiti.

## Reset Environment and Begin Again

You may begin again with these steps:

1. Delete the express install directory

    ```bash
    rm -r "${ZITI_HOME}"
    ```

1. If the current shell environment was configured by the express install you may unset vars named like `ZITI_`

    ```bash
    unsetZitiEnv
    ```

## Reset Admin Password

In case you did not override the default administrator password "admin" during "Express Install" you may change it.

```bash
$ zitiLogin
Token: d6152c84-3166-4ae4-8ca3-1c38c973d450
Saving identity 'default' to /home/ubuntu/.ziti/quickstart/ip-172-31-28-116/ziti-cli.json

$ ziti edge update authenticator updb -s
Enter your current password: 
Enter your new password: 
```

## Additional Routers

Routers automatically form a mesh of fabric links when there's more than one router. In order for your express-installed router to participate in the mesh it needs another firewall exception to expose its "link listener" on port `10080/tcp`, the default port.
