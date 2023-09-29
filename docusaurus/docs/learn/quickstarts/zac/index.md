---
title: Ziti Admin Console
---

import Wizardly from '@site/src/components/Wizardly';

The Ziti Administration Console (ZAC) is a web UI provided by the OpenZiti project which will allow you to configure and
explore a [Ziti Network](/learn/introduction/index.mdx).

## Prerequisites

* It's expected that you're using `bash` for these commands. If you're using Windows we strongly recommend that you install
  and use Windows Subsystem for Linux (WSL). Other operating systems it's recommended you use `bash` unless you are able to
  translate to your shell accordingly.

* You will need `node` and `npm` executables from Node.js v16+. If you see an error like the one shown below you likely
  have a version of node < v16. __You need node v16+__:

      ziti = await loadModule('@openziti/ziti-sdk-nodejs')
      ^^^^^

      SyntaxError: Unexpected reserved word
       at Loader.moduleStrategy (internal/modules/esm/translators.js:133:18)
       at async link (internal/modules/esm/module_job.js:42:21)


:::note
When running Ziti Administration Console, you should also prefer using https over http. In order to do this you will need
to either create, or copy the certificates needed. Each section below tries to show you how to accomplish this on your own.
:::

## Cloning From GitHub

These steps are applicable to both the [Local - No Docker](/learn/quickstarts/network/local-no-docker.md) and the
[hosted yourself](/learn/quickstarts/network/hosted.md) deployments. Do note, these steps expect you have the necessary
environment variables established in your shell. If you used the default parameters, you can establish these variables
using the file at `${HOME}/.ziti/quickstart/$(hostname)/$(hostname).env`. To deploy ZAC after following one of those guides,
you can perform the following steps.

1. Clone the ziti-console repo from github:

   ```text
   git clone https://github.com/openziti/ziti-console.git "${ZITI_HOME}/ziti-console"
   ```

1. Install Node modules:

   ```text
   cd "${ZITI_HOME}/ziti-console"
   npm install
   ```

1. Use the ziti-controller certificates for the Ziti Console:

   Link a server certificate into the `ziti-console` directory. Your web browser won't recognize it, but it's sufficient for this exercise to have server TLS for your ZAC session.

   ```text
   ln -s "${ZITI_PKI}/${ZITI_CTRL_EDGE_NAME}-intermediate/certs/${ZITI_CTRL_EDGE_ADVERTISED_ADDRESS}-server.chain.pem" "${ZITI_HOME}/ziti-console/server.chain.pem"
   ln -s "${ZITI_PKI}/${ZITI_CTRL_EDGE_NAME}-intermediate/keys/${ZITI_CTRL_EDGE_ADVERTISED_ADDRESS}-server.key" "${ZITI_HOME}/ziti-console/server.key"
   ```

1. [Optional] Emit the Ziti Console systemd file and update systemd to start the Ziti Console (ZAC). If you have not sourced
   [the Ziti helper script](https://get.openziti.io/ziti-cli-functions.sh) and you wish to have ZAC enabled with systemd,
   you need to in order to get the necessary function. Either inspect the script and find the function, download and source it,
   or source it directly from the internet (direct sourcing from internet shown below)

   ```text
   source /dev/stdin <<< "$(wget -qO- https://get.openziti.io/ziti-cli-functions.sh)"
   createZacSystemdFile
   sudo cp "${ZITI_HOME}/ziti-console.service" /etc/systemd/system
   sudo systemctl daemon-reload
   sudo systemctl enable --now ziti-console
   ```

   If you do not have systemd installed or if you just wish to start ZAC you can simply issue:

   ```text
   node "${ZITI_HOME}/ziti-console/server.js"
   Initializing TLS
   TLS initialized on port: 8443
   Ziti Server running on port 1408
   ```

1. [Optional] If using systemd - verify the Ziti Console is running by running the systemctl command
   `sudo systemctl status ziti-console --lines=0 --no-pager`

   ```text
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

## Using Docker

### Copy PKI From Controller
It's a good idea to use TLS everywhere. To do this, you'll need to provide ZAC a key and a certificate.
If you have used the [Local - With Docker](/learn/quickstarts/network/local-with-docker.md) quickstart to start
the OpenZiti Network you can copy the certificates generated when the controller started.
Shown is an example which copies the certs from the OpenZiti container and uses them with ZAC. We'll copy the files
from the docker named volume `myPersistentZitiFiles` and put them into a folder at `$HOME/.ziti/zac-pki`.

```text
mkdir -p $HOME/.ziti/zac-pki

docker run -it --rm --name temp \
  -v myPersistentZitiFiles:/persistent \
  -v $HOME/.ziti/zac-pki:/zac-pki busybox \
  cp /persistent/pki/ziti-edge-controller-intermediate/keys/ziti-edge-controller-server.key /zac-pki
  
docker run -it --rm --name temp \
  -v myPersistentZitiFiles:/persistent \
  -v $HOME/.ziti/zac-pki:/zac-pki busybox \
  cp /persistent/pki/ziti-edge-controller-intermediate/certs/ziti-edge-controller-server.chain.pem /zac-pki
```

### Starting ZAC

With the certificates copied, you will be able to start the ZAC using one Docker command. Also notice the command 
will expose the ZAC http and https ports to your local computer so that you can access the ZAC from outside of Docker.
If you customized any of these paths, you'll need to replace the paths specified accordingly (the '-v' lines).

 ```text
 docker run --rm \
        --name zac \
        -p 1408:1408 \
        -p 8443:8443 \
        -v "$HOME/.ziti/zac-pki/ziti-edge-controller-server.key":/usr/src/app/server.key \
        -v "$HOME/.ziti/zac-pki/ziti-edge-controller-server.chain.pem":/usr/src/app/server.chain.pem \
        openziti/zac
 ```

:::note
Do note that if you are exposing ports as shown above, you will need to ensure that `ziti-edge-controller` is
addressable by your machine in order to use Docker in this way. This guide does not go into how to do this in depth.
One easy, and common mechanism to do this would be to edit the 'hosts' file of your operating system. A quick
internet search should show you how to accomplish this.
:::

## Docker Compose

If you have followed the [Local - Docker Compose](/learn/quickstarts/network/local-docker-compose.md) quickstart you will have the ZAC
running already. It's now included with both the default docker-compose file and the simplified-docker-compose file.
Both compose files will start and expose the ZAC ports on 1408/8443.

:::note
Do note that if you are exposing ports as shown above, you will need to ensure that `ziti-edge-controller` is
addressable by your machine in order to use Docker in this way. This guide does not go into how to do this in depth.
One easy, and common mechanism to do this would be to edit the 'hosts' file of your operating system. A quick
internet search should show you how to accomplish this.
:::

## Kubernetes

There's [a Helm chart for deploying the Ziti console in Kubernetes](/docs/guides/kubernetes/hosting/kubernetes-console).

## Login and use ZAC

1. At this point you should be able to navigate to: `https://${ZITI_CTRL_EDGE_ADVERTISED_ADDRESS}:8443`and see the ZAC login
   screen. (The TLS warnings your browser will show you are normal - it's because these steps use a self-signed certificate
   generated during the installation process)

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

3. Optionally, [**change admin's password**](/learn/quickstarts/network/help/change-admin-password.md#ziti-console)

<Wizardly></Wizardly>