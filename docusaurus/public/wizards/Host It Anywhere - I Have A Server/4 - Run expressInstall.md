As with any script that is downloaded and run from the internet, we recommend you examine the script before running it locally. This script is provided as a convenience method for installing an environment quickly and easily.

```
source /dev/stdin <<< "$(wget -qO- https://get.openziti.io/quick/ziti-cli-functions.sh)"; expressInstall
```

**systemd**

This assumes you already ran expressInstall on a Linux server. If it's available on your system, then it is recommended to use systemd to manage your controller and router processes. This is useful to make sure the controller can restart automatically should you shutdown/restart the server. To generate the systemd unit files, run:

```
createControllerSystemdFile
createRouterSystemdFile "${ZITI_ROUTER_NAME}"
```

Example output:

```
$ createControllerSystemdFile
Controller systemd file written to: /home/ubuntu/.ziti/quickstart/ip-172-31-23-18/ip-172-31-23-18-edge-controller.service

$ createRouterSystemdFile "${ZITI_ROUTER_NAME}"
Router systemd file written to: /home/ubuntu/.ziti/quickstart/ip-172-31-23-18/ip-172-31-23-18-edge-router.service
```

**The helper functions vs systemd**

The set of startController/stopController, startRouter/stopRouter are functions declared in the the ziti-cli-function.sh helper script and are useful for running the controller and router directly in your shell. These functions are not meant to work with systemd-enabled installs. If you are enabling systemd, use systemctl to start/stop the components. During the expressInstall, the controller and router were started using the helper scripts to complete the installation. Both should not be running, but before you run the controller and router with systemd you need to stop them if they're currently running:

```
stopRouter 
stopController
```

Example output:

```
$ stopRouter 
INFO: Router stopped.

$ stopController 
INFO: Controller stopped.
```

After the systemd service units are generated, you can then install them by running:

```
sudo cp "${ZITI_HOME}/${ZITI_CTRL_NAME}.service" /etc/systemd/system/ziti-controller.service
sudo cp "${ZITI_HOME}/${ZITI_ROUTER_NAME}.service" /etc/systemd/system/ziti-router.service
sudo systemctl daemon-reload
sudo systemctl enable --now ziti-controller
sudo systemctl enable --now ziti-router
```

Example output:

```
$ sudo cp "${ZITI_HOME}/${ZITI_CTRL_NAME}.service" /etc/systemd/system/ziti-controller.service

$ sudo cp "${ZITI_HOME}/${ZITI_ROUTER_NAME}.service" /etc/systemd/system/ziti-router.service

$ sudo systemctl daemon-reload

$ sudo systemctl enable --now ziti-controller
Created symlink from /etc/systemd/system/multi-user.target.wants/ziti-controller.service to /etc/systemd/system/ziti-controller.service.

$ sudo systemctl enable --now ziti-router
Created symlink from /etc/systemd/system/multi-user.target.wants/ziti-router.service to /etc/systemd/system/ziti-router.service.
```

Now, both the controller and the edge router will restart automatically! After a few seconds you can then run these commands and verify systemd has started the processes and see the status:

```
sudo systemctl -q status ziti-controller --lines=0 --no-pager
sudo systemctl -q status ziti-router --lines=0 --no-pager
```

Example output:

```
$ sudo systemctl -q status ziti-controller --lines=0 --no-pager
● ziti-controller.service - Ziti-Controller
      Loaded: loaded (/etc/systemd/system/ziti-controller.service; disabled; vendor preset: enabled)
      Active: active (running) since Thu 2021-11-11 19:05:46 UTC; 8s ago
    Main PID: 2375 (ziti-controller)
        Tasks: 7 (limit: 1154)
      Memory: 43.7M
      CGroup: /system.slice/ziti-controller.service
              └─2375 /home/ubuntu/.ziti/quickstart/ip-10-0-0-1/ziti-bin/ziti-v0.22.11/ziti-controller run /home/ubuntu/.ziti/quickstart/ip-10-0-0-1/co…
                                
$ sudo systemctl -q status ziti-router --lines=0 --no-pager
● ziti-router.service - Ziti-Router for ip-10-0-0-1-edge-router
      Loaded: loaded (/etc/systemd/system/ziti-router.service; disabled; vendor preset: enabled)
      Active: active (running) since Thu 2021-11-11 19:05:47 UTC; 8s ago
    Main PID: 2385 (ziti-router)
        Tasks: 6 (limit: 1154)
      Memory: 231.4M
      CGroup: /system.slice/ziti-router.service
              └─2385 /home/ubuntu/.ziti/quickstart/ip-10-0-0-1/ziti-bin/ziti-v0.22.11/ziti-router run /home/ubuntu/.ziti/quickstart/ip-10-0-0-1/ip-10…
```