If you log out and log back in again you can source the *.env file located in ZITI_HOME.

```
source ~/.ziti/quickstart/$(hostname -s)/$(hostname -s).env
```

Example output:

```
$ source ~/.ziti/quickstart/$(hostname -s)/$(hostname -s).env
adding /home/ubuntu/.ziti/quickstart/ip-10-0-0-1/ziti-bin/ziti-v0.20.2 to the path
                                
$ echo $ZITI_HOME
/home/ubuntu/.ziti/quickstart/ip-10-0-0-1
```