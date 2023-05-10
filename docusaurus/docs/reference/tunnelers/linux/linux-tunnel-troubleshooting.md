
# Troubleshooting

## More Logging

The simplest step you can take toward a diagnosis is to reduce the minimum message log level. This usually means lower-level DEBUG messages and above are emitted in addition to the default level of INFO level and above e.g. WARN, ERROR, etc.

  For `ziti-edge-tunnel`, `DEBUG` log level is `--verbose 4`.

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

## Tunnel service is running but tun device is DOWN

If the tunnel service is running and tun device is DOWN then the tunneller will not be able to establish a connection to the Ziti network. You can check the status of the tun device with the `ip` command.

```bash
$ ip link sh tun0
202: tun0: <POINTOPOINT,MULTICAST,NOARP> mtu 1500 qdisc noop state DOWN mode DEFAULT group default qlen 500
    link/none 
```

Potential causes include override capabilities are set on the `/bin/ip` command.

  ```bash
  $ attr -l /bin/ip
  Attribute "capability" has a 20 byte value for /bin/ip

  $ getcap /bin/ip
  /bin/ip =
  ```

An empty set of capabilities prevents inheriting ambient capabilities when invoked by systemd. You can remove the empty set with the `setcap -r` command.

  ```bash
  sudo setcap -r /bin/ip
  ```

Now the capabilities are completely removed.

  ```bash
  $ attr -l /bin/ip

  $ getcap /bin/ip
  ```

Restart the tunneller service.

  ```bash
  sudo systemctl restart ziti-edge-tunnel
  ```
