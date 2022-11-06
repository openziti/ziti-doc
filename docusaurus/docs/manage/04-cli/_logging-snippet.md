import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import styles from '../02-router/styles.module.css';

The Ziti components log all output to standard output. Logging to standard out, instead of to configurable files, etc., is a "lighter" approach to logging that is more easily integrated into more different kinds of environments. Logging to files and implementing feautres like file rotation is a solved problem and not one that the Ziti components try to solve. Instead look to alternatives which are capable of watching standard out and aggregating the results for you. There are many solutions available to collect, aggregate and display logs. Search for and implement a solution that works for you and your needs.

<Tabs>
<TabItem value="format" label="Log Format" attributes={{className: styles.green}}>

The output from Ziti components comes in three distinct styles. Choose the style of logging that is right for you.
- `pfxlog` - a human-readible format leveraging ascii escape codes to display colorized log level
- `json` - a machine-readible format targetting automated processes for log aggregation/searching
- `text` - a human-readible format using plain text (no ascii escape codes)

```bash
<openziti binary> run <config file> \
                    --log-formatter pfxlog
```

</TabItem>
<TabItem value="level" label="Log Levels" attributes={{className: styles.orange}}>

By default the Ziti components will log at the INFO level. This means that `log messages INFO, WARNING, ERROR and FATAL` will all be captured and output. Ziti components all support verbose logging by adding `--verbose or -v` to the command being executed. Verbose mode will add DEBUG log messages and as the name implies this log level is much more verbose. Often when debugging adding verbose mode will aid in identifying issues.

```bash
<openziti binary> run <config file> \
                    --verbose
```

</TabItem>
</Tabs>