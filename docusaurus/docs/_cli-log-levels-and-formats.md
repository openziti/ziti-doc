
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

All Ziti components log to standard output and standard error file descriptors.

<Tabs>
<TabItem value="goformats" label="Log Formats">

Output from Ziti components comes in three distinct styles. Choose the style of logging that is right for you.

- `pfxlog` - a human-readable format leveraging ascii escape codes to display colorized log level
- `json` - a machine-readable format targeting automated processes for log aggregation/searching
- `text` - a human-readable format using plain text (no ascii escape codes)

```
ziti-router run ./router.yml --log-formatter pfxlog
```

</TabItem>
<TabItem value="golevels" label="Log Levels">

By default the Ziti components will log at the `INFO` level. This means that log messages `INFO`, `WARNING`, `ERROR`, and `FATAL` will all be emitted. Ziti components all support verbose logging by adding `--verbose or -v` to the command being executed. Verbose mode will add `DEBUG` log messages.

```
ziti-controller run ./ctrl.yml --verbose
```

</TabItem>
</Tabs>
