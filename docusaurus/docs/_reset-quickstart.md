
You may want to re-run `expressInstall` with different parameters or because a readiness check failed. You can run it
again with a new `ZITI_HOME` without touching the current installation, or delete the directory and start fresh:

1. Delete the express install directory. This is permanent — make sure you're deleting the right path.

    ```text
    rm -rI "${ZITI_HOME}"  # probably a sub-directory of ~/.ziti/quickstart/
    ```

1. Unset the `ZITI_` environment variables in your current shell so the next run starts clean:

    ```text
    unsetZitiEnv
    ```

1. Return to the setup steps and set any necessary environment variables before running `expressInstall` again.
