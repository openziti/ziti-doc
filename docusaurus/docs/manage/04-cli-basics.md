---
id: cli-basics
title: CLI Basics
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import styles from './02-router/styles.module.css';

This section covers a few CLI basics.

## Login

The `ziti` CLI will help you get a session from the controller's management API. You will be prompted to trust any new server certificates. Your session cache and trust store are managed by the CLI in your home directory.

```bash
# implies https://localhost:1280
ziti edge login -u admin -p admin
```

```bash
# implies https://
ziti edge login ziti.example.com:8441 -u admin -p admin
```

## Logging

All Ziti components log to standard output and standard error file descriptors.

<Tabs>
<TabItem value="goformats" label="Log Formats">

Output from Ziti components comes in three distinct styles. Choose the style of logging that is right for you.

- `pfxlog` - a human-readible format leveraging ascii escape codes to display colorized log level
- `json` - a machine-readible format targetting automated processes for log aggregation/searching
- `text` - a human-readible format using plain text (no ascii escape codes)

```bash
ziti-router run ./router.yml --log-formatter pfxlog
```

</TabItem>
<TabItem value="golevels" label="Log Levels">

By default the Ziti components will log at the `INFO` level. This means that log messages `INFO`, `WARNING`, `ERROR`, and `FATAL` will all be emitted. Ziti components all support verbose logging by adding `--verbose or -v` to the command being executed. Verbose mode will add `DEBUG` log messages.

```bash
ziti-controller run ./ctrl.yml --verbose
```

</TabItem>
</Tabs>
