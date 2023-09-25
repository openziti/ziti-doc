---
title: Reset the Quickstart
id: reset-quickstart
---

You may want to re-run `expressInstall` with different parameters or because a readiness check failed. You could run it again with a new `ZITI_HOME` without changing the current installation or delete the directory and begin again with these steps:

1. Delete the express install directory. Delete is forever, so make sure you're deleting the right thing.

    ```
    rm -rI "${ZITI_HOME}"  # probably a sub-directory of ~/.ziti/quickstart/ 
    ```

1. If the current shell environment was configured by the express install you may unset vars named like `ZITI_`. This will prepare your current shell environment to set up and re-run `expressInstall`.

    ```
    unsetZitiEnv
    ```

1. Return to set up steps before running `expressinstall`, e.g., setting the necessary environment variables for the next run.
