---
title: Change Password
---

Follow these instructions to change your quickstart admin's password. A random password was generated for you when you ran `expressInstall` and saved in your *.env file as `ZITI_PWD`. After changing the password, also change the value of `ZITI_PWD` in `~/.ziti/quickstart/$(hostname -s)/$(hostname -s).env` to match. This variable is used by the `zitiLogin` function.

## Use the `ziti` CLI {#ziti-cli}

```bash
$ zitiLogin
Token: d6152c84-3166-4ae4-8ca3-1c38c973d450
Saving identity 'default' to /home/ubuntu/.ziti/quickstart/ip-172-31-28-116/ziti-cli.json

$ ziti edge update authenticator updb -s
Enter your current password: 
Enter your new password: 
```

## Use the Ziti Console {#ziti-console}

If you installed the Ziti Console (ZAC) in your quickstart network then you can [login with your current password](../../../quickstarts//zac/index.md#login-and-use-zac) and change it.

Click on the person icon on the lower left and then select "Edit Profile" as shown to change your password.

![change password screenshot](../../../quickstarts/zac/zac_change_pwd.png)
