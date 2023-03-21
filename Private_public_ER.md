Create new router using open ziti

 Update the VM “apt update”

Update the VM “apt upgrade”

Install binary into the ziti home directory using any of following 2 methods

1- source /dev/stdin <<< "$(wget -qO- https://raw.githubusercontent.com/openziti/ziti/db71b1a4a6d70feff70cde3962d2c9f9148a0dd5/quickstart/docker/image/ziti-cli-functions.sh)" getZiti

Or 

2- source /dev/stdin <<< "$(wget -qO- https://get.openziti.io/quick/ziti-cli-functions.sh)"; getZiti

Create config.yaml in the binary installed directory like ZITI_HOME=~/.ziti/quickstart/VM-hstname/ziti-bin/ziti-

Note: By default ER router config will be on tproxy mode. Host made only requres on Public router or hosted router. Never use host mode on private router or Egress edge router.

  Example of config.yaml
v: 3
identity:
     cert: "certs/identity.cert.pem"
     server_cert: "certs/internal.chain.cert.pem"
     key: "certs/internal.key.pem"
     ca: "certs/intermediate-chain.pem"
edge:
    csr:
      country: US
      locality: Charlotte
      organization: Netfoundry
      organizationalUnit: ADV-DEV
      #province: NC
      sans:
        dns:
          - "OMSGER1"                          #local VM Host name
          - "localhost"
        ip:
          - "127.0.0.1"
          - "10.47.0.7" #private IP of the local VM on eth0
ctrl:
    endpoint: tls:157.245.203.171:8440  #157.245.203.171 controller IP, 8440 is ZITI_CTRL_PORT

link:
    dialers:
      - binding: transport

listeners:
    - binding: edge
      address: tls:0.0.0.0:8444
      options:
        advertise: 178.128.48.102:8444  #178.128.48.102 ER Ex IP 8444 ER listener port from cnlr
        maxQueuedConnects:      50
        maxOutstandingConnects: 100
        connectTimeoutMs:       3000
    - binding: tunnel
      options:
        mode: tproxy #tproxy|host
        svcPollRate: 15s
        resolver: udp://10.15.0.6:53               #10.47.0.7 is ER private IP
        dnsSvcIpRange: 100.64.0.1/10
        lanIf: eth0                                          #Lan interface name
forwarder:
  latencyProbeInterval: 10
  xgressDialQueueLength: 1000
  xgressDialWorkerCount: 128
  linkDialQueueLength: 1000
  linkDialWorkerCount: 32

 Create the new folder to install the cert file “mkdir certs" in the ZITI_HOME path

 ./ziti edge login "CONTROLLER PUB_IP":8441   #Where 8441 is the  ZITI_EDGE_CONTROLLER_PORT. You have to provide the user name and password which you created at the time of controller installation default username is admin.

Create the Edge router using new-router as the name of ER and enroll.jwt is the name of jwt file

ziti edge create edge-router $ROUTER_NAME \
--jwt-output-file $ROUTER_NAME.jwt

“./ziti edge create edge-router new-router -t -o enroll.jwt"

For Private ER with Edge and tunneler

ziti edge create edge-router $ROUTER_NAME \
--jwt-output-file $ROUTER_NAME.jwt \
--tunneler-enabled --no-traversal

 Assign edge router attributes ./ziti edge update edge-router new-router -a private

  Register the identity create above enroll.jwt and config.yaml   “./ziti-router enroll config.yaml --jwt enroll.jwt"

 Update the identity using “./ziti edge update identity new-router -a hosts

Verify the create edge router using “./ziti edge list edge-routers"

 To automate the command ./ziti-router run configom.yaml 

Create the router.service in same directry

root@ubuntu-s-1vcpu-2gb-amd-blr1-01:~/.ziti/quickstart/ubuntu-s-1vcpu-2gb-amd-blr1-01/ziti-bin/ziti-v0.27.5# cat router.service
[Unit]
Description=Ziti-Router for edge-router
After=network.target

[Service]
User=root
WorkingDirectory=/root/.ziti/quickstart/ubuntu-s-1vcpu-2gb-amd-blr1-01/ziti-bin/ziti-v0.27.5
ExecStart="/root/.ziti/quickstart/ubuntu-s-1vcpu-2gb-amd-blr1-01/ziti-bin/ziti-v0.27.5/ziti-router" run "/root/.ziti/quickstart/ubuntu-s-1vcpu-2gb-amd-blr1-01/ziti-bin/ziti-v0.27.5/configom.yaml"
Restart=always
RestartSec=2
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target

cp router.service /etc/systemd/system/ziti-router.service

sudo systemctl daemon-reload

sudo systemctl enable --now ziti-router

sudo systemctl -q status ziti-router 

Local DNS entry

Add the local Ip to the DNS for ER running in tunneler mode.Edit the resolved.conf file 

vi /etc/systemd/resolved.conf

DNS=10.47.0.6  #local private Ip of the ER eth0

For digital ocean cloud VM we have to edit the follwing entry

cd /etc/systemd/resolved.conf.d/

rm DigitalOcean.conf

sudo ln -s /dev/null DigitalOcean.conf

systemctl restart systemd-resolved.service

resolvectl

Delete the ER

ziti edge delete edge-routers $ROUTER_NAME
ziti edge delete edge-routers $ROUTER_ID

Update the ER

ziti edge update edge-router $ROUTER_NAME [flags]
ziti edge update edge-router $ROUTER_ID [flags]

example to update attributes : ./ziti edge update edge-router new-router -a private

example to Update the identity using ./ziti edge update identity new-router -a hosts

 Configure the config.yaml for public router: add the bellow line in link listner

link:
dialers:

   binding: transport

listeners:

  binding: transport

bind: tls:0.0.0.0:10080
advertise: tls:165.232.177.92:10080 # 165.232.177.92 is CTRL ip and 10080 CTRL port for public ER
options:
outQueueSize: 4

Verify the ER 
./ziti edge list edge-routers
