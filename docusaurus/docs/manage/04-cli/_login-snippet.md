Load the current user/password into an environment variables

```bash
CTRL_USER="#####"
CTRL_PASSWD="#####"
CERT=$PATH/intermediate.cert

ziti edge login ${ZITI_CTRL_IP_OR_FQDN}:${ZITI_CONTROLLER_MGMT_PORT} \
                -u $CTRL_USER -p $CTRL_PASSWD -y  -c $CERT
```