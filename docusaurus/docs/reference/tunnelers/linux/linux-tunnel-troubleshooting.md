
# Troubleshooting

## Increase log level

Set the log level to DEBUG to identify the activity that is occurring at the same time as the problem.

```text
# set the logLevel to "debug" in /var/lib/ziti/config.json
sudo -u ziti ziti-edge-tunnel set_log_level --loglevel DEBUG
```

The tunneler obeys the value of `logLevel` in `/var/lib/ziti/config.json`. The initial value may be set with `run
--verbose 4`, but setting this option on subsequent runs has no effect on log level.

Create a log file from the current systemd service invocation to share with collaborators.

```bash
(set -euxo pipefail; 
ZITI_VERSION=$(/opt/openziti/bin/ziti-edge-tunnel version); 
journalctl _SYSTEMD_INVOCATION_ID=$(
  systemctl show -p InvocationID --value ziti-edge-tunnel-default.service) -l --no-pager \
  | tee /tmp/ziti-edge-tunnel-single-${ZITI_VERSION#v}.log \
  | gzip > /tmp/ziti-edge-tunnel-single-${ZITI_VERSION#v}.log.gz;
)
```

## Systemd service won't start or keeps restarting

Reload the systemd service unit definitions to rule out a stale definition.

```text
sudo systemctl daemon-reload
```

Inspect the service unit.

```text
sudo systemctl cat ziti-edge-tunnel.service
```

Check the service status for an error message.

```text
sudo systemctl status ziti-edge-tunnel.service
```

Monitor the service logs.

```text
sudo journalctl -u ziti-edge-tunnel.service
```

## Intercepting or hosting not working

Inspect the identity and router info for a running tunneler process. This creates a file named like `{{identity name}}.ziti`
for each loaded identity. Each file summarizes the available services and router connections for the identity.

```text
sudo -u ziti ziti-edge-tunnel dump -d /tmp/ziti-dump-dir/
```

Find tunneler's nameserver IP.

```text
$ resolvectl --interface=ziti0 dns
Link 19 (tun0): 100.64.0.2
```

Query the Ziti nameserver to find the intercept IP address for a service.

```text
$ dig +noall +answer my.ziti.service.example.com @100.64.0.2
 my.ziti.service.example.com. 60 IN    A       100.64.0.3
```

The tunneler provides end-to-end TCP handshake. Test the service's ability to accept connections even if it does not
provide a greeting or banner as shown in the OpenSSH server example below.

```text
# wait up to 3 seconds for a TCP handshake on port 443
$ ncat -vzw3 100.64.0.3 443
Ncat: Connected to 100.64.0.3:443.
Ncat: 0 bytes sent, 0 bytes received in 0.08 seconds.
```

```text
# wait up to 3 seconds for an OpenSSH server greeting on port 22
$ ncat -vw3 100.64.0.3 22
SSH-2.0-OpenSSH_7.4
```

## Process keeps crashing

A crash may be caused by a segmentation fault. If saving a Corefile is enabled, Linux will create a core dump file
according to this pattern file: `/proc/sys/kernel/core_pattern`. Ubuntu configures this to use
[Apport](https://wiki.ubuntu.com/Apport). Read more about [core dumps](https://en.wikipedia.org/wiki/Core_dump).

Please raise [a GitHub issue](https://github.com/openziti/ziti-tunnel-sdk-c/issues/) if the tunneler crashes.
