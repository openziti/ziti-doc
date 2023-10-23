---
title: Upgrade a Quickstart Network
id: upgrade-quickstart-network
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

This document explains the process for backing up, and upgrading your Ziti Controller and Ziti Router(s).

## Backup Existing Network
You can certainly back up the entire Ziti Network directory (defaulted to `~/.ziti`). However, if you prefer to only 
back up the minimum necessary files, here is how to go about doing that.
1. Create a database backup file by running `ziti edge db snapshot` and copy that file to a backup location. The 
backup file can be found in the same directory as the Controller's db file which is defaulted to `$ZITI_HOME/db/`. The 
Controller's config file will also identify where the db is stored by checking the `db` section in the config.
2. Backup the controller PKI by copying the `$ZITI_HOME/pki/` directory to a backup location
3. Backup the controller config file, also by copying the file to a backup location
4. Backup the environment file `$ZITI_HOME/$(hostname -s).env`

## Stop Existing Services
If your network is using services via `systemd`, stop those services.
```
sudo systemctl stop ziti-router ziti-controller
```

## Get the Latest Binary
Ziti releases can be found [here](https://github.com/openziti/ziti/releases). However, it is recommended to use the 
Ziti CLI function `getZiti` to obtain the binary as this will determine the correct architecture and OS as well as 
download and unzip the file directly into the existing network's `ZITI_BIN` location. The function will also update 
the environment file and variables with the new binary version.

Here is the process for using `getZiti` to obtain the latest binary.
```
source /dev/stdin <<< "$(wget -qO- https://get.openziti.io/quick/ziti-cli-functions.sh)"
getZiti
```
:::note
After upgrading the Ziti binary, be sure to check your PATH to ensure it is pointing to the new binary.
:::

## Update Services
If you have services to start up the network, update them to use the new binary file.

For example, the `ExecStart` section will point to the full path to the old Ziti binary. Update this line to point to 
the path of the newly downloaded Ziti binary.

<Tabs groupId="update-services">
<TabItem value="28.2" label="v0.28.2 or Later">

The `ExecStart` section will point to the full path to the old Ziti binary. Update this line to point to 
the path of the newly downloaded Ziti binary.

For example, the following portion of the `ExecStart`
```
.../ziti-v0.28.0/ziti" controller run 
```
will be updated to the following (assuming a new version of `v0.30.4`).
```
.../ziti-v0.30.4/ziti" controller run
```

</TabItem>
<TabItem value="pre28.2" label="v0.28.1 or Earlier">

In version `v0.28.2`, `ziti-controller`, `ziti-router`, and `ziti-tunnel` were bundled into the `ziti` binary. 
Therefore, in these earlier versions, the `ExecStart` path will not only point to the older version of the Ziti binary 
but the executable used will be `ziti-router` and `ziti-controller`. When upgrading, it is important to change the path 
of the `ExecStart` section to use the new binary (`ziti`).

For example, the following portion of the `ExecStart`
```
.../ziti-v0.27.0/ziti-controller" run 
```
will be updated to the following (assuming a new version of `v0.30.4`). Notice the version and executable change.
```
.../ziti-v0.30.4/ziti" controller run
```

</TabItem>
</Tabs>

## Reload and Start Ziti Services
To reflect changes made to the Ziti services, reload the systemd daemon
```
sudo systemctl daemon-reload
```
Start Ziti services
```
sudo systemctl start ziti-controller ziti-router
```

## Upgrading Versions <=`v0.28.2`
If your old Ziti network was `v0.28.3` or later, this section can be ignored

A major change to environment variables names was performed on `v0.28.3` so, if your network was `v0.28.2` or earlier 
then you may optionally run the following commands to update your env file to use the updated environment variable names.
```
source /dev/stdin <<< "$(wget -qO- https://get.openziti.io/quick/ziti-cli-functions.sh)"
performMigration
```