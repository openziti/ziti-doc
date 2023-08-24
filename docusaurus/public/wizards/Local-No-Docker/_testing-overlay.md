## Testing Your Overlay

At this point you should have a functioning [Ziti Network](/docs/learn/introduction/). The script 
you sourced provides another function to login to your network. Try this now by running `zitiLogin`. You should see 
something similar to this:
```bash
$ zitiLogin
Token: 40d2d280-a633-46c9-8499-ab2e005dd222
Saving identity 'default' to ${HOME}/.ziti/quickstart/My-Mac-mini/ziti-cli.json
```

You can now use the `ziti` CLI to interact with Ziti!. The
`ziti` binary is not added to your path by default but will be available at `"${ZITI_BIN_DIR-}/ziti"`. Add that folder
to your path, alias `ziti` if you like. Let's try to use this command to see if the edge router is online by running:
`"${ZITI_BIN_DIR-}/ziti" edge list edge-routers`.

```bash
$ "${ZITI_BIN_DIR-}/ziti" edge list edge-routers
id: rhx6687N.P    name: My-Mac-mini    isOnline: true    role attributes: {}
results: 1-1 of 1
```

Horray! Our edge router shows up and is online!