
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

All Go Ziti components log to standard output and standard error file descriptors, so their output appears in the systemd journal (`journalctl -xeu ziti-controller.service`) when installed from a Linux package, and the Docker log (`docker compose logs ziti-router`) when run as a container. The C/C++ `ziti-edge-tunnel` has distinct log levels and controls, described in [Linux tunneler troubleshooting](/reference/tunnelers/60-linux/50-linux-tunnel-troubleshooting.mdx).

<Tabs>
<TabItem value="goformats" label="Log Formats">

Output from Ziti components comes in three distinct styles. Choose the style of logging that is right for you.

- `pfxlog` - a human-readable format leveraging ascii escape codes to display colorized log level
- `json` - a machine-readable format targeting automated processes for log aggregation/searching
- `text` - a human-readable format using plain text (no ascii escape codes)

```text title="Run the router without colorized log levels"
ziti router run config.yml --log-formatter text
```

</TabItem>
<TabItem value="golevels" label="Log Levels">

By default the Ziti components will log at the `INFO` level. This means that log messages `INFO`, `WARNING`, `ERROR`, and `FATAL` will all be emitted. Ziti components all support verbose logging by adding `--verbose or -v` to the command being executed. Verbose mode will add `DEBUG` log messages.

```text title="Run the controller with verbose (DEBUG, 4) log level"
ziti controller run config.yml --verbose
```

</TabItem>
</Tabs>
