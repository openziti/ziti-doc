---
title: Quickstart Walkthrough
id: quickstart-walkthrough
---
The following will walk you through the manual process of creating an overlay network with your own PKI. These steps are the same steps that take place behind the scenes when running the OpenZiti Quickstart’s `expressInstall` function.

## General Environment Setup

### Declare Variables

Some global variables used throughout the overlay setup.

- `ZITI_HOME` is the directory where your network files will be stored, the directory will be created if it does not exist already.
- `ZITI_BIN_DIR` is the directory where the ziti binary will be downloaded and extracted
- `ZITI_PWD` is the password that will be used when logging into the controller as the default user (admin).
- `ZITI_HOSTNAME` is used throughout the setup for naming files, network elements, etc.

```bash
export ZITI_HOME="${HOME}/.ziti"
export ZITI_BIN_DIR="${ZITI_HOME}/ziti_bin"
export ZITI_PWD=admin2
export ZITI_HOSTNAME=$(hostname -s)
```

### Create Environment

Create a directory where you will store your network files.

```bash
mkdir -p "${ZITI_HOME}"
```

### Obtain Ziti Binary

The ziti binary is required to setup the network. The exact URL will differ depending on your operating system and architecture. Visit the [releases](https://github.com/openziti/ziti/releases) page to get the appropriate URL.

```bash
mkdir -p "${ZITI_BIN_DIR}"
curl -L <release-url> -o "${ZITI_BIN_DIR}/ziti-bin.gz"
tar -xf "${ZITI_BIN_DIR}/ziti-bin.gz" --directory "${ZITI_BIN_DIR}"
chmod +x "${ZITI_BIN_DIR}/ziti"
```

## Create PKI

You may use an existing PKI if you prefer, however, as part of the `expressInstall` a PKI is generated for you. The following will run through the process of generating your own PKI.

### Setup

Set some initial environment variables for setting up the PKI. The `CA_NAME` values can be any name of your choosing.

- `ZITI_PKI` is the directory where your PKI files will be stored
- `ZITI_ROOT_CA_NAME` is the name of the root CA.
- `ZITI_EXTERNAL_CA_INTERMEDIATE_NAME` is the name of an intermediate CA.
- `ZITI_CTRL_CA_NAME` is the name of the control plane CA.
- `ZITI_EDGE_CA_NAME` is the name of the HTTP API CA
- `ZITI_SIGN_CA_NAME` is the name of the signer CA used to sign identities created for the network.

```bash
export ZITI_PKI="${ZITI_HOME}/pki"
export ZITI_ROOT_CA_NAME="my.root.ca"
export ZITI_EXTERNAL_CA_INTERMEDIATE_NAME="intermediate.from.external.ca"
export ZITI_CTRL_CA_NAME="${ZITI_HOSTNAME}-network-components"
export ZITI_EDGE_CA_NAME="${ZITI_HOSTNAME}-edge"
export ZITI_SIGN_CA_NAME="${ZITI_HOSTNAME}-identities"
```

### Creating the Certificate Authorities

The following creates all of the CAs and files using the environment variables set up previously.

```bash
"${ZITI_BIN_DIR}/ziti" pki create ca \
  --pki-root="${ZITI_PKI}" \
  --ca-name "${ZITI_ROOT_CA_NAME}" \
  --ca-file "${ZITI_ROOT_CA_NAME}"
  
"${ZITI_BIN_DIR}/ziti" pki create intermediate \
  --pki-root="${ZITI_PKI}" \
  --ca-name "${ZITI_ROOT_CA_NAME}" \
  --intermediate-name "${ZITI_EXTERNAL_CA_INTERMEDIATE_NAME}" \
  --intermediate-file "${ZITI_EXTERNAL_CA_INTERMEDIATE_NAME}" \
  --max-path-len "2"

"${ZITI_BIN_DIR}/ziti" pki create intermediate \
  --pki-root="${ZITI_PKI}" \
  --ca-name "${ZITI_EXTERNAL_CA_INTERMEDIATE_NAME}" \
  --intermediate-name "${ZITI_CTRL_CA_NAME}" \
  --intermediate-file "${ZITI_CTRL_CA_NAME}" \
  --max-path-len "1"
  
"${ZITI_BIN_DIR}/ziti" pki create intermediate \
  --pki-root="${ZITI_PKI}" \
  --ca-name "${ZITI_EXTERNAL_CA_INTERMEDIATE_NAME}" \
  --intermediate-name "${ZITI_EDGE_CA_NAME}" \
  --intermediate-file "${ZITI_EDGE_CA_NAME}" \
  --max-path-len "1"
  
"${ZITI_BIN_DIR}/ziti" pki create intermediate \
  --pki-root="${ZITI_PKI}" \
  --ca-name "${ZITI_EXTERNAL_CA_INTERMEDIATE_NAME}" \
  --intermediate-name "${ZITI_SIGN_CA_NAME}" \
  --intermediate-file "${ZITI_SIGN_CA_NAME}" \
  --max-path-len "1"
```

### Create Server and Client Certs for the Control Plane

Set up some initial values for the server and client certificates.

- `ZITI_NETWORK_COMPONENTS_PKI_NAME` is the key file name.
- `ZITI_NETWORK_COMPONENTS_ADDRESSES` is a comma-separated list of DNS names to add to the SANs.
- `ZITI_NETWORK_COMPONENTS_IPS` is a comma-separated list of IPs to add to the SANs.

```bash
ZITI_NETWORK_COMPONENTS_PKI_NAME="ziti.network.components"
ZITI_NETWORK_COMPONENTS_ADDRESSES="localhost,${ZITI_HOSTNAME},some.other.name,and.another.name"
ZITI_NETWORK_COMPONENTS_IPS="127.0.0.1,127.0.21.71,192.168.100.100"
```

Now we’ll create the key, client, and server certs for the control plane.

```bash
"${ZITI_BIN_DIR}/ziti" pki create key \
  --pki-root="${ZITI_PKI}" \
  --ca-name "${ZITI_CTRL_CA_NAME}" \
  --key-file "${ZITI_NETWORK_COMPONENTS_PKI_NAME}"

"${ZITI_BIN_DIR}/ziti" pki create server \
  --pki-root="${ZITI_PKI}" \
  --ca-name "${ZITI_CTRL_CA_NAME}" \
  --key-file "${ZITI_NETWORK_COMPONENTS_PKI_NAME}" \
  --server-file "${ZITI_NETWORK_COMPONENTS_PKI_NAME}-server" \
  --server-name "${ZITI_NETWORK_COMPONENTS_PKI_NAME}-server" \
  --dns "${ZITI_NETWORK_COMPONENTS_ADDRESSES}" \
  --ip "${ZITI_NETWORK_COMPONENTS_IPS}"

"${ZITI_BIN_DIR}/ziti" pki create client \
  --pki-root="${ZITI_PKI}" \
  --ca-name "${ZITI_CTRL_CA_NAME}" \
  --key-file "${ZITI_NETWORK_COMPONENTS_PKI_NAME}" \
  --client-file "${ZITI_NETWORK_COMPONENTS_PKI_NAME}-client" \
  --client-name "${ZITI_NETWORK_COMPONENTS_PKI_NAME}"
```

### Create Server and Client Certs for the HTTP API

Set up some initial values for the server and client certificates. As with the control plane, these are for the key file name, DNS, and IP SANs. The DNS and IP lists are reused from the control plane cert generation.

```bash
ZITI_EDGE_API_PKI_NAME="ziti.edge.controller"
ZITI_EDGE_API_ADDRESSES="${ZITI_NETWORK_COMPONENTS_ADDRESSES}"
ZITI_EDGE_API_IPS="${ZITI_NETWORK_COMPONENTS_IPS}"
```

Now we’ll create the key, client, and server certs for the HTTP API.

```bash
"${ZITI_BIN_DIR}/ziti" pki create key \
  --pki-root="${ZITI_PKI}" \
  --ca-name "${ZITI_EDGE_CA_NAME}" \
  --key-file "${ZITI_EDGE_API_PKI_NAME}"
  
"${ZITI_BIN_DIR}/ziti" pki create server \
  --pki-root="${ZITI_PKI}" \
  --ca-name "${ZITI_EDGE_CA_NAME}" \
  --key-file "${ZITI_EDGE_API_PKI_NAME}" \
  --server-file "${ZITI_EDGE_API_PKI_NAME}-server" \
  --server-name "${ZITI_EDGE_API_PKI_NAME}-server" \
  --dns "${ZITI_EDGE_API_ADDRESSES}" \
  --ip "${ZITI_EDGE_API_IPS}"

"${ZITI_BIN_DIR}/ziti" pki create client \
  --pki-root="${ZITI_PKI}" \
  --ca-name "${ZITI_EDGE_CA_NAME}" \
  --key-file "${ZITI_EDGE_API_PKI_NAME}" \
  --client-file "${ZITI_EDGE_API_PKI_NAME}-client" \
  --client-name "${ZITI_EDGE_API_PKI_NAME}"
```

### Update the CA Bundle

Add the CAs to the CA bundle and make a copy for the HTTP API CA bundle.

```bash
cat "${ZITI_PKI}/my.root.ca/certs/my.root.ca.cert" > "${ZITI_PKI}/${ZITI_HOSTNAME}-network-components/cas.pem"
cat "${ZITI_PKI}/my.root.ca/certs/intermediate.from.external.ca.cert" >> "${ZITI_PKI}/${ZITI_HOSTNAME}-network-components/cas.pem"
cp "${ZITI_PKI}/${ZITI_HOSTNAME}-network-components/cas.pem" "${ZITI_PKI}/${ZITI_HOSTNAME}-edge/edge.cas.pem"
```

## Create Controller

### Setup

Declare some environment variables used to generate the controller config file. Some environment variables used were already set previously.

- `ZITI_CTRL_ADVERTISED_ADDRESS` is the address for the controller’s control plane
- `ZITI_CTRL_EDGE_ADVERTISED_ADDRESS` is the address for the HTTP API
- `ZITI_CTRL_ADVERTISED_PORT` is the port for the control plane
- `ZITI_CTRL_EDGE_ADVERTISED_PORT` is the port for the HTTP API

The following are locations of PKI files.

- `ZITI_PKI_CTRL_KEY`
- `ZITI_PKI_CTRL_SERVER_CERT`
- `ZITI_PKI_CTRL_CERT`
- `ZITI_PKI_CTRL_CA`
- `ZITI_PKI_EDGE_KEY`
- `ZITI_PKI_EDGE_SERVER_CERT`
- `ZITI_PKI_EDGE_CERT`
- `ZITI_PKI_EDGE_CA`
- `ZITI_PKI_SIGNER_KEY`
- `ZITI_PKI_SIGNER_CERT`

```bash
export ZITI_CTRL_ADVERTISED_ADDRESS="${ZITI_HOSTNAME}"
export ZITI_CTRL_EDGE_ADVERTISED_ADDRESS="${ZITI_HOSTNAME}"
export ZITI_CTRL_ADVERTISED_PORT=8440
export ZITI_CTRL_EDGE_ADVERTISED_PORT=8441

export ZITI_PKI_CTRL_KEY="${ZITI_PKI}/${ZITI_CTRL_CA_NAME}/keys/${ZITI_NETWORK_COMPONENTS_PKI_NAME}.key"
export ZITI_PKI_CTRL_SERVER_CERT="${ZITI_PKI}/${ZITI_CTRL_CA_NAME}/certs/${ZITI_NETWORK_COMPONENTS_PKI_NAME}-server.chain.pem"
export ZITI_PKI_CTRL_CERT="${ZITI_PKI}/${ZITI_CTRL_CA_NAME}/certs/${ZITI_NETWORK_COMPONENTS_PKI_NAME}-client.cert"
export ZITI_PKI_CTRL_CA="${ZITI_PKI}/${ZITI_CTRL_CA_NAME}/cas.pem"

export ZITI_PKI_EDGE_KEY="${ZITI_PKI}/${ZITI_EDGE_CA_NAME}/keys/${ZITI_EDGE_API_PKI_NAME}.key"
export ZITI_PKI_EDGE_SERVER_CERT="${ZITI_PKI}/${ZITI_EDGE_CA_NAME}/certs/${ZITI_EDGE_API_PKI_NAME}-server.chain.pem"
export ZITI_PKI_EDGE_CERT="${ZITI_PKI}/${ZITI_EDGE_CA_NAME}/certs/${ZITI_EDGE_API_PKI_NAME}-client.cert"
export ZITI_PKI_EDGE_CA="${ZITI_PKI}/${ZITI_EDGE_CA_NAME}/edge.cas.pem"

export ZITI_PKI_SIGNER_KEY="${ZITI_PKI}/${ZITI_SIGN_CA_NAME}/keys/${ZITI_SIGN_CA_NAME}.key"
export ZITI_PKI_SIGNER_CERT="${ZITI_PKI}/${ZITI_SIGN_CA_NAME}/certs/${ZITI_SIGN_CA_NAME}.chain.pem"
```

### Create the Controller Config File

The controller config file is populated based on the values of environment variables set up to this point.

```bash
"${ZITI_BIN_DIR}/ziti" create config controller >${ZITI_HOME}/${ZITI_HOSTNAME}.yaml
```

### Initialize the Controller

Initializing the controller sets up database files and some of the configuration values.

```bash
mkdir ${ZITI_HOME}/db
"${ZITI_BIN_DIR}/ziti" controller edge init "${ZITI_HOME}/${ZITI_HOSTNAME}.yaml" -u "admin" -p $ZITI_PWD
```

### Run the Controller

```bash
"${ZITI_BIN_DIR}/ziti" controller run ${ZITI_HOME}/${ZITI_HOSTNAME}.yaml &> ${ZITI_HOME}/${ZITI_HOSTNAME}.log &
```

### Wait for the Controller

We want to ensure the controller is ready before creating a router, this mini loop

```bash
while [[ "$(curl -w "%{http_code}" -m 1 -s -k -o /dev/null https://${ZITI_CTRL_ADVERTISED_ADDRESS}:${ZITI_CTRL_EDGE_ADVERTISED_PORT}/edge/client/v1/version)" != "200" ]]; do
  echo "waiting for https://${ZITI_CTRL_ADVERTISED_ADDRESS}:${ZITI_CTRL_EDGE_ADVERTISED_PORT}"
  sleep 1
done
```

## Create Router

### Create the Router Entity

The router needs to be created through the controller. This will generate a one-time token to be used during enrollment.

```bash
# We have to log in first
"${ZITI_BIN_DIR}/ziti" edge login ${ZITI_CTRL_ADVERTISED_ADDRESS}:${ZITI_CTRL_EDGE_ADVERTISED_PORT} -u admin -p $ZITI_PWD -y

"${ZITI_BIN_DIR}/ziti" edge create edge-router ${ZITI_HOSTNAME}-edge-router -o ${ZITI_HOME}/${ZITI_HOSTNAME}-edge-router.jwt -t -a public
```

### Create the Router Config File

Just as with the controller, we need to create a router config file. The router config also uses values set in environment variables up to this point.

```bash
"${ZITI_BIN_DIR}/ziti" create config router edge --routerName ${ZITI_HOSTNAME}-edge-router >${ZITI_HOME}/${ZITI_HOSTNAME}-edge-router.yaml
```

### Enroll the Router with the Controller

Enroll the router with the controller utilizing the config file and enrollment token previously generated.

```bash
"${ZITI_BIN_DIR}/ziti" router enroll ${ZITI_HOME}/${ZITI_HOSTNAME}-edge-router.yaml --jwt ${ZITI_HOME}/${ZITI_HOSTNAME}-edge-router.jwt
```

### Run the Router

```bash
"${ZITI_BIN_DIR}/ziti" router run "${ZITI_HOME}/${ZITI_HOSTNAME}-edge-router.yaml" &> ${ZITI_HOME}/${ZITI_HOSTNAME}-edge-router.log &
```

## Confirm the Network is Up

Log in and run a command to list the edge routers and we should see a single edge router showing `ONLINE`.

```bash
# The session may have expired, log in just to be safe
"${ZITI_BIN_DIR}/ziti" edge login ${ZITI_CTRL_ADVERTISED_ADDRESS}:${ZITI_CTRL_EDGE_ADVERTISED_PORT} -u admin -p $ZITI_PWD -y
"${ZITI_BIN_DIR}/ziti" edge list edge-routers
```

![list-edge-routers.png](./list-edge-routers.png)