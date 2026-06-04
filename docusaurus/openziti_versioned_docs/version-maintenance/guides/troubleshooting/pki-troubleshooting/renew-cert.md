---
title: Renewing Leaf Certificates
sidebar_label: Renewed Certs
id: renew-cert
---

The network uses a combination of client, server, and CA certificates in its PKI. The most important certificates to renew are routers' client and server certificates and identities' client certificates.

## Creating New Certs

### Setup Environment Variables

The following environment variables are the minimum required to renew a cert with the `ziti-cli-functions.sh` script. 
These can be obtained through the `.env` file for your network. However, it is recommended that the `FILE_NAME_ROOT` value is different than 
the existing (expired) cert filenames so a new cert will be created rather than overwriting the existing cert.

```text
# Path to the network PKI root folder
export ZITI_PKI="/home/ubuntu/.ziti/quickstart/homeassistant2/pki"

# The DNS entries the PKI should be valid for
export DNS_ALLOW_LIST="localhost,homeassistant2"

# The IP addresses the PKI should be valid for
export IP_ALLOW_LIST="127.0.0.1,150.136.141.199"
```

### Control Plane Certs

The following values are unique to control plane certs as the edge/API plane will have its own CA and certs. Update 
these values as they pertain to your network PKI setup.

```text
export ZITI_CA_NAME="homeassistant2-intermediate"
export FILE_NAME_ROOT="homeassistant2-new"
```

#### Server Cert

```text
source /dev/stdin <<< "$(wget -qO- https://get.openziti.io/quick/ziti-cli-functions.sh)"; expressInstall
ziti pki create server --pki-root="${ZITI_PKI}" --ca-name "${ZITI_CA_NAME}" \
      --server-file "${FILE_NAME_ROOT}-server" \
      --dns "${DNS_ALLOW_LIST}" --ip "${IP_ALLOW_LIST}" \
      --server-name "${FILE_NAME_ROOT} server certificate"
```

#### Client Cert

```
ziti pki create client --pki-root="${ZITI_PKI}" --ca-name "${ZITI_CA_NAME}" \
          --client-file "${FILE_NAME_ROOT}-client" \
          --key-file "${FILE_NAME_ROOT}-server" \
          --client-name "${FILE_NAME_ROOT}"
```

### Edge / API Certs

#### Update environment for edge certs
The following values are unique to edge/API plane certs as the control plane will have its own CA and certs. Update
these values as they pertain to your network PKI setup.

```
export ZITI_CA_NAME="150.136.141.199-intermediate"
export FILE_NAME_ROOT="150.136.141.199-new"
```

#### Server Cert

```
ziti pki create server --pki-root="${ZITI_PKI}" --ca-name "${ZITI_CA_NAME}" \
      --server-file "${FILE_NAME_ROOT}-server" \
      --dns "${DNS_ALLOW_LIST}" --ip "${IP_ALLOW_LIST}" \
      --server-name "${FILE_NAME_ROOT} server certificate"
```

#### Client Cert

```
ziti pki create client --pki-root="${ZITI_PKI}" --ca-name "${ZITI_CA_NAME}" \
          --client-file "${FILE_NAME_ROOT}-client" \
          --key-file "${FILE_NAME_ROOT}-server" \
          --client-name "${FILE_NAME_ROOT}"
```

## Update Controller Config

If the original files were overwritten, no change is needed. However, if new files were generated alongside existing 
files, the controller config `identity` and `web-->identity` sections need the `cert`, `server_cert`, and `key` fields 
updated to point to the new client, server certs and key. Note that the key is auto-generated when creating the certs.

Now, restart the controller and double check to ensure the certificates are now valid.
