# establish some variables which are used below
service_name=zsshSvc
client_identity="${service_name}"Client
server_identity="${service_name}"Server
the_port=22

# create two identities. one host - one client. Only necessary if you want/need them. Skippable if you
# already have an identity. provided here to just 'make it easy' to test/try
ziti edge create identity device "${server_identity}" -a "${service_name}"ServerEndpoints -o "${server_identity}".jwt
ziti edge create identity device "${client_identity}" -a "${service_name}"ClientEndpoints -o "${client_identity}".jwt

# if you want to modify anything, often deleting the configs/services is easier than updating them
# it's easier to delete all the items too - so until you understand exactly how ziti works,
# make sure you clean them all up before making a change
ziti edge delete config "${service_name}"-host.v1
ziti edge delete config "${service_name}"-client-config
ziti edge delete service "${service_name}"
ziti edge delete service-policy "${service_name}"-binding
ziti edge delete service-policy "${service_name}"-dialing

ziti edge create config "${service_name}"-host.v1 host.v1 '{"protocol":"tcp", "address":"localhost","port":'"${the_port}"', "listenOptions": {"bindUsingEdgeIdentity":true}}'
# intercept is not needed for zscp/zssh but make it for testing if you like
ziti edge create config "${service_name}"-client-config intercept.v1 '{"protocols":["tcp"],"addresses":["'"${service_name}.ziti"'"], "portRanges":[{"low":'"${the_port}"', "high":"'${the_port}"'}]}'
ziti edge create service "${service_name}" --configs "${service_name}"-client-config,"${service_name}"-host.v1
ziti edge create service-policy "${service_name}"-binding Bind --service-roles '@'"${service_name}" --identity-roles '#'"${service_name}"'ServerEndpoints'
ziti edge create service-policy "${service_name}"-dialing Dial --service-roles '@'"${service_name}" --identity-roles '#'"${service_name}"'ClientEndpoints'
