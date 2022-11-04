Load the current user/password into an environment variables

ctrl_user=$(jq -r .username ~/.config/ziti/ziti-controller/credentials.json)
ctrl_passwd=$(jq -r .password ~/.config/ziti/ziti-controller/credentials.json)
cert=~/.config/ziti/pki/intermediate/certs/intermediate.cert

```bash
ziti edge login ${ZITI_CTRL_ADVERTISED_ADDRESS}:${ZITI_CONTROLLER_MGMT_PORT} \
                -u $ctrl_user -p $ctrl_passwd -y  -c $cert
```