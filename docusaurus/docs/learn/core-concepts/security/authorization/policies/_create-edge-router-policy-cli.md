
import CliLoginMd from '../../../../../_cli-login.md'

To create an Edge Router Policy using the CLI issue the following commands.

1. ensure you are logged in with the CLI.

    <CliLoginMd/>

1. Create an edge router policy named `my-policy` which allows all identities to use all routers.

    ```bash
    ziti edge create edge-router-policy my-policy --identity-roles '#all' --edge-router-roles '#all'
    ```
