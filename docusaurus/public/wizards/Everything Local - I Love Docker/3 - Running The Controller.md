Here's an example of how to launch a controller using the folder created in the steps above. Also, notice this command passes a couple extra flags you'll see used on this page. Notably the --rm flag and the -it flag. The --rm flag instructs Docker to delete the container when the container exits. The -it flag will run the container interactively. Running interactively like this makes it easier to see the logs produced, but you will need a terminal for each process you want to run. The choice is yours, but in these examples we'll use -it to make seeing the output from the logs easier.

Here's an example which will use the Docker network named "myFirstZitiNetwork" and expose the controller to your local computer on port 1280 (the default port).

```
docker run \
    --network myFirstZitiNetwork \
    --network-alias ziti-controller \
    --network-alias ziti-edge-controller \
    -p 1280:1280 \
    -it \
    --rm \
    -v ~/docker-volume/myFirstZitiNetwork:/persistent/pki \
    -v ~/docker-volume/myFirstZitiNetwork/ziti.env:/persistent/ziti.env \
    openziti/quickstart \
    /var/openziti/scripts/run-controller.sh
```