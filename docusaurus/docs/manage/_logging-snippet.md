## Logging

The Ziti components log all output to standard output. Logging to standard out, instead of to configurable files, etc.,
is a "lighter" approach to logging that is more easily integrated into more different kinds of environments. Logging to
files and implementing feautres like file rotation is a solved problem and not one that the Ziti components try to
solve.  Instead look to alternatives which are capable of watching standard out and aggregating the results for you.
There are many solutions available to collect, aggregate and display logs. Search for and implement a solution that
works for you and your needs.

### Log Format

The output from Ziti components comes in three distinct styles.  Choose the style of logging that is right for you.

1. `pfxlog` - a human-readible format leveraging ascii escape codes to display colorized log level
1. `json`   - a machine-readible format targetting automated processes for log aggregation/searching
1. `text`   - a human-readible format using plain text (no ascii escape codes)

### Log Levels

By default the Ziti components will log at the INFO level. This means that log messages INFO, WARNING, ERROR and FATAL
will all be captured and output.  Ziti components all support verbose logging by adding `--verbose` or `-v` to the
command being executed.  Verbose mode will add DEBUG log messages and as the name implies this log level is much more
verbose. Often when debugging adding verbose mode will aid in identifying issues.
