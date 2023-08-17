You can try out creating and running a simple echo service through ziti by running the first-service tutorial.

```
~ % "${ZITI_BIN_DIR-}/ziti" edge tutorial first-service
```

**... Next Steps**

* Now that you have your network in place, you probably want to try it out. Head to the services quickstart and start learning how to use OpenZiti.
* Install the Ziti Console (web UI)
* Add a Second Public Router: In order for multiple routers to form transit links, they need a firewall exception to expose the "link listener" port. The default port is 10080/tcp.
* Get Help
  * Change Admin Password
  * Reset the Quickstart