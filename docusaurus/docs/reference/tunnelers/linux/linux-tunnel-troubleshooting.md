
# Troubleshooting

## Environment Variables

The simplest step you can take toward a diagnosis is to reduce the minimum message log level. This usually means lower-level DEBUG messages and above are emitted in addition to the default level of INFO level and above e.g. WARN, ERROR, etc.

  <!-- ocluding this because it doesn't work in Linux due to the higher precedence of the undocumented config.json file -->
  <!-- For `ziti-edge-tunnel`, `DEBUG` log level is `--verbose 4`. -->

`ZITI_TIME_FORMAT=utc` - set the log message time format to UTC timestamp instead of milliseconds since start

`ZITI_LOG=4` - set the log level of the underlying Ziti C SDK, higher is more verbose (level 4 means DEBUG)

`TLSUV_DEBUG=4` - set the log level of the underlying libuv library, higher is more verbose (level 4 means DEBUG)

<!-- Ken will update this when a better C SDK reference becomes available; this is a full URL because Docusaurus resolves relative and absolute URL and file paths at build time, and the Vercel build will always fail because it can't resolve the linked docs sites, e.g. CLANG doxygen site -->
For more information about configuring the underlying Ziti C SDK with environment variables, see [the Ziti C SDK documentation](https://docs.openziti.io/docs/reference/developer/sdk/clang/).

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
  # dump identities info to std our journal if systemd unit with IPC command
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
