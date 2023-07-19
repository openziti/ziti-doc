## Run `expressInstall` One-liner

Running the latest version of Ziti locally is as simple as running this one command:

```bash
    source /dev/stdin <<< "$(wget -qO- https://get.openziti.io/quick/ziti-cli-functions.sh)"; expressInstall
```

This script will perform an 'express' install of Ziti which does the following:

* download the latest version of the OpenZiti binary (`ziti`)
* extract the binary into a predefined location: ~/.ziti/quickstart/$(hostname -s)
* create a full PKI for you to explore
* create a controller configuration using default values and the PKI created above
* create an edge-router configuration using default values and the PKI created above 
* add helper functions and environment variables to your shell (explore the script to see all)

## Start the Components

Once the latest version of Ziti has been downloaded and added to your path, it's time to start your controller and 
edge-router.