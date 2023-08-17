If you are not familiar with it, Docker Compose is a tool for defining and running multi-container Docker applications. It makes deploying multiple containers easy by using a declarative format defined via yaml. Note that this page uses "Compose V2". This means all the commands shown will reference docker compose, not docker-compose. If you're using the older style of compose, consider upgrading to the newer v2.

**Preparation - Required Files**

First, grab the compose file from the ziti repository.

Using curl that would look like this:

```
curl -so docker-compose.yaml https://get.openziti.io/dock/docker-compose.yml
Next, grab the default environment file or just make a file in this folder that looks like this:
```

```
curl -so .env https://get.openziti.io/dock/.env
```

or, if you would prefer to make your .env file manually, create a file in some way such as using the command shown below:

```
cat > .env DEFAULT_ENV_FILE
# OpenZiti Variables
ZITI_IMAGE=openziti/quickstart
ZITI_VERSION=latest
ZITI_CTRL_EDGE_ADVERTISED_ADDRESS=ziti-edge-controller

## Additional variables to override. 
#ZITI_CTRL_EDGE_ADVERTISED_ADDRESS=some.other.name.com
#ZITI_CTRL_EDGE_ADVERTISED_PORT=1280
#ZITI_EDGE_CONTROLLER_IP_OVERRIDE=20.20.20.20
DEFAULT_ENV_FILE>
```

**CAUTION:** If you are running Void linux, you need to modify the docker-compose file, otherwise the services will not start properly. To do this, add the following two lines to each service definition.

```
security_opt:
- seccomp:unconfined
```

Please see this discussion for more information