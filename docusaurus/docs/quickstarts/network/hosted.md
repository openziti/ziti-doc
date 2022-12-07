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

When starting out deploying an [OpenZiti Network](../../introduction/01-Introduction.mdx#overview-of-a-ziti-network), we recommend you follow
and use the `expressInstall` function provided by the OpenZiti project. Once you're familiar with the network and
the configuration options available you'll be better equipped to make changes.

### Firewall

The first issue you will need to deal with is opening some ports. A network will consist of at least one controller and
at least one edge router. Both of these components will require ports to be open. For the controller you will need to
open a range of ports through your firewall:

- `8440/tcp`: Edge Controller providing router control plane
- `8441/tcp`: Edge Controller providing client sessions
- `8442/tcp`: Edge Router providing client connections
- `8443/tcp`: Ziti Admin Console (ZAC) [optional]

These are the arbitrary ports we'll use in this example for convenience when specifying the firewall exception as a port range.

## Express Install

### Prerequisites

:::note
Make sure you have `jq` installed. It's available to `apt` (Debian) and `dnf` (RHEL, Rocky, Fedora) as package name `jq`.
:::

### Set Up `expressInstall`

`expressInstall` may be customized with environment variables. Consider creating a DNS name for this installation before running the script. By default, the
quickstart will install your Ziti network's PKI and configuration files in `${HOME}/.ziti/quickstart/$(hostname -s)`. You may choose a different location by defining `ZITI_HOME=/custom/path/to/quickstart`. If you do customize `ZITI_HOME` then you should also make this assignment in your shell RC, e.g., `~/.bashrc` for future convenience.

You will almost certainly want to use the **public** DNS name
of your instance. It is possible to use an IP address, but a DNS name is a more flexible option, which will be important if the IP ever changes.

The quickest and easiest thing to do, is find your external DNS name and set it into the `EXTERNAL_DNS` environment
variable. For example,

```bash
export EXTERNAL_DNS="acme.example.com"
```

```bash
export EXTERNAL_IP="$(curl -s eth0.me)"       
export ZITI_EDGE_CONTROLLER_IP_OVERRIDE="${EXTERNAL_IP}"
export ZITI_EDGE_ROUTER_IP_OVERRIDE="${EXTERNAL_IP}"
export ZITI_EDGE_CONTROLLER_HOSTNAME="${EXTERNAL_DNS}"
export ZITI_EDGE_ROUTER_HOSTNAME="${EXTERNAL_DNS}"
export ZITI_CTRL_PORT=8440
export ZITI_EDGE_CONTROLLER_PORT=8441
export ZITI_EDGE_ROUTER_PORT=8442
```

### Run `expressInstall`

```bash
source /dev/stdin <<< "$(wget -qO- https://raw.githubusercontent.com/openziti/ziti/main/quickstart/docker/image/ziti-cli-functions.sh)"; expressInstall
```

### Start the Controller and Router

```bash
startController
startRouter
```

Example output:

```bash
$ startController
ziti-controller started as process id: 1286. log located at: /home/vagrant/.ziti/quickstart/bullseye/bullseye.log

$ startRouter
Express Edge Router started as process id: 1296. log located at: /home/vagrant/.ziti/quickstart/bullseye/bullseye-edge-router.log
```

## Adding Environment Variables Back to the Shell

If you log out and log back in again you can source the *.env file located in `ZITI_HOME`.

```bash
source ~/.ziti/quickstart/$(hostname -s)/$(hostname -s).env
```

Example output:

```bash
$ source ~/.ziti/quickstart/$(hostname -s)/$(hostname -s).env
adding /home/ubuntu/.ziti/quickstart/ip-10-0-0-1/ziti-bin/ziti-v0.20.2 to the path

$ echo $ZITI_HOME
/home/ubuntu/.ziti/quickstart/ip-10-0-0-1
```

## Next Steps

- [Use the Overlay](#use-the-overlay)
- [Install Ziti Admin Console (ZAC)](#install-ziti-admin-console-zac)
- [Enable `systemd`](#systemd)
<!-- - Add a Private Router -->
- [Add a Second Public Router](#add-a-second-public-router)
- [Change Admin Password](#change-admin-password)
- [Delete everything and start over](#delete-everything-and-start-over)

### Start Using Ziti Services

Now you have your zero trust overlay network in place, you probably want to try it out. Head on over to
[the services quickstart](../services/index.md) and start the journey to understanding how to use OpenZiti.

### Install Ziti Admin Console (ZAC)

This is an optional server app and web console for Ziti network administration.

[Installation guide](../zac/installation.md)

### `systemd` {#systemd}

This part is optional. If it's available, then you may want to use `systemd` to manage your controller and router processes. This
is useful to make sure the controller can restart automatically should you shutdown/restart the server. To generate these
files run:

```bash
createControllerSystemdFile
createRouterSystemdFile "${ZITI_EDGE_ROUTER_RAWNAME}"
```

Example output:

```bash
$ createControllerSystemdFile
Controller systemd file written to: /home/ubuntu/.ziti/quickstart/ip-172-31-23-18/ip-172-31-23-18-edge-controller.service

$ createRouterSystemdFile "${ZITI_EDGE_ROUTER_RAWNAME}"
Router systemd file written to: /home/ubuntu/.ziti/quickstart/ip-172-31-23-18/ip-172-31-23-18-edge-router.service
```

Before you run the controller and router with `systemd` you need to stop them if they're currently running.

```bash
stopRouter 
stopController 
```

Example output:

```bash
$ stopRouter 
INFO: stopped router

$ stopController 
INFO: Controller stopped.
```

After the `systemd` service units are generated, you can then install them by running:

```bash
sudo cp "${ZITI_HOME}/${ZITI_EDGE_CONTROLLER_RAWNAME}.service" /etc/systemd/system/ziti-controller.service
sudo cp "${ZITI_HOME}/${ZITI_EDGE_ROUTER_RAWNAME}.service" /etc/systemd/system/ziti-router.service
sudo systemctl daemon-reload
sudo systemctl enable --now ziti-controller
sudo systemctl enable --now ziti-router
```

Example output:

```bash
$ sudo cp "${ZITI_HOME}/${ZITI_EDGE_CONTROLLER_RAWNAME}.service" /etc/systemd/system/ziti-controller.service

$ sudo cp "${ZITI_HOME}/${ZITI_EDGE_ROUTER_RAWNAME}.service" /etc/systemd/system/ziti-router.service

$ sudo systemctl daemon-reload

$ sudo systemctl enable --now ziti-controller
Created symlink from /etc/systemd/system/multi-user.target.wants/ziti-controller.service to /etc/systemd/system/ziti-controller.service.

$ sudo systemctl enable --now ziti-router
Created symlink from /etc/systemd/system/multi-user.target.wants/ziti-router.service to /etc/systemd/system/ziti-router.service.
```

Now, both the controller and the edge router will restart automatically!  After a few seconds you can then run these
commands and verify systemd has started the processes and see the status:

```bash
sudo systemctl -q status ziti-controller --lines=0 --no-pager
sudo systemctl -q status ziti-router --lines=0 --no-pager
```

Example output:

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

### Add a Second Public Router

Routers automatically form a mesh of router links when there's more than one. In order for your express-installed router to participate in the mesh it needs a firewall exception to expose its "link listener" on port `10080/tcp`, the default port.

<!-- TODO: link to the new router deployment guide when it's published -->

### Change Admin Password

After changing the password with `ziti` CLI, change the value of `ZITI_PWD` in `~/.ziti/quickstart/$(hostname -s)/$(hostname -s).env` to match your preferred password. This variable is used by the `zitiLogin` function.

```bash
$ zitiLogin
Token: d6152c84-3166-4ae4-8ca3-1c38c973d450
Saving identity 'default' to /home/ubuntu/.ziti/quickstart/ip-172-31-28-116/ziti-cli.json

$ ziti edge update authenticator updb -s
Enter your current password: 
Enter your new password: 
```

### Delete everything and start over

You may begin again with these steps:

1. Delete the express install directory

    ```bash
    rm -r "${ZITI_HOME}"
    ```

1. If the current shell environment was configured by the express install you may unset vars named like `ZITI_`

    ```bash
    unsetZitiEnv
    ```
