# Step 7: Test from off your LAN

On your LAN, the client could reach the Pi-hole directly if the overlay failed, so a working answer there proves less
than it looks. Off the LAN, the overlay is the only way to `192.168.1.53`. If it works here, it works.

## 1. Get the client off your LAN

Pick one:

- **Phone hotspot**: connect the client to your phone's hotspot. The client is then on mobile data, with no path to
  your LAN except the overlay.
- **Isolated VLAN**: put the client on a VLAN (UniFi: a network with "isolation" on, or a firewall rule blocking it
  from your main LAN) that can reach the internet but not `192.168.1.0/24`.

Check your public IP before and after you switch. It must change from your home ISP's address to something else:

```
curl eth0.me
```

If it doesn't change, you're still going out through home. A phone hotspot does this when the phone itself is still
on your home Wi-Fi: it shares that connection instead of mobile data. Turn Wi-Fi off on the phone.

Windows can drop your step 6 DNS setting when you join a new network. Check it's still there:

```
# normal PowerShell
Get-DnsClientServerAddress -InterfaceAlias "Wi-Fi" -AddressFamily IPv4
```

If it doesn't list `192.168.1.53, 1.1.1.1`, rerun the step 6 change from an admin PowerShell.

## 2. Stop Ziti

Windows: open Ziti Desktop Edge and turn it **off** with the main toggle.

Linux:

```
sudo systemctl stop ziti-edge-tunnel
```

## 3. Prove the Pi-hole is unreachable

With Ziti off, ping the Pi-hole. **It must fail.**

```
# Windows, normal PowerShell
ping -n 2 192.168.1.53
```

```
# Linux
ping -c 2 192.168.1.53
```

If it answers, you're still on your LAN (or the VLAN isn't isolated). Fix that before going on, or the rest of this
step proves nothing.

## 4. Start Ziti again

Windows: turn Ziti Desktop Edge back **on**.

Linux:

```
sudo systemctl start ziti-edge-tunnel
```

Give it a few seconds to connect.

## 5. Run the checks

```
nslookup doubleclick.net 192.168.1.53
```

Expect `0.0.0.0`. Then the normal path, with no server named, which uses the DNS settings from step 6:

```
nslookup doubleclick.net
```

Expect `0.0.0.0` again. Check a name only your Pi-hole knows (one of its local DNS records) as well. Public DNS can't
answer that, so a correct answer can only have come from the Pi-hole.

On Linux with systemd-resolved, `resolvectl query` shows the answer and which link it came through:

```
sudo resolvectl flush-caches
resolvectl query doubleclick.net
```

Expect `0.0.0.0 -- link: enp0s3`. If the first query is slow (10+ seconds), run it again. The first one after a
server change is slow (see step 6). The second should come back in under a second.

On the Pi-hole, the queries show up from `127.0.0.1`:

```
sudo grep doubleclick.net /var/log/pihole/pihole.log | tail -3
```

## If it fails

- **`nslookup ... 192.168.1.53` times out**: the overlay path is broken. Rerun step 5's checks 1–3 from here. Then on
  the Pi-hole, check that `dnslab-pihole` still shows in `tunnel_status` and the terminator still exists (step 4).
- **Explicit server works, plain `nslookup` gives a real IP for a blocked domain**: the OS sent the query to the
  fallback resolver. That's the trade-off from step 6. Check which server `nslookup` names in its output. On Linux,
  resolved stays on the fallback after switching to it once. See step 6 for the Pi-hole-only setting.
- **Local record fails but blocked domains work**: the query went to the fallback resolver. Same cause as above.

## Done when

- [x] Client can't ping `192.168.1.53` with the tunneler stopped
- [x] With the tunneler running, `nslookup doubleclick.net 192.168.1.53` returns `0.0.0.0`
- [x] Plain `nslookup doubleclick.net` returns `0.0.0.0`
- [x] A Pi-hole local record resolves
- [x] Pi-hole logs the queries from `127.0.0.1`
