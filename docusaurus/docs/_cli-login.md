<br/>

The `ziti` CLI will help you get an API Session from the controller's management API. You will be prompted to trust any new server certificates. Your login token cache and trust store are managed by the CLI in your home directory.

```text
# implies https://localhost:1280
ziti edge login -u admin -p admin
```

```text
# implies https://
ziti edge login ctrl.ziti.example.com:8441 -u admin -p admin
```
