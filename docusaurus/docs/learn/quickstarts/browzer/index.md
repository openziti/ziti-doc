---
title: BrowZer
---

BrowZer is a set of technologies which is capable of bootstrapping zero trust connectivity entirely in a browser,
and withouth client-side software installation! To enable BrowZer on your OpenZiti Network the `ziti-http-agent (name tbd)`
will need to be deployed. This guide will show you how to deploy BrowZer to your own overlay.

## Prerequisites

To deploy and enable BrowZer on your OpenZiti Network, you will need to have:

* an OpenZiti Overlay Network is available and has been configured with [Alternative Server Certs](../../../guides/alt-server-certs.md)
* an OIDC Provider and the ability to define applications/clients for the provider
* a wildcard certificate from a 3rd party verifiable CA

### OIDC Prerequisites

Enabling BrowZer will require configuring the OpenZiti Network to delegate authentication to an OIDC provider. Every OIDC
provider is different and understanding OIDC flows is beyond this guide. There are 
[numerous](https://www.oauth.com/oauth2-servers/client-registration/client-id-secret/), 
[excellent](https://developer.okta.com/blog/2019/10/21/illustrated-guide-to-oauth-and-oidc)
[posts](https://developers.google.com/identity/openid-connect/openid-connect) to find and read about OIDC. The OIDC 
concepts you will want to understand are:

* how to create/obtain the client id the OpenZiti Network will use
* how to learn/find/discover the OIDC discovery endpoint
* what `audience` the OIDC provider will add to the bearer token
* what field or `claim` the OIDC provider will add to the bearer token which will be used to locate matching identities

## Configuring the OpenZiti Network

With the OIDC information in hand, the next step is to actually configure OpenZiti to allow the delegation of authentication.
To do this youwill need to:

* create an [external jwt signer](../../../../docs/learn/core-concepts/security/authentication/50-external-jwt-signers.md)
* create an [authentication policy](../../../../docs/learn/core-concepts/security/authentication/authentication-policies)
and associate the external jwt signer
* associate identities with the authentication policy delegating the authentication to the specified OIDC provider

### Creating the External JWT Signer

To create the external jwt signer, you will need to have the OIDC discovery endpoint and the `audience` values handy.
Using the OIDC discovery endpoint, discover the `issuer` and `jwks_uri` from the discovery endpoint. Using the `ziti`
CLI, create the external jwt. Shown below is a `bash` example. Replace the values accordingly. Capture the returned
identity, it will be necessary after creating the external jwt signer:

```bash
issuer="__issuer_id_here__"
jwks_uri="__jwks_uri_here__"
audience="__audience_here__"
claims_property="email"
ziti edge create ext-jwt-signer \
  "ext-jwt-signer-name-here" "${issuer}" \
  --jwks-endpoint "${jwks_uri}" \
  --audience "${audience}" \
  --claims-property ${claims_property}
```

### Creating the Authentication Policy

Authentication policy configure the OpenZiti Network to delegate authentication one or more OIDC providers. To
create the authentication policy you only need the id of the external jwt signer (from above). Shown below is a `bash` 
example. Replace the values accordingly. Capture the returned identity, it will be necessary after creating the external
jwt signer:

:::note
Shown below is an example creating a __new__ authentication policy and allowing it to be used for __primary__
authentication. This means the associated external jwt signer (OIDC provider) is allowed to provide a document that
OpenZiti will validate, and use for authentication. You can also choose to modify the __default__ policy if you decide
to. You do not need to create a __new__ policy. If this is your first time using BrowZer it is recommended you start
with a new authentication policy, as shown. Once you understand how authentication policies work and how BrowZer works,
then you can make an informed decision if you want to modify the default authentication policy or not
:::

```bash
ext_jwt_signer="__ext_jwt_signer_id_from_above__"
ziti edge create auth-policy \
  "auth-policy-name-here" \
  --primary-ext-jwt-allowed \
  --primary-ext-jwt-allowed-signers ${ext_jwt_signer}
```

### Associate Identities to the Authentication Policy

With an auth policy created and associated to the external jwt signer, you are now ready to create or modify identities
with this new authentication policy. To allow a given identity to be enabled for BrowZer, you will need to first
update (or create) the identity with an `externalId` and you will need to associate the identity with the authentication
policy.

In this example, a new identity will be created and the associated OIDC provider will be expected to provide a bearer
token which has an `email` claim with the value `ziggy@openziti.io` and names the identity `openziti_ziggy`:
```bash
identity_name="openziti_ziggy"
auth_policy="__auth_policy_id_from_above__"
external_id="ziggy@openziti.io"
ziti edge create identity user "${identity_name}" \
  --auth-policy ${auth_policy} \
  --external-id "${external_id}" \
  -a docker.whale.dialers
```

## Running the Ziti BrowZer Bootstrapper

Running the Ziti BrowZer Bootstrapper can be done directly using NodeJS or with a container engine such as docker. Either
way you choose to run it, you will need to establish some environment variables. If you are using NodeJS, you'll `export`
them. For Docker-based running, you can eitehr reference the environment variables (shown below) or use a `.env` file
if you prefer.

* `NODE_ENV`: controls if the environment is `production` or `development`
* `ZITI_BROWZER_RUNTIME_LOGLEVEL`: the log level for the Ziti BrowZer Runtime (ZBR) to use. `trace|debug|info|warn|error`
* `ZITI_BROWZER_RUNTIME_HOTKEY`: the hotkey to activate the BrowZer settings dialog modal. default: alt+F12
* `ZITI_CONTROLLER_HOST`: the "alternative" address for the OpenZiti controller. example: `ctrl.openziti.io`
* `ZITI_CONTROLLER_PORT`: the port to find the OpenZiti controller at. example: `8441`
* `ZITI_AGENT_LOGLEVEL`: the log level for the ziti-http-agent to log at. `trace|debug|info|warn|error`
* `ZITI_AGENT_HOST`: the address the ziti-http-agent is available at. example: `browzer.openziti.io`
* `ZITI_AGENT_LISTEN_PORT`: the port the ziti-http-agent is available at. example: `443`
* `ZITI_AGENT_SCHEME`: the scheme to use to access the ziti-http-agent. `http|https` (https by default)
* `ZITI_AGENT_CERTIFICATE_PATH`: the path to the certificate the ziti-http-agent presents to clients
* `ZITI_AGENT_KEY_PATH`: the associated key for the ZITI_AGENT_CERTIFICATE_PATH
* `ZITI_AGENT_TARGETS`: A json block representing the services to enable BrowZer for. __more on this below__

```bash
      NODE_ENV: production
      ZITI_BROWZER_RUNTIME_LOGLEVEL: debug
      ZITI_BROWZER_RUNTIME_HOTKEY: alt+F12
      ZITI_CONTROLLER_HOST: ${ZITI_CTRL_EDGE_ALT_ADVERTISED_ADDRESS}
      ZITI_CONTROLLER_PORT: ${ZITI_CTRL_EDGE_ADVERTISED_PORT}
      ZITI_AGENT_LOGLEVEL: debug
      ZITI_AGENT_HOST: ${ZITI_BROWZER_HTTP_AGENT_ADDRESS}
      ZITI_AGENT_LISTEN_PORT: ${ZITI_AGENT_LISTEN_PORT}
      ZITI_AGENT_SCHEME: https
      ZITI_AGENT_CERTIFICATE_PATH: /etc/letsencrypt/live/your.fqdn.here/fullchain.pem
      ZITI_AGENT_KEY_PATH: /etc/letsencrypt/live/your.fqdn.here/privkey.pem
      ZITI_AGENT_TARGETS: __more on this below__
```

Set these values accordingly. Also shown is the reuse of certificates provisioned in this case by LetsEncrypt. BrowZer
requires a wildcard certificate to be provisioned that aligns to the `ZITI_AGENT_HOST` value used. For example, if you had
set `ZITI_AGENT_HOST=my.custom.network`, the certificate must be valid for `*.my.custom.network`

:::note
If you use certbot/LetsEncrypt, the certificate created are probably permissioned to be accessable by root only.
You will need to modify the folder/files accordingly. 
accordingly.
:::

## Cloning From GitHub

Once the environment variables are set, to start the Ziti BrowZer Bootstrapper perform the following:

* clone the repository and checkout the desired tag/version. `main` should be fine:
    ```
    git clone https://github.com/openziti/ziti-http-agent.git $ZITI_HOME/ziti-http-agent
    ```
* cd to the cloned location: `cd $ZITI_HOME/ziti-http-agent`
* ensure the proper version of node and yarn are installed and run yarn install: `yarn install`
* start the node server:
    ```
    NODE_EXTRA_CA_CERTS=node_modules/node_extra_ca_certs_mozilla_bundle/ca_bundle/ca_intermediate_root_bundle.pem node index.js
    ```

## Running via Docker

Running the Ziti BrowZer Bootstrapper using Docker is similar to running with NodeJS. Establish the environment variables
then run the agent with a command as shown. Note that this is running in the foreground. It's up to you to decide to put
this into daemon mode, to use docker compose, etc.

:::note
To work around the LetsEncrypt issue mentioned above (the certs only visible to root), this example explicitly sets the
--user the container runs as. Shown is using a group id of 2171. Not shown was the establishment of this group prior to
running in docker. On the host os, a group was added using a command such as: `sudo groupadd -g 2171 zitiweb`. Then the
LetsEncrypt folder containing the certificates/keys was chown'ed: `sudo chown -R root:zitiweb /etc/letsencrypt/`.
This allows the docker container that will run the bootstrapper to access the files

Understanding the exact mechanics of why/how this works is beyond the scope of this page and is more relevant to linux/docker
system administration.
:::

### Example Docker Command
```bash
docker run \
  --name ziti-http-agent \
  --rm -v /etc/letsencrypt:/etc/letsencrypt \
  --user "1000:2171" \
  -p ${ZITI_AGENT_LISTEN_PORT}:${ZITI_AGENT_LISTEN_PORT} \
  -e NODE_ENV="${NODE_ENV}" \
  -e ZITI_AGENT_LOGLEVEL="${ZITI_AGENT_LOGLEVEL}" \
  -e ZITI_BROWZER_RUNTIME_LOGLEVEL="${ZITI_BROWZER_RUNTIME_LOGLEVEL}" \
  -e ZITI_BROWZER_RUNTIME_HOTKEY="${ZITI_BROWZER_RUNTIME_HOTKEY}" \
  -e ZITI_CONTROLLER_HOST="${ZITI_CONTROLLER_HOST}" \
  -e ZITI_CONTROLLER_PORT="${ZITI_CONTROLLER_PORT}" \
  -e ZITI_AGENT_HOST="${ZITI_AGENT_HOST}" \
  -e ZITI_AGENT_SCHEME="${ZITI_AGENT_SCHEME}" \
  -e ZITI_AGENT_CERTIFICATE_PATH="${ZITI_AGENT_CERTIFICATE_PATH}" \
  -e ZITI_AGENT_KEY_PATH="${ZITI_AGENT_KEY_PATH}" \
  -e ZITI_AGENT_LISTEN_PORT="${ZITI_AGENT_LISTEN_PORT}" \
  -e ZITI_AGENT_TARGETS="${ZITI_AGENT_TARGETS}" \
  ghcr.io/openziti/ziti-http-agent:latest
  
```