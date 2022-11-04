---
id: router-configuration-file
title: Configuration File
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import styles from './styles.module.css';

:::info Notes
Commented out options with `#` tag are generated by the template but not used for the described deployment. The router ip address is used in the private router option, 
wheres the dns name is used in the public router. This is only to illustrate how either type can be used as an option for any deployment type.
:::

<Tabs groupId="routerType">
<TabItem value="Private" label="Private Router with Edge" attributes={{className: styles.green}}>

This is a network dialing only router with edge. It does not listen for connections from other routers. Set environmental variables that match your deployment 
and run the following command to create the router configuration file on the host VM.
```bash
ZITI_CTRL_ADVERTISED_ADDRESS=controller01.zitinetwork.example.org
ZITI_CTRL_PORT=80
ZITI_ROUTER_ADVERTISED_HOST=192.168.10.11
ZITI_EDGE_ROUTER_IP_OVERRIDE=192.168.10.11
ZITI_EDGE_ROUTER_PORT=443
ROUTER_NAME_PREFIX=$ZITI_ROUTER_ADVERTISED_HOST
ZITI_ROUTER_IDENTITY_CERT="~/.ziti/config/certs/${ROUTER_NAME_PREFIX}.cert"
ZITI_ROUTER_IDENTITY_SERVER_CERT="~/.ziti/config/certs/${ROUTER_NAME_PREFIX}.server.chain.cert"
ZITI_ROUTER_IDENTITY_KEY="~/.ziti/config/certs/${ROUTER_NAME_PREFIX}.key"
ZITI_ROUTER_IDENTITY_CA="~/.ziti/config/certs/${ROUTER_NAME_PREFIX}.cas"

./ziti create config router edge --routerName  $ROUTER_NAME_PREFIX \
                                --output $ROUTER_NAME_PREFIX.yaml \
                                --disableTunneler --private
```
**Expected File Content**
```yaml
v: 3

identity:
    cert:                 "~/.ziti/config/certs/192.168.10.11.cert"
    server_cert:          "~/.ziti/config/certs/192.168.10.11.server.chain.cert"
    key:                  "~/.ziti/config/certs/192.168.10.11.key"
    ca:                   "~/.ziti/config/certs/192.168.10.11.cas"

ctrl:
    endpoint:             tls:controller01.zitinetwork.example.org:80

link:
    dialers:
        - binding: transport
#  listeners:
#    - binding:          transport
#      bind:             tls:0.0.0.0:10080
#      advertise:        tls:192.168.10.11:10080
#      options:
#        outQueueSize:   4

listeners:
# bindings of edge and tunnel requires an "edge" section below
    - binding: edge
    address: tls:0.0.0.0:443
    options:
        advertise: 192.168.10.11:443
        connectTimeoutMs: 1000
        getSessionTimeout: 60
#  - binding: tunnel
#    options:
#
#
#

edge:
    csr:
        country: US
        province: NC
        locality: Charlotte
        organization: NetFoundry
        organizationalUnit: Ziti
        sans:
            dns:
                - Windows-Workstation
                - localhost
            ip:
                - "127.0.0.1"
                - "192.168.10.11"

#transport:
#  ws:
#    writeTimeout: 10
#    readTimeout: 5
#    idleTimeout: 5
#    pongTimeout: 60
#    pingInterval: 54
#    handshakeTimeout: 10
#    readBufferSize: 4096
#    writeBufferSize: 4096
#    enableCompression: true
#    server_cert: ~/.ziti/config/certs/192.168.10.11.server.chain.cert
#    key: ~/.ziti/config/certs/192.168.10.11.key
forwarder:
    latencyProbeInterval: 10
    xgressDialQueueLength: 1000
    xgressDialWorkerCount: 128
    linkDialQueueLength: 1000
    linkDialWorkerCount: 32
```

</TabItem>
<TabItem value="Gateway" label="Private Router with Edge and Tunneler" attributes={{className: styles.orange}}>

This is a network dialing only router with edge and tunneler( i.e. gateway mode). It does not listen for connections from other routers. 
Set environmental variables that match your deployment and run the following command to create the router configuration file on the host VM.
```bash
ZITI_CTRL_ADVERTISED_ADDRESS=controller01.zitinetwork.example.org
ZITI_CTRL_PORT=80
ZITI_ROUTER_ADVERTISED_HOST=192.168.10.11
ZITI_EDGE_ROUTER_IP_OVERRIDE=192.168.10.11
ZITI_EDGE_ROUTER_PORT=443
ZITI_EDGE_ROUTER_LAN_INTERFACE=eth0
ROUTER_NAME_PREFIX=$ZITI_ROUTER_ADVERTISED_HOST
ZITI_ROUTER_IDENTITY_CERT="~/.ziti/config/certs/${ROUTER_NAME_PREFIX}.cert"
ZITI_ROUTER_IDENTITY_SERVER_CERT="~/.ziti/config/certs/${ROUTER_NAME_PREFIX}.server.chain.cert"
ZITI_ROUTER_IDENTITY_KEY="~/.ziti/config/certs/${ROUTER_NAME_PREFIX}.key"
ZITI_ROUTER_IDENTITY_CA="~/.ziti/config/certs/${ROUTER_NAME_PREFIX}.cas"

./ziti create config router edge --routerName  $ROUTER_NAME_PREFIX \
                                --output $ROUTER_NAME_PREFIX.yaml \
                                --Tproxy --private
```
**Expected File Content**
```yaml
v: 3

identity:
    cert:                 "~/.ziti/config/certs/192.168.10.11.cert"
    server_cert:          "~/.ziti/config/certs/192.168.10.11.server.chain.cert"
    key:                  "~/.ziti/config/certs/192.168.10.11.key"
    ca:                   "~/.ziti/config/certs/192.168.10.11.cas"

ctrl:
    endpoint:             tls:controller01.zitinetwork.example.org:80

link:
    dialers:
        - binding: transport
#  listeners:
#    - binding:          transport
#      bind:             tls:0.0.0.0:10080
#      advertise:        tls:192.168.10.11:10080
#      options:
#        outQueueSize:   4

listeners:
# bindings of edge and tunnel requires an "edge" section below
    - binding: edge
    address: tls:0.0.0.0:443
    options:
        advertise: 192.168.10.11:443
        connectTimeoutMs: 1000
        getSessionTimeout: 60
    - binding: tunnel
    options:
        mode: tproxy
        resolver: udp://192.168.10.11:53
        lanIf: eth0

edge:
    csr:
        country: US
        province: NC
        locality: Charlotte
        organization: NetFoundry
        organizationalUnit: Ziti
        sans:
            dns:
                - Windows-Workstation
                - localhost
            ip:
                - "127.0.0.1"
                - "192.168.10.11"

#transport:
#  ws:
#    writeTimeout: 10
#    readTimeout: 5
#    idleTimeout: 5
#    pongTimeout: 60
#    pingInterval: 54
#    handshakeTimeout: 10
#    readBufferSize: 4096
#    writeBufferSize: 4096
#    enableCompression: true
#    server_cert: ~/.ziti/config/certs/192.168.10.11.server.chain.cert
#    key: ~/.ziti/config/certs/192.168.10.11.key
forwarder:
    latencyProbeInterval: 10
    xgressDialQueueLength: 1000
    xgressDialWorkerCount: 128
    linkDialQueueLength: 1000
    linkDialWorkerCount: 32
```

</TabItem>
<TabItem value="Public" label="Public Router with Edge" attributes={{className: styles.red}}>

This is a network dialing and listening router with edge. It listens for connections from other routers. The host firewall needs to be opened to allow connections through. 
In this example code, the ports are 80 and 443. Set environmental variables that match your deployment and run the following command to create the router configuration file on the host VM. 
```bash
ZITI_CTRL_ADVERTISED_ADDRESS=controller01.zitinetwork.example.org
ZITI_CTRL_PORT=80
ZITI_EDGE_ROUTER_RAWNAME=router01.zitinetwork.example.org
ZITI_EDGE_ROUTER_PORT=443
ROUTER_NAME_PREFIX=$ZITI_EDGE_ROUTER_RAWNAME
ZITI_ROUTER_IDENTITY_CERT="~/.ziti/config/certs/${ROUTER_NAME_PREFIX}.cert"
ZITI_ROUTER_IDENTITY_SERVER_CERT="~/.ziti/config/certs/${ROUTER_NAME_PREFIX}.server.chain.cert"
ZITI_ROUTER_IDENTITY_KEY="~/.ziti/config/certs/${ROUTER_NAME_PREFIX}.key"
ZITI_ROUTER_IDENTITY_CA="~/.ziti/config/certs/${ROUTER_NAME_PREFIX}.cas"

./ziti create config router edge --routerName  $ROUTER_NAME_PREFIX \
                                --output $ROUTER_NAME_PREFIX.yaml \
                                --disableTunneler
```
**Expected File Content**
```yaml
v: 3

identity:
    cert:                 "~/.ziti/config/certs/router01.zitinetwork.example.org.cert"
    server_cert:          "~/.ziti/config/certs/router01.zitinetwork.example.org.server.chain.cert"
    key:                  "~/.ziti/config/certs/router01.zitinetwork.example.org.key"
    ca:                   "~/.ziti/config/certs/router01.zitinetwork.example.org.cas"

ctrl:
    endpoint:             tls:controller01.zitinetwork.example.org:80

link:
    dialers:
        - binding: transport
    listeners:
        - binding:          transport
        bind:             tls:0.0.0.0:10080
        advertise:        tls:router01.zitinetwork.example.org:10080
        options:
            outQueueSize:   4

listeners:
# bindings of edge and tunnel requires an "edge" section below
    - binding: edge
    address: tls:0.0.0.0:443
    options:
        advertise: router01.zitinetwork.example.org:443
        connectTimeoutMs: 1000
        getSessionTimeout: 60
#  - binding: tunnel
#    options:
#
#
#

edge:
    csr:
        country: US
        province: NC
        locality: Charlotte
        organization: NetFoundry
        organizationalUnit: Ziti
        sans:
            dns:
                - router01.zitinetwork.example.org
                - localhost
            ip:
                - "127.0.0.1"

#transport:
#  ws:
#    writeTimeout: 10
#    readTimeout: 5
#    idleTimeout: 5
#    pongTimeout: 60
#    pingInterval: 54
#    handshakeTimeout: 10
#    readBufferSize: 4096
#    writeBufferSize: 4096
#    enableCompression: true
#    server_cert: ~/.ziti/config/certs/router01.zitinetwork.example.org.server.chain.cert
#    key: ~/.ziti/config/certs/router01.zitinetwork.example.org.key

forwarder:
    latencyProbeInterval: 10
    xgressDialQueueLength: 1000
    xgressDialWorkerCount: 128
    linkDialQueueLength: 1000
    linkDialWorkerCount: 32
```

</TabItem>
</Tabs>