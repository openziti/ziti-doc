---
title: Ziti Admin Console
---

The Ziti Administration Console (ZAC) is a web UI provided by the OpenZiti project which will allow you to configure and 
explore a [Ziti Network](../../introduction/index.mdx).

## Prerequisites

It's expected that you're using `bash` for these commands. If you're using Windows we strongly recommend that you install
and use Windows Subsystem for Linux (WSL). Other operating systems it's recommended you use `bash` unless you are able to
translate to your shell accordingly.

You will need `node` and `npm` executables from Node.js v16+.

:::note
When running Ziti Administration Console, you should also prefer using https over http. In order to do this you will need
to either create, or copy the certificates needed. Each section below tries to show you how to accomplish this on your own.
:::

## Cloning From GitHub

These steps are applicable to both the [local, no docker](../network/local-no-docker) as well as the
[hosted yourself](../network/hosted) deployments. Do note, these steps expect you have the necessary
environment variables established in your shell. If you used the default parameters, you can establish these variables
using the file at `${HOME}/.ziti/quickstart/$(hostname)/$(hostname).env`. To deploy ZAC after following one of those guides,
you can perform the following steps.

1. Clone the ziti-console repo from github:

   ```bash
   git clone https://github.com/openziti/ziti-console.git "${ZITI_HOME}/ziti-console"
   ```

1. Install Node modules:

   ```bash0000
   cd "${ZITI_HOME}/ziti-console"
   npm install
   ````

1. Use the ziti-controller certificates for the Ziti Console:

   Link a server certificate into the `ziti-console` directory. Your web browser won't recognize it, but it's sufficient for this exercise to have server TLS for your ZAC session.

   ```bash
   ln -s "${ZITI_PKI}/${ZITI_CTRL_EDGE_ADVERTISED_ADDRESS}-intermediate/certs/${ZITI_CTRL_EDGE_ADVERTISED_ADDRESS}-server.chain.pem" "${ZITI_HOME}/ziti-console/server.chain.pem"
   ln -s "${ZITI_PKI}/${ZITI_CTRL_EDGE_ADVERTISED_ADDRESS}-intermediate/keys/${ZITI_CTRL_EDGE_ADVERTISED_ADDRESS}-server.key" "${ZITI_HOME}/ziti-console/server.key"
   ```

1. [Optional] Emit the Ziti Console systemd file and update systemd to start the Ziti Console. If you have not sourced the 
   Ziti helper script, you need to in order to get the necessary function.

   ```bash
   createZacSystemdFile
   sudo cp "${ZITI_HOME}/ziti-console.service" /etc/systemd/system
   sudo systemctl daemon-reload
   sudo systemctl enable --now ziti-console
   ```

   If you do not have systemd installed or if you just wish to start ZAC you can simply issue:

   ```bash
   node "${ZITI_HOME}/ziti-console/server.js"
   Initializing TLS
   TLS initialized on port: 8443
   Ziti Server running on port 1408
   ```

1. [Optional] If using systemd - verify the Ziti Console is running by running the systemctl command 
   `sudo systemctl status ziti-console --lines=0 --no-pager`

   ```bash
   $ sudo systemctl status ziti-console --lines=0 --no-pager
    ● ziti-console.service - Ziti-Console
    Loaded: loaded (/etc/systemd/system/ziti-console.service; disabled; vendor preset: enabled)
    Active: active (running) since Wed 2021-05-19 22:04:44 UTC; 13h ago
    Main PID: 13458 (node)
    Tasks: 11 (limit: 1160)
    Memory: 33.4M
    CGroup: /system.slice/ziti-console.service
    └─13458 /usr/bin/node /home/ubuntu/.ziti/quickstart/ip-172-31-22-212/ziti-console/server.js

   $ sudo ss -lntp | grep node
   LISTEN 0      511                *:8443             *:*    users:(("node",pid=26013,fd=19))           
   LISTEN 0      511                *:1408             *:*    users:(("node",pid=26013,fd=18))
   ```

## Docker

Getting ZAC setup if you have followed the [docker network quickstart](../network/local-with-docker)
should be straightforward. If you have used the default values from this quickstart you can issue the following command.
Notice that this command uses the default path: `${HOME}/docker-volume/myFirstZitiNetwork`. If you customized the path,
replace the paths specified in the volume mount sections below accordingly (the '-v' lines). Also note this command will
expose the http and https ports to your local computer. This is optional, read more about using docker for more details
if necessary.

 ```bash
 docker run \
        --name zac \
        -p 1408:1408 \
        -p 8443:8443 \
        -v "${HOME}/docker-volume/myFirstZitiNetwork/ziti-edge-controller-intermediate/keys/ziti-edge-controller-server.key":/usr/src/app/server.key \
        -v "${HOME}/docker-volume/myFirstZitiNetwork/ziti-edge-controller-intermediate/certs/ziti-edge-controller-server.chain.pem":/usr/src/app/server.chain.pem \
        openziti/zac
 ```

:::note
Do note that if you are exposing ports as shown above, you will need to ensure that `ziti-edge-controller` is
addressable by your machine in order to use docker in this way. This guide does not go into how to do this in depth.
One easy, and common mechanism to do this would be to edit the 'hosts' file of your operating system. A quick
internet search should show you how to accomplish this.
:::

## Docker Compose

If you have followed the [docker compose quickstart](../network/local-docker-compose) you will have the ZAC
running already. It's now included with both the default docker-compose file and the simplified-docker-compose file. 
Both compose files will start and expose the ZAC ports on 1408/8443.

:::note
Do note that if you are exposing ports as shown above, you will need to ensure that `ziti-edge-controller` is
addressable by your machine in order to use docker in this way. This guide does not go into how to do this in depth.
One easy, and common mechanism to do this would be to edit the 'hosts' file of your operating system. A quick
internet search should show you how to accomplish this.
:::

## Kubernetes

There's [a Helm chart for deploying the Ziti console in Kubernetes](/docs/guides/kubernetes/hosting/kubernetes-console).

## Login and use ZAC

1. At this point you should be able to navigate to both: `https://${ZITI_CTRL_EDGE_ADVERTISED_ADDRESS}:8443`and see the ZAC login
   screen. (The TLS warnings your browser will show you are normal - it's because these steps use a self-signed certificate
   generated in the install process)

   :::note
   If you are using docker-compose to start your network, when you access ZAC for the first time you will need to
   specify the url of the controller. Since everything is running **in** docker compose this url is relative to the
   internal docker compose network that is declared in the compose file. You would enter
   `https://ziti-edge-controller:1280` as the controller's URL
   :::

2. Set the controller as shown (use the correct URL):

   1. Example using the "everything local" quickstart:
      ![everything local](./zac_configure_local.png)

   2. Example using the "docker-compose" quickstart:
      ![docker-compose](./zac_configure_dc.png)

   3. Example using AWS "host it anywhere":
      ![host it anywhere](./zac_configure_hia.png)

3. Optionally, [**change admin's password**](../../quickstarts/network/help/change-admin-password.md#ziti-console)
