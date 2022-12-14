
The `ziti` CLI will help you get a session from the controller's management API. You will be prompted to trust any new server certificates. Your session cache and trust store are managed by the CLI in your home directory.

```bash
# implies https://localhost:1280
ziti edge login -u admin -p admin
```

```bash
# implies https://
ziti edge login ziti.example.com:8441 -u admin -p admin
```
