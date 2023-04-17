
# Options and Modes

## `ziti-edge-tunnel` Global Options

You can start `ziti-edge-tunnel` with different options, some of the most commonly used options are listed below.

```bash
# Load a single identity.
--identity <identity>
```

```bash
# Load all identities in a dir, ignoring files with a .bak or .original filename suffix.
--identity-dir <dir>
```

```bash
# Set log level, higher is more verbose (default level 3 means INFO).
--verbose N
```

```bash
# Set service polling interval in seconds (default 10).
--refresh N
```

## Run Modes

There are two run modes:

* `run`: transparent proxy with DNS nameserver
* `run-host`: hosting-only without proxy or nameserver

### `run` Mode

`ziti-edge-tunnel run` provides a transparent proxy and nameserver. The nameserver may be configured to be authoritative (the default) or recursive with a command-line option. The OS is automatically configured to treat the nameserver as primary. You may inspect the resulting configuration with these commands.

```bash
resolvectl dns     # inspect the association of tun device and nameserver
resolvectl domain  # inspect the configuration of query routing domains
```

If any interface has a wildcard routing domain configured, `ziti-edge-tunnel` will also configure its tun with a wildcard routing domain. If no other interface has a wildcard routing domain configured, neither will the `ziti-edge-tunnel` tun.

```bash
# Specify the tun interface address and the subnet to which Service domain names are resolved (default 100.64.0.1/10). The nameserver address is always the tun interface address +1, default is 100.64.0.2.
--dns-ip-range <ip range>
```

#### How does `run` configure nameservers?

`ziti-edge-tunnel run` provides a built-in nameserver that will answer queries that exactly match authorized OpenZiti services' intercept domain names, and will respond with a hard-fail `NXDOMAIN` code if the query does not match an authorized service.

You may enable DNS recursion by specifying an upstream nameserver to answer queries for other domain names that are not services' intercept domain names: `ziti-edge-tunnel run --dns-upstream 208.67.222.222`.

`ziti-edge-tunnel` uses the `libsystemd` D-Bus RPC client and will try to configure the OS's resolvers with `systemd-resolved`. If that's not possible for any reason then `ziti-edge-tunnel run` will fall back to shell commands like `resolvectl`. If `resolvectl` fails then `ziti-edge-tunnel run` will attempt to modify `/etc/resolv.conf` directly to install the built-in nameserver as the primary resolver.

If the DNS record exists it returns the answer and sets query status to `NO_ERROR`. If it does not exist then it sends the query to an upstream DNS server if configured. Otherwise, it sets the query status to `REFUSE`. This implies that the caller *should* keep trying to resolve the domain name with other nameservers.

#### System Requirements for Mode `run`

`ziti-edge-tunnel run` requires elevated privileges for managing the `/dev/net/tun` device, running `resolvectl` to assign nameservers and domain routes to the tun interface, and running `ip route` to manage IP routes. This requires running as root because `setcaps` are not inherited in all of these cases, even when the inherit bit is set.

### `run-host` Mode

`ziti-edge-tunnel run-host` is a mode for hosting (listening) for services which does provide service intercepts or DNS. Services configured for 'Bind' will be hosted by the tunneller.

#### System Requirements for Mode `run-host`

`ziti-edge-tunnel run-host` does not require elevated privileges or the above device or socket, only network egress to the servers for which it is hosting Services.

## Multi-Factor Authentication

Complete the following workflow to register a time-based one-time password (TOTP) token generator with the OpenZiti Controller.

### Find the Identifier of the OpenZiti Identity

The `ziti-edge-tunnel tunnel_status` command will list the identifiers of all identities that are currently loaded. The user that runs this command, and all the `ziti-edge-tunnel` commands that follow, must have write permission on the IPC socket, i.e. `/tmp/.ziti/ziti-edge-tunnel.sock`.

Use `sed` and `jq` to parse the JSON output of `ziti-edge-tunnel tunnel_status` and extract the identifiers of all the loaded identities.

```bash
$ ziti-edge-tunnel tunnel_status | sed -E 's/(^received\sresponse\s<|>$)//g' | jq '.Data.Identities[].Identifier'
"/opt/openziti/etc/identities/ziti-id.json"
```

The identifier is "**/opt/openziti/etc/identities/ziti-id.json**" in this example.

### Enable MFA

Initiate MFA registration and obtain a set of recovery codes by running the `enable_mfa` command.

```bash
$ ziti-edge-tunnel enable_mfa --identity /opt/openziti/etc/identities/ziti-id.json     
received response <{"Success":true,"Data":{"Identifier":"/opt/openziti/etc/identities/ziti-id.json","IsVerified":false,"ProvisioningUrl":"o
tpauth://totp/ziti.dev:ziti-id?issuer=ziti.dev&secret=JUDCEDGDOASN6JCO","RecoveryCodes":["2CRGME","3NZXX5","BRBFYQ","C7CG6H","DHF4WI","DPC5
DV","GCXNZX","JHVBDG","JWPKN5","KZRLVZ","L5VO6J","LLPG3U","NJ22N2","NMVG46","RAG2QV","TA6J3R","XVGRRF","Z2TGWZ","ZDW6Y7","ZEOEPL"]},"Cod
e":0}                                                               
>                                                                   
```

### Create a Token Generator

In the TOTP app of your choice, create a new token generator using the seed from the `ProvisioningUrl` field of the response. The seed is the value of the `secret` query parameter in the URL.

### Verify MFA

Complete MFA registration by verifying you have received the TOTP seed.

```bash
$ ziti-edge-tunnel verify_mfa --identity /opt/openziti/etc/identities/ziti-id.json --authcode 193754
received response <{"Success":true,"Code":0}
>
```

### Submit MFA

Whenever MFA is needed, you must submit an MFA token to the OpenZiti Controller before OpenZiti Services will be available. Submit MFA by running the `submit_mfa` command.

```bash
$ ziti-edge-tunnel submit_mfa --identity /opt/openziti/etc/identities/ziti-id.json --authcode 910082
received response <{"Success":true,"Code":0}
>
```

### Troubleshooting

#### OpenZiti Services are Unavailable

The OpenZiti Tunnel will require a new MFA token after the system service is restarted or the session has expired. OpenZiti Services will be unavailable when MfaNeeded=true until MFA is submitted. Submit MFA by running the `submit_mfa` command. You can diagnose this condition by running the `tunnel_status` command and checking the `MfaNeeded` field.

```bash
$ ziti-edge-tunnel tunnel_status|tail -c +20|head -c -2|jq '.Data.Identities[]|select(.Identifier == "/opt/openziti/etc/identities/ziti-id.json")|.MfaNeeded'
true
```

#### MFA Commands get "Permission Denied"

The user that runs the `ziti-edge-tunnel` commands must have write permission on the IPC socket, i.e. `/tmp/.ziti/ziti-edge-tunnel.sock`. If you installed the tunnel program with a Linux package then a permission group named "ziti" was created for you. Otherwise, you must create and join group "ziti."

#### MFA Commands get "Connection Refused"

The `ziti-edge-tunnel` daemon must be running. Start the daemon by running the `run` command. Older versions of the tunnel placed the IPC socket in `/tmp/ziti-edge-tunnel.sock`. Newer versions place the socket in `/tmp/.ziti/ziti-edge-tunnel.sock`. If you are using an older version of the tunnel, you must update to the latest version.
