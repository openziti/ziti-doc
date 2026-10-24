# Step 5: Enroll a client

Every client gets its own identity, tagged `dnslab-clients` so the Dial policy from step 4 picks it up. One identity
per device, never shared. That way you can see each one in ZAC and revoke one without touching the others.

## Create the identity

One per test client:

```
ziti edge create identity dnslab-client-win     --role-attributes dnslab-clients -o dnslab-client-win.jwt
ziti edge create identity dnslab-client-linux   --role-attributes dnslab-clients -o dnslab-client-linux.jwt
ziti edge create identity dnslab-client-android --role-attributes dnslab-clients -o dnslab-client-android.jwt
```

In ZAC: Identities -> add, attribute `dnslab-clients`, then download the JWT or show its QR code (handy for the
phone).

## Install the tunneler and enroll

**Windows**: install Ziti Desktop Edge for Windows. Tray icon -> Add Identity -> pick the `.jwt`.

**Linux**: install `ziti-edge-tunnel` from the OpenZiti package repo, then:

```
sudo ziti-edge-tunnel add --jwt "$(< ./dnslab-client-linux.jwt)" --identity dnslab-client-linux
```

If `add` fails with a socket error, see the troubleshooting in step 2.

**Android**: install Ziti Mobile Edge from the Play Store. Add Identity -> scan the QR code from ZAC, or open the
`.jwt` file.

## Check it works

Stay on your LAN for these. Testing from off the LAN comes in step 7. The OS DNS settings don't change until step 6,
so every check here names the Pi-hole explicitly.

### 1. The controller says the client may dial the service

```
ziti edge policy-advisor services -q dnslab-dns dnslab-client-win
ziti edge policy-advisor services -q dnslab-dns dnslab-client-linux
ziti edge policy-advisor services -q dnslab-dns dnslab-client-android
```

Expect `OKAY` with Dial permission for each.

### 2. The client received the service

Linux:

```
sudo ziti-edge-tunnel tunnel_status | jq -r '.Data.Identities[] | "\(.Name): \([.Services[]?.Name] | join(","))"'
```

Expect a line like `dnslab-client-linux: dnslab-dns`. Other services may show too if older policies grant them.

Windows: open the identity in Desktop Edge and look for `dnslab-dns` in its service list.

### 3. Traffic to the Pi-hole goes into the tunneler

Linux:

```
ip route get 192.168.1.53
```

Expect `192.168.1.53 dev ziti0 src 100.64.0.1`. The tunneler adds a `/32` route for the intercepted IP. That beats
your LAN's `/24`, so even at home the query goes through the overlay instead of straight across the LAN.

Windows:

```
Find-NetRoute -RemoteIPAddress 192.168.1.53 | Select-Object InterfaceAlias
```

Expect the Ziti adapter, not Wi-Fi or Ethernet.

### 4. Pi-hole answers over the overlay

From the client:

```
nslookup doubleclick.net 192.168.1.53
```

Expect Pi-hole's block answer:

```
Server:   192.168.1.53
Name:     doubleclick.net
Address:  0.0.0.0
Name:     doubleclick.net
Address:  ::
```

### 5. Pi-hole saw the query come from its own tunneler

On the Pi-hole:

```
sudo grep doubleclick.net /var/log/pihole/pihole.log | tail -3
```

Expect something like:

```
dnsmasq[3860698]: gravity blocked doubleclick.net is 0.0.0.0
dnsmasq[3860698]: query[AAAA] doubleclick.net from 127.0.0.1
dnsmasq[3860698]: gravity blocked doubleclick.net is ::
```

`nslookup` asks for both A and AAAA, so you'll see either `query[A]` or `query[AAAA]`. A `127.0.0.1` source means the Pi-hole's tunneler handed it the
query. If you see the client's LAN IP instead, the query skipped the overlay. Go back to check 3.

## Done when

- [ ] policy-advisor says `OKAY` for each client
- [ ] Each client lists `dnslab-dns`
- [ ] Route to `192.168.1.53` goes through the Ziti interface
- [ ] `nslookup doubleclick.net 192.168.1.53` returns `0.0.0.0`
- [ ] Pi-hole logs that query from `127.0.0.1`
