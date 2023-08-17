---
title: Example Enabling BrowZer 
---
import MDXComponents from '@theme-original/MDXComponents';
import Details from '@theme/MDXComponents/Details';
import Code from '@theme/MDXComponents/Code';
import Highlight from "/src/components/OpenZitiHighlight";

This page will demonstrate adding BrowZer to an existing OpenZiti Network that was started using the
["host it anywhere" quickstart](../../../../learn/quickstarts/network/hosted.md). It will use Ubuntu Linux as well, if
your Linux distribution is different, change the commands accordingly.

### Before you Begin

This guide will use BASH. If you're using a different shell, it's up to you to translate any commands that don't work
correctly (or run a BASH shell). This guide will expect you have set a variable named `wildcard_url` which represents
the root domain you want to enable BrowZer with. For this example, this guide uses and references this value 
for the `wildcard_url=browzerexample.demo.openziti.org`. <Highlight style={{fontWeight: "bold"}}>(Make sure you set 
this value)</Highlight>


### Get the Wildcard Certificate

First, to obtain the a wildcard certificate, I used Docker to run [Certbot](https://certbot.eff.org/). 
On the Certbot site there are instructions illustrating how to use Certbot. I chose to use Docker to run Certbot
instead of having to install Certbot on the machine. I was able a wildcard certificate from LetsEncrypt for the
`${wildcard_url}` domain using the [DNS challenge method](https://letsencrypt.org/docs/challenge-types/#dns-01-challenge).  Also notice that Certbot can contact you as a 
reminder that your certificates are expiring. LetsEncrypt certs are only valid for 90 days, if you follow these
instructions remember that and plan on rotating the certs often. Set `your_email` as shown below and obtain
certificates from LetsEncrypt now:

<Details>
<summary>Run Certbot via Docker</summary>

```
your_email="your.email@someserver.com"
sudo docker run -it --rm --name certbot \
  -v "/etc/letsencrypt:/etc/letsencrypt" \
  -v "/var/lib/letsencrypt:/var/lib/letsencrypt" \
  certbot/certbot certonly -d "*.${wildcard_url}" \
                  --manual \
                  --preferred-challenges dns \
                  --email "${your_email}" \
                  --agree-tos
```

</Details>



### Enable Certificate Access by Specific Users

Certbot will make the files it creates available to root only (a good practice). If you run your network as root, this
you'll have no problems but generally, it's a better practice to not run as root when you don't need to. In order to run
this example as "us" (not the root user) we'll need to grant specific users the ability to read the files.  

A flexible way to allow other processes to use/access these files is to make a new group and a new user, that is what
is shown below. In linux, groups and users are assigned ids. 2171 looks like "ziti" so we'll use UID 2171 and GID 2171.
The example below will make a new group named `zitiweb`. This group will then be granted ownership of the `letsencrypt`
folder via chown. Changing the ownership of the files to the group will allow any user in that group the ability to read
these files so be careful granting this group to users. Then we'll add the user we are currently logged in with to that 
group so that "we" can see the files for debugging or other purposes. Finally, we'll make a `ziggy` user that is also in
this group so that if we want to, we can run processes as ziggy. Please plan accordingly here. This is just a reasonable 
example to follow to get you going, change it to suit your needs and do not take this example as authoritative. There
are many ways to solve this problem, it's up to you to pick 'the best' way.

<Details>
<summary>Example Changing LetsEncrypt Permissions</summary>

```bash
sudo groupadd -g 2171 zitiweb
sudo useradd -u 2171 -M ziggy
sudo usermod -aG zitiweb ziggy
sudo usermod -aG zitiweb $USER
sudo chown -R root:zitiweb /etc/letsencrypt/
sudo chmod -R g+rX /etc/letsencrypt/
```

You will want to enable the new group permissions in the current shell. Log out of your current session and log back
in again. Doing so will enable the new group permission in your shell. After, set the `wildcard_url` variable again.
Once set, verify you can access to the certificates:
```bash
ls -l /etc/letsencrypt/live/${wildcard_url}/*
```
You will see files that look something like this:
```bash
total 16
-rw-r-xr-- 1 root zitiweb  740 Jul 19 22:48 README
drwxr-xr-x 2 root zitiweb 4096 Aug 17 21:12 browzerexample.demo.openziti.org
drwxr-xr-x 2 root zitiweb 4096 Jul 19 22:48 hostitanywhere.demo.openziti.org
drwxr-xr-x 2 root zitiweb 4096 Aug 15 18:11 zititv.demo.openziti.org
```

</Details>

### Install a new OpenZiti Network

This examplerelies


we'll deploy a brand new OpenZiti Network by following the steps outlined in the ["host it anywhere"](../../network/hosted.md)
quickstart with __one important exception__! 

<Details>
<summary>Setup for Alternative Server Certs</summary>

Since we have just obtained some LetsEncrypt certificates, we'll enable OpenZiti with
[Alternative Server Certs](../../../../guides/alt-server-certs.md) __immediately__! To do that we'll set two new variables
introduced with v0.29.0. Notice that the `${wildcard_url}` variable needs to be set if it's not already set. Shown here
is the domain: `browzerexample.demo.openziti.org`:

```bash
export ZITI_PKI_ALT_SERVER_CERT="/etc/letsencrypt/live/${wildcard_url}/fullchain.pem"
export ZITI_PKI_ALT_SERVER_KEY="/etc/letsencrypt/live/${wildcard_url}/privkey.pem"
```
</Details>

With the `ZITI_PKI_ALT_*` environmnent variables set, we are ready to follow the 
["host it anywhere" quickstart](../../../../learn/quickstarts/network/hosted.md) instructions.

<Details>
<summary>Verify the Quickstart Succeeded</summary>

After completing the quickstart, you should be able to access the controller at both the alternate server cert url. 
Notice there's no need for 'insecure' (-sk) curl mode!:
```bash
curl https://ctrl.${wildcard_url}:${ZITI_CTRL_EDGE_ADVERTISED_PORT}
```
and we should be able to curl to the non-alternative server url. Note for this we need to use `-sk` since this will
be the self-signed PKI endpoint:
```bash
curl -sk https://${ZITI_CTRL_EDGE_ADVERTISED_ADDRESS}:${ZITI_CTRL_EDGE_ADVERTISED_PORT}
```
</Details>

### Add WebSocket Support to the OpenZiti Network

BrowZer operates in your web browser. For it to connect to a router, a router will need to be provisioned on the OpenZiti
Network that supports [web sockets](https://en.wikipedia.org/wiki/WebSocket). We will do that by using the router
provisioned in the quickstart

<Details>
<summary>Update Edge Router for WebSocket Support</summary>

After completing the quickstart, you will have an edge router configuration file in the user's home directory.
Use your favorite editor, such as [`vim`](https://en.wikipedia.org/wiki/Vim_(text_editor)) to edit the file:

```bash
vi $ZITI_HOME/${ZITI_NETWORK}-edge-router.yaml
```

Locate the "binding" section, and add a section that looks like this. Make sure to change the `address` and `advertise`
fields accordingly to fit your `${wildcard_url}` value:
```bash
  - binding: edge
    address: wss:0.0.0.0:8447
    options:
      advertise: ws.browzerexample.demo.openziti.org:8447
      connectTimeoutMs: 5000
      getSessionTimeout: 60
```

</Details>



### Install the Ziti Admin Console (ZAC)

In this example, we will be protecting the Ziti Administration Console (ZAC) itself with BrowZer. To do that, 
we need to install ZAC first. Follow [the ZAC install guide](../../../../learn/quickstarts/zac/index.md). 
After installing ZAC, continue.


# restart the edge router
sudo systemctl restart ziti-router

## Create a BrowZer env File

you'll need your auth0/idp client

```bash

# start http agent
export NODE_ENV=production
export ZITI_BROWZER_BOOTSTRAPPER_LOGLEVEL=debug
export ZITI_BROWZER_BOOTSTRAPPER_HOST=browzer.${wildcard_url}
export ZITI_BROWZER_RUNTIME_LOGLEVEL=debug
export ZITI_BROWZER_RUNTIME_HOTKEY=alt+F12
export ZITI_CONTROLLER_HOST=ctrl.${wildcard_url}
export ZITI_CONTROLLER_PORT=${ZITI_CTRL_EDGE_ADVERTISED_PORT}
export ZITI_BROWZER_BOOTSTRAPPER_SCHEME=https
export ZITI_BROWZER_BOOTSTRAPPER_CERTIFICATE_PATH=/etc/letsencrypt/live/${wildcard_url}/fullchain.pem
export ZITI_BROWZER_BOOTSTRAPPER_KEY_PATH=/etc/letsencrypt/live/${wildcard_url}/privkey.pem
export ZITI_BROWZER_BOOTSTRAPPER_LISTEN_PORT=8446
export ZITI_BROWZER_SERVICE=brozac
export ZITI_BROWZER_VHOST=${ZITI_BROWZER_SERVICE}.${wildcard_url}
export ZITI_BROWZER_OIDC_URL=https://dev-b2q0t23rxctngxka.us.auth0.com
export ZITI_BROWZER_CLIENT_ID=v1pzFNuqX8R4EKyqzhtC4duJ1QNIfQ1K

export ZITI_BROWZER_BOOTSTRAPPER_TARGETS="$(cat <<HERE
  {
    "targetArray": [
      {
        "vhost": "${ZITI_BROWZER_VHOST}",
        "service": "${ZITI_BROWZER_SERVICE}",
        "path": "/",
        "scheme": "http",
        "idp_issuer_base_url": "${ZITI_BROWZER_OIDC_URL}",
        "idp_client_id": "${ZITI_BROWZER_CLIENT_ID}"
      }
    ]
  }
HERE
)"

cat > $ZITI_HOME/browzer.env << HERE
ZITI_BROWZER_BOOTSTRAPPER_HOST="${ZITI_BROWZER_BOOTSTRAPPER_HOST}"
ZITI_BROWZER_BOOTSTRAPPER_LOGLEVEL="${ZITI_BROWZER_BOOTSTRAPPER_LOGLEVEL}"
ZITI_BROWZER_RUNTIME_LOGLEVEL="${ZITI_BROWZER_RUNTIME_LOGLEVEL}"
ZITI_BROWZER_RUNTIME_HOTKEY="${ZITI_BROWZER_RUNTIME_HOTKEY}"
ZITI_CONTROLLER_HOST="${ZITI_CONTROLLER_HOST}"
ZITI_CONTROLLER_PORT="${ZITI_CONTROLLER_PORT}"
ZITI_BROWZER_BOOTSTRAPPER_SCHEME="${ZITI_BROWZER_BOOTSTRAPPER_SCHEME}"
ZITI_BROWZER_BOOTSTRAPPER_CERTIFICATE_PATH="${ZITI_BROWZER_BOOTSTRAPPER_CERTIFICATE_PATH}"
ZITI_BROWZER_BOOTSTRAPPER_KEY_PATH="${ZITI_BROWZER_BOOTSTRAPPER_KEY_PATH}"
ZITI_BROWZER_BOOTSTRAPPER_LISTEN_PORT="${ZITI_BROWZER_BOOTSTRAPPER_LISTEN_PORT}"
ZITI_BROWZER_BOOTSTRAPPER_TARGETS='${ZITI_BROWZER_BOOTSTRAPPER_TARGETS}'
NODE_EXTRA_CA_CERTS=node_modules/node_extra_ca_certs_mozilla_bundle/ca_bundle/ca_intermediate_root_bundle.pem
HERE
echo browzer env file written to: $ZITI_HOME/browzer.env
```

## Prepare the OpenZiti Network

### Configure the External JWT Signer and Auth Policy
```bash
ziti edge login -u $ZITI_USER -p $ZITI_PWD -y ${ZITI_CTRL_EDGE_ADVERTISED_ADDRESS}:${ZITI_CTRL_EDGE_ADVERTISED_PORT}

echo "configuring OpenZiti for BrowZer..."
ziti_object_prefix=browzer-auth0
issuer=$(curl -s ${ZITI_BROWZER_OIDC_URL}/.well-known/openid-configuration | jq -r .issuer)
jwks=$(curl -s ${ZITI_BROWZER_OIDC_URL}/.well-known/openid-configuration | jq -r .jwks_uri)

echo "OIDC issuer   : $issuer"
echo "OIDC jwks url : $jwks"

ext_jwt_signer=$(ziti edge create ext-jwt-signer "${ziti_object_prefix}-ext-jwt-signer" "${issuer}" --jwks-endpoint "${jwks}" --audience "${ZITI_BROWZER_CLIENT_ID}" --claims-property email)
echo "ext jwt signer id: $ext_jwt_signer"

auth_policy=$(ziti edge create auth-policy "${ziti_object_prefix}-auth-policy" --primary-ext-jwt-allowed --primary-ext-jwt-allowed-signers ${ext_jwt_signer})
echo "auth policy id: $auth_policy"
```

### Add a Service to Access an HTTP Web App
```bash
intercept_address="${ZITI_BROWZER_SERVICE}.ziti"
intercept_port=80
offload_address=127.0.0.1
offload_port=1408

function createService {
ziti edge create config ${ZITI_BROWZER_SERVICE}.host.config host.v1 '{"protocol":"tcp", "address":"'"${offload_address}"'", "port":'${offload_port}'}'
ziti edge create config ${ZITI_BROWZER_SERVICE}.int.config  intercept.v1 '{"protocols":["tcp"],"addresses":["'"${intercept_address}"'"], "portRanges":[{"low":'${intercept_port}', "high":'${intercept_port}'}]}'
ziti edge create service "${ZITI_BROWZER_SERVICE}" --configs "${ZITI_BROWZER_SERVICE}.host.config","${ZITI_BROWZER_SERVICE}.int.config"
ziti edge create service-policy "${ZITI_BROWZER_SERVICE}.bind" Bind --service-roles "@${ZITI_BROWZER_SERVICE}" --identity-roles "#${ZITI_BROWZER_SERVICE}.binders"
ziti edge create service-policy "${ZITI_BROWZER_SERVICE}.dial" Dial --service-roles "@${ZITI_BROWZER_SERVICE}" --identity-roles "#${ZITI_BROWZER_SERVICE}.dialers"
}

function deleteService {
ziti edge delete config  where 'name contains "'"${ZITI_BROWZER_SERVICE}"'."'
ziti edge delete service where 'name = "'"${ZITI_BROWZER_SERVICE}"'"'
ziti edge delete sp      where 'name contains "'"${ZITI_BROWZER_SERVICE}"'."'
}

createService

```

### Associate/Update Identities with the Auth Policy

WIP: explain this a bit or remove it.
* must match the value defined by the OIDC Provider

```bash
ZITI_BROWZER_IDENTITIES="clint.dovholuk@netfoundry.io curt.tudor@netfoundry.io"
echo "creating users specified by ZITI_BROWZER_IDENTITIES: ${ZITI_BROWZER_IDENTITIES}"
for id in ${ZITI_BROWZER_IDENTITIES}; do
ziti edge create identity user "${id}" --auth-policy ${auth_policy} --external-id "${id}" -a "${ZITI_BROWZER_SERVICE}.dialers"
done

#ziti edge update identity "${id}" -a $(ziti edge list identities 'name="'${id}'"' -j | jq -r '.data[].roleAttributes | map(. // "") | @csv'),"${ZITI_BROWZER_SERVICE}.dialers"
ziti edge update identity "${ZITI_ROUTER_NAME}" -a "${ZITI_BROWZER_SERVICE}.binders"

```

### Setup the BrowZer Bootstrapper

```bash

# clone repo:
git clone https://github.com/openziti/ziti-browzer-bootstrapper.git $ZITI_HOME/ziti-browzer-bootstrapper

# cd to repo path

cd $ZITI_HOME/ziti-browzer-bootstrapper

# install yarn if needed
sudo npm install --global yarn

# issue yarn install
yarn install


createBrowZerSystemdFile
sudo cp "${ZITI_HOME}/browzer-bootstrapper.service" /etc/systemd/system/browzer-bootstrapper.service
sudo systemctl daemon-reload
sudo systemctl enable --now browzer-bootstrapper


```

### Try It Out

```bash

echo " "
echo " "
echo " "
echo "now go to: https://${ZITI_BROWZER_VHOST}:${ZITI_BROWZER_BOOTSTRAPPER_LISTEN_PORT} and see your ${ZITI_BROWZER_SERVICE}!"
echo " "
echo " "
echo " "

journalctl -fu browzer-bootstrapper

```


### If Needed, BrowZer Bootstrapper Logs

```bash
journalctl -fu browzer-bootstrapper
```


## Cleaning up and Trying Again

To clean everything up and try it all over (if you need to) run these commands:
```bash
sudo systemctl stop browzer-bootstrapper
sudo systemctl stop ziti-controller 
sudo systemctl stop ziti-router
sudo rm -rf $HOME/.ziti/quickstart
unsetZitiEnv
cd 
```

