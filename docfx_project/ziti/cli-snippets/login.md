    #load the current user/password into an environment variables
    ctrl_user=$(jq -r .username ~/.config/ziti/ziti-controller/credentials.json)
    ctrl_passwd=$(jq -r .password ~/.config/ziti/ziti-controller/credentials.json)

    ziticontroller=127.0.0.1
    cert=~/.config/ziti/pki/intermediate/certs/intermediate.cert
    ziti edge controller login https://${ziticontroller}:1280 -u $ctrl_user -p $ctrl_passwd -c $cert