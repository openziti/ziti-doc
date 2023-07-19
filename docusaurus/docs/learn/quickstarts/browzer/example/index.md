---
title: Example Enabling BrowZer 
---

This page will demonstrate adding BrowZer to an existing OpenZiti overlay network that was started using the 
["host it anywhere" quickstart](../../../../learn/quickstarts/network/hosted.md). It will use Ubuntu linux as well, if
your linux distribution is different, change the commands accordingly.

### Get the Wildcard Certificate

First, I used Docker to run Certbot. Following the instructions [on the certbot site](https://eff-certbot.readthedocs.io/en/stable/install.html),
I obtained a wildcard certificate key/pair from LetsEncrypt for my domain using the
[DNS challenge method](https://letsencrypt.org/docs/challenge-types/#dns-01-challenge).

#### Run Certbot via Docker
```
wildcard_url="hostitanywhere.demo.openziti.org"
your_email="clint@openziti.org"
sudo docker run -it --rm --name certbot \
  -v "/etc/letsencrypt:/etc/letsencrypt" \
  -v "/var/lib/letsencrypt:/var/lib/letsencrypt" \
  certbot/certbot certonly -d "*.${wildcard_url}" \
                  --manual \
                  --preferred-challenges dns \
                  --email "${your_email}" \
                  --agree-tos
```

### Enable Certificate Access by Specific Users

Since certbot will make the files available to root only (a good practice) we want to give specific users the
ability to read the files.  To do that we'll make a new group and a new user with UID 2171 and GID 2171. As shown below,
we are making a group named `zitiweb`, adding our user to that group so that "we" can see the files for debugging or
other purposes and then making a `ziggy` user that can also read these files should we want/need that later. Please 
plan accordingly here. This is just a reasonable example to follow to get you going, change it to suit your needs.

```bash
sudo groupadd -g 2171 zitiweb
sudo useradd -u 2171 -s /bin/bash ziggy
sudo usermod -aG zitiweb ziggy
sudo usermod -aG zitiweb $USER
sudo chown -R root:zitiweb /etc/letsencrypt/
sudo chmod -R g+rx /etc/letsencrypt/
```

Log out of the shell and log back in again to gain access to the certs (notice we need to reset the wildcard_url):
```bash
wildcard_url="hostitanywhere.demo.openziti.org"
ls -l /etc/letsencrypt/live/${wildcard_url}/*
```

### Follow the OpenZiti "host it anywhere" Quickstart

We plan to follow the steps outlined in the ["host it anywhere" quickstart](../../../../learn/quickstarts/network/hosted.md) 
with __one important exception__. Since we have just obtained some LetsEncrypt certificates, we'll enable OpenZiti with 
[Alternative Server Certs](../../../../guides/alt-server-certs.md) __immediately__! To do that we'll set three new variables
introduced with v0.29.0. Notice that the `${wildcard_url}` variable set above, is reused here:

```bash
export ZITI_CTRL_EDGE_ALT_ADVERTISED_ADDRESS="ctrl.${wildcard_url}"
export ZITI_PKI_ALT_SERVER_CERT="/etc/letsencrypt/live/${wildcard_url}/fullchain.pem"
export ZITI_PKI_ALT_SERVER_KEY="/etc/letsencrypt/live/${wildcard_url}/privkey.pem"
```

Now we can follow the ["host it anywhere" quickstart](../../../../learn/quickstarts/network/hosted.md) instructions.

After the quickstart completes, you should be able to access the controller at both:
* ${ZITI_CTRL_EDGE_ALT_ADVERTISED_ADDRESS}:${ZITI_CTRL_EDGE_ADVERTISED_PORT}
* ${ZITI_CTRL_EDGE_ADVERTISED_ADDRESS}:${ZITI_CTRL_EDGE_ADVERTISED_PORT}

Let's try curling there to see:
```bash
curl ctrl.${ZITI_CTRL_EDGE_ALT_ADVERTISED_ADDRESS}:${ZITI_CTRL_EDGE_ADVERTISED_PORT}
```






## Cleaning up and Trying Again

To clean everything up and try it all over (if you need to) run these commands:
```bash
sudo systemctl stop ziti-controller 
sudo systemctl stop ziti-router
rm -rf $HOME/.ziti/quickstart
unsetZitiEnv
```