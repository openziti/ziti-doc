
# Troubleshooting

## More Logging

The simplest step you can take toward a diagnosis is to reduce the minimum message log level. This usually means lower-level DEBUG messages and above are emitted in addition to the default level of INFO level and above e.g. WARN, ERROR, etc.

  For `ziti-edge-tunnel`: DEBUG log level is `ziti-edge-tunnel --verbose 4`

## Systemd service won't start or keeps restarting

If you change your package repo subscription or install the same DEB or RPM package from another source, excluding normal upgrades and downgrades, then it may be necessary to reload the systemd service unit definitions:

  ```bash
  sudo systemctl daemon-reload
  ```

You may read the logs in the systemd journal.

```bash
journalctl -xeu ziti-edge-tunnel.service
```

## Intercepting or hosting not working

You may inspect the loaded identity and router info for a running `ziti-edge-tunnel` by dumping it to stdout or the systemd journal with an IPC command, or you may signal to dump the identities' info to a file.

  ```bash
  # dump indentities info to std our journal if systemd unit with IPC command
  ./ziti-edge-tunnel dump
  ```

  ```bash
  # dump identities info to a file and inspect
  sudo pkill -USR1 -f ziti-edge-tunnel
  less /tmp/ziti-dump.964315.dump
  ```

## Process keeps crashing

If the tunneller is crashing then it may be crucial to collect and analyze the core dump file. You may need to enable saving core dumps depending upon your OS configuration.

  You can see how dump files are handled by inspecting this file, which is from Ubuntu 20.10.

  ```bash
  $ cat /proc/sys/kernel/core_pattern
  |/usr/share/apport/apport %p %s %c %d %P %E
  ```

  In this case the dump is handled by `apport` which saves the file in `/var/crash`. I'll need to follow the `apport` documentation to learn how to unpack and parse the dump file.

Please raise [a GitHub issue](https://github.com/openziti/ziti-tunnel-sdk-c/issues/) if you experience a crash.
