**Using Docker Locally**

A quick note. If you are not well-versed with Docker you might forget that exposing ports in Docker is one thing, but you'll also need to have a hosts entry for the containers you want to access from outside the Docker network. This quickstart will expect that you understand this and for every router you add you will want to make sure you add a host entry. In the docker compose example you will want/need hosts entries for at least:

* ziti-edge-controller,
* ziti-edge-router

And if you want to expose any other routers - of course you'll need/want to have entries for those as well.

**Testing**

Now that we have used docker compose to deploy a relatively complicated network, we can start testing it out to make sure everything is in place and looks correct. Let's try it out.

To test, we will docker exec into the running controller. Notice we'll be specifying the container and it's expected that the project was named "docker". If you don't start your compose using --project-name docker, use the proper exec command:

```
docker exec -it docker-ziti-controller-1 bash
```

Once exec'ed into the controller, the ziti CLI will be added to your PATH for you. There is also the zitiLogin alias to make it easy for you to authenticate to the Ziti controller. Run zitiLogin now and ensure you're authenticated.

```
ziti@724087d30014:/persistent$ zitiLogin
Token: 55ec6721-f33b-4101-970a-412331bd7578
Saving identity 'default' to /persistent/ziti-cli.json
```

**Test - Edge Routers Online**

Once authenticated, let's see if all our routers are online by running ziti edge list edge-routers:

```
ziti@724087d30014:/persistent$ ziti edge list edge-routers
╭────────────┬───────────────────────┬────────┬───────────────┬──────┬───────────────────────╮
│ ID         │ NAME                  │ ONLINE │ ALLOW TRANSIT │ COST │ ATTRIBUTES            │
├────────────┼───────────────────────┼────────┼───────────────┼──────┼───────────────────────┤
│ C6LbVE7fIc │ ziti-edge-router      │ true   │ true          │    0 │ public                │
│ GY1pcE78Ic │ ziti-private-blue     │ true   │ true          │    0 │ ziti-private-blue     │
│ H0UbcE78Tc │ ziti-fabric-router-br │ true   │ true          │    0 │ ziti-fabric-router-br │
│ KHTAct78Tc │ ziti-private-red      │ true   │ true          │    0 │ ziti-private-red      │
│ Yblbct7fTc │ ziti-edge-router-wss  │ true   │ true          │    0 │ public                │
╰────────────┴───────────────────────┴────────┴───────────────┴──────┴───────────────────────╯
results: 1-5 of 5
```

We can see all the routers are online - excellent.

**Test - Edge Router Identities**

In this compose file, we have used a script that adds an identity for each of our edge routers as well. We can see those by running ziti edge list identities:

```
ziti@724087d30014:/persistent$ ziti edge list identities
╭────────────┬───────────────────────┬────────┬────────────╮
│ ID         │ NAME                  │ TYPE   │ ATTRIBUTES │
├────────────┼───────────────────────┼────────┼────────────┤
│ C6LbVE7fIc │ ziti-edge-router      │ Router │            │
│ GY1pcE78Ic │ ziti-private-blue     │ Router │            │
│ H0UbcE78Tc │ ziti-fabric-router-br │ Router │            │
│ KHTAct78Tc │ ziti-private-red      │ Router │            │
│ Yblbct7fTc │ ziti-edge-router-wss  │ Router │            │
│ kkVrSLy.D  │ Default Admin         │ User   │            │
╰────────────┴───────────────────────┴────────┴────────────╯
results: 1-6 of 6
```

Notice there is an identity for every router.

**Test - Network Connectivity Success**

Recall that the controller should be able to contact both the red and blue edge routers using the underlay network. Let's use ping and verify:

```
ziti@724087d30014:/persistent$ ping ziti-private-red -c 1
PING ziti-private-red (172.29.0.2): 56 data bytes
64 bytes from 172.29.0.2: icmp_seq=0 ttl=64 time=0.387 ms
--- ziti-private-red ping statistics ---
1 packets transmitted, 1 packets received, 0% packet loss
round-trip min/avg/max/stddev = 0.387/0.387/0.387/0.000 ms
```
```
ziti@724087d30014:/persistent$ ping ziti-private-blue -c 1
PING ziti-private-blue (172.28.0.6): 56 data bytes
64 bytes from 172.28.0.6: icmp_seq=0 ttl=64 time=0.633 ms
--- ziti-private-blue ping statistics ---
1 packets transmitted, 1 packets received, 0% packet loss
round-trip min/avg/max/stddev = 0.633/0.633/0.633/0.000 ms
```

Example output:

```
$ stopRouter 
INFO: Router stopped.

$ stopController 
INFO: Controller stopped.
```
                            
**Test - Underlay Network Connectivity Failure**

Now let's exit the Ziti controller and instead attach to the private blue router by running this command: docker exec -it docker-ziti-private-blue-1 bash. Once attached to the blue router we'll verify that we cannot connect to the private red router:

```
ziti@e610d6b44166:/persistent$ ping ziti-private-red -c 1
ping: unknown host
```

Unknown host - the private blue router cannot connect to the red router.

**Test - Underlay Network Web Test Blue**

While we're attached to the blue router - let's make sure we can connect to that web-test-blue server.

```
ziti@e610d6b44166:/persistent$ curl http://web-test-blue:8000
Hello World


                                       ##         .
                                 ## ## ##        ==
                              ## ## ## ## ##    ===
                           /""""""""""""""""\___/ ===
                      ~~~ {~~ ~~~~ ~~~ ~~~~ ~~ ~ /  ===- ~~~
                           \______ o          _,/
                            \      \       _,'
                             `'--.._\..--''
```

Don't forget - you can also access this from the exported port 80 on your local machine too!

```
curl http://localhost:80
Hello World


                                       ##         .
                                 ## ## ##        ==
                              ## ## ## ## ##    ===
                           /""""""""""""""""\___/ ===
                      ~~~ {~~ ~~~~ ~~~ ~~~~ ~~ ~ /  ===- ~~~
                           \______ o          _,/
                            \      \       _,'
                             `'--.._\..--''
```