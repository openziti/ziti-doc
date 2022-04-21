# ------------- start docker 
docker-compose up

# access the docker controller to create the necessary overlay
docker exec -it docker_ziti-controller_1 bash

# ------------- log into the ziti cli
zitiLogin

# ------------- make at least one router to be public 
ziti edge update edge-router ziti-edge-router -a "public"

# ------------- allow all identities to use any edge router with the attribute "public"
ziti edge delete edge-router-policy all-endpoints-public-routers 
ziti edge create edge-router-policy all-endpoints-public-routers --edge-router-roles "#public" --identity-roles "#all"

# ------------- allows all edge-routers to access all services
ziti edge delete service-edge-router-policy all-routers-all-services
ziti edge create service-edge-router-policy all-routers-all-services --edge-router-roles "#all" --service-roles "#all"

ziti edge delete identity zititunneller-blue
ziti edge create identity device zititunneller-blue -o blue.jwt
ziti edge enroll blue.jwt

# ------------- create a client - probably won't commit
ziti edge create identity device zdewclint -o zdewclint.jwt

# from outside docker:
docker cp docker_ziti-controller_1:/openziti/zdewclint.jwt /mnt/v/temp/


# attach a wholly different docker container with NET_ADMIN priv
# so we can make a tun and provide access to the __blue__ network
docker run --cap-add=NET_ADMIN --device /dev/net/tun --name ziti-tunneler-blue --user root --network docker_zitiblue -v docker_ziti-fs:/openziti --rm -it openziti/quickstart /bin/bash

# ------------- zititunneller-blue
apt install wget unzip
wget https://github.com/openziti/ziti-tunnel-sdk-c/releases/latest/download/ziti-edge-tunnel-Linux_x86_64.zip
unzip ziti-edge-tunnel-Linux_x86_64.zip
clear
./ziti-edge-tunnel run -i blue.json


ziti edge delete config "basic.dial"
ziti edge create config "basic.dial" intercept.v1 '{"protocols":["tcp"],"addresses":["simple.web.test"], "portRanges":[{"low":80, "high":80}]}'

ziti edge delete config "basic.bind"
ziti edge create config "basic.bind" host.v1      '{"protocol":"tcp", "address":"web-test-blue","port":8000}'

ziti edge delete service "basic.web.test.service"
ziti edge create service "basic.web.test.service" --configs "basic.bind,basic.dial"

ziti edge delete service-policy basic.web.test.service.bind.blue
ziti edge create service-policy basic.web.test.service.bind.blue Bind --service-roles "@basic.web.test.service" --identity-roles "@zititunneller-blue"

ziti edge delete service-policy basic.web.test.service.dial.zdew
ziti edge create service-policy basic.web.test.service.dial.zdew Dial --service-roles "@basic.web.test.service" --identity-roles "@zdewclint"




ziti edge delete config "wildcard.dial"
ziti edge create config "wildcard.dial" intercept.v1 '{"protocols":["tcp"],"addresses":["*.blue"], "portRanges":[{"low":8000, "high":8000}]}'

ziti edge delete config "wildcard.bind"
ziti edge create config "wildcard.bind" host.v1      '{"forwardProtocol":true, "allowedProtocols":["tcp","udp"], "forwardAddress":true, "allowedAddresses":["*.blue"], "forwardPort":true, "allowedPortRanges":[ {"low":1,"high":32768}] }'

ziti edge delete service "wildcard.web.test.service"
ziti edge create service "wildcard.web.test.service" --configs "wildcard.bind,wildcard.dial"

ziti edge delete service-policy wildcard.web.test.service.bind.blue
ziti edge create service-policy wildcard.web.test.service.bind.blue Bind --service-roles "@wildcard.web.test.service" --identity-roles "@zititunneller-blue"

ziti edge delete service-policy wildcard.web.test.service.dial.zdew
ziti edge create service-policy wildcard.web.test.service.dial.zdew Dial --service-roles "@wildcard.web.test.service" --identity-roles "@zdewclint"


