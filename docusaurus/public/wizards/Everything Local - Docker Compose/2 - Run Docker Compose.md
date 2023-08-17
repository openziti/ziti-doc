Once the compose file is downloaded and the .env file exists, you'll be able to start this network using docker compose just like you can with any other compose file: docker compose up

Note: Docker compose will name your containers based on the folder you were in when you started them. For me, I've made a folder named docker so all my containers start with docker_. You can influence how this works by adding --project-name docker (or whatever name you like) to your docker compose up/down commands

```
docker compose --project-name docker up
```

**Stopping the Network**

This docker-compose file will generate a volume mount as well as a two docker networks. When you issue --project-name docker down the volume mapping will not be removed. If you wish to remove the volume, you'll need to specify the -v flag to the docker compose command. Leave the -v off your command if you want to just stop the containers without losing the controller database and PKI.