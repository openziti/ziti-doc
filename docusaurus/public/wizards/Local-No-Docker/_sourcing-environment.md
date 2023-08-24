## Sourcing the Env File

In the case you close your shell and you want to get the same environment variables back into your shell, you can just 
source the "env" file that is placed into the location you specified. This file is usually located at:
`$HOME/.ziti/quickstart/$(hostname)/$(hostname).env`. You can source this file to place the environment variables back
into your shell.

```bash
source $HOME/.ziti/quickstart/$(hostname)/$(hostname).env
```