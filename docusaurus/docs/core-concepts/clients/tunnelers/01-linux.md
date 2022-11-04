---
title: Linux
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Linux

## The Ziti Tunneller

`ziti-edge-tunnel` is the general purpose tunneller CLI and can also run as a systemd daemon. 

The purpose of the tunneller is to configure host access. This means all users and all processes on the host will share the same level of access. This is accomplished by configuring the OS to have an on-board OpenZiti DNS nameserver and IP routes for authorized OpenZiti Services.

## Install Linux Package

:::note
It is not necessary to manually enroll the identity when using the RPM or DEB package. Just install the token in the identities directory and it will be enrolled when you start the daemon.
:::

#### Installing the DEB

1. Run the script below to import the signing key, add a package source to the list, update sources, and install ziti-edge-tunnel.

<Tabs
  defaultValue="Jammy"
  values={[
      { label: 'UB 22.04', value: 'Jammy', },
      { label: 'UB 20.04', value: 'Focal', },
      { label: 'UB 18.04', value: 'Bionic', },
      { label: 'Debian GNU/Linux', value: 'Debian', },
  ]}
>
<TabItem value="Jammy">

```Jammy
curl -sSLf https://raw.githubusercontent.com/openziti/ziti-tunnel-sdk-c/main/package-repos.gpg \
| gpg --dearmor \
| sudo tee /usr/share/keyrings/openziti.gpg >/dev/null
echo 'deb [signed-by=/usr/share/keyrings/openziti.gpg] https://packages.openziti.org/zitipax-openziti-deb-stable jammy main' \
| sudo tee /etc/apt/sources.list.d/openziti.list >/dev/null
sudo apt update
sudo apt install ziti-edge-tunnel
```

</TabItem>
<TabItem value="Focal">

```Focal
curl -sSLf https://raw.githubusercontent.com/openziti/ziti-tunnel-sdk-c/main/package-repos.gpg \
| gpg --dearmor \
| sudo tee /usr/share/keyrings/openziti.gpg >/dev/null
echo 'deb [signed-by=/usr/share/keyrings/openziti.gpg] https://packages.openziti.org/zitipax-openziti-deb-stable focal main' \
| sudo tee /etc/apt/sources.list.d/openziti.list >/dev/null
sudo apt update
sudo apt install ziti-edge-tunnel
```

</TabItem>
<TabItem value="Bionic">

```Bionic
curl -sSLf https://raw.githubusercontent.com/openziti/ziti-tunnel-sdk-c/main/package-repos.gpg \
| gpg --dearmor \
| sudo tee /usr/share/keyrings/openziti.gpg >/dev/null
echo 'deb [signed-by=/usr/share/keyrings/openziti.gpg] https://packages.openziti.org/zitipax-openziti-deb-stable bionic main' \
| sudo tee /etc/apt/sources.list.d/openziti.list >/dev/null
sudo apt update
sudo apt install ziti-edge-tunnel
```

</TabItem>
<TabItem value="Debian">

```Debian
curl -sSLf https://raw.githubusercontent.com/openziti/ziti-tunnel-sdk-c/main/package-repos.gpg \
| gpg --dearmor \
| sudo tee /usr/share/keyrings/openziti.gpg >/dev/null
echo 'deb [signed-by=/usr/share/keyrings/openziti.gpg] https://packages.openziti.org/zitipax-openziti-deb-stable Bionic main' \
| sudo tee /etc/apt/sources.list.d/openziti.list >/dev/null
sudo apt update
sudo apt install ziti-edge-tunnel
```

</TabItem>
</Tabs>

1. Install an enroll token JWT file or identity config JSON file in `/opt/openziti/etc/identities`.
1. Run `sudo systemctl restart ziti-edge-tunnel.service`. The service needs to be restarted if the contents of the identities directory change.

#### Installing the RPM

1. Create a repo file like `/etc/yum.repos.d/openziti.repo` matching the appropriate example below for your OS.

<Tabs
  defaultValue="Redhat"
  values={[
      { label: 'Redhat', value: 'Redhat', },
      { label: 'Redhat 9', value: 'Redhat9', },
      { label: 'Fedora', value: 'Fedora', },
      { label: 'Amazon Linux', value: 'Amazon', },
  ]}
>
<TabItem value="Redhat">

```Redhat
** For Redhat 9 please refer to Redhat 9 section**

[OpenZiti]
name=OpenZiti
baseurl=https://packages.openziti.org/zitipax-openziti-rpm-stable/redhat$releasever/$basearch
enabled=1
gpgcheck=0
gpgkey=https://packages.openziti.org/zitipax-openziti-rpm-stable/redhat$releasever/$basearch/repodata/repomd.xml.key
repo_gpgcheck=1
```

</TabItem>
<TabItem value="Redhat9">

```Redhat9

[OpenZiti]
name=OpenZiti
baseurl=https://packages.openziti.org/zitipax-openziti-rpm-stable/redhat8/$basearch
enabled=1
gpgcheck=0
gpgkey=https://packages.openziti.org/zitipax-openziti-rpm-stable/redhat8/$basearch/repodata/repomd.xml.key
repo_gpgcheck=1
```

</TabItem>
<TabItem value="Fedora">

```Fedora
** Tested on Fedora 31 - 36 **

[OpenZiti]
name=OpenZiti
baseurl=https://packages.openziti.org/zitipax-openziti-rpm-stable/redhat8/$basearch
enabled=1
gpgcheck=0
gpgkey=https://packages.openziti.org/zitipax-openziti-rpm-stable/redhat8/$basearch/repodata/repomd.xml.key
repo_gpgcheck=1
```

</TabItem>
<TabItem value="Amazon"> 

```Amazon
[OpenZiti]
name=OpenZiti
baseurl=https://packages.openziti.org/zitipax-openziti-rpm-stable/redhat7/$basearch
enabled=1
gpgcheck=0
gpgkey=https://packages.openziti.org/zitipax-openziti-rpm-stable/redhat7/$basearch/repodata/repomd.xml.key
repo_gpgcheck=1
```

</TabItem>
</Tabs>

1. Run `sudo yum update` to refresh your repodata cache. Optionally, you may wish to also install all available updates.
1. Run `sudo yum install ziti-edge-tunnel` to install the RPM.
1. Install an enroll token JWT file or identity config JSON file in `/opt/openziti/etc/identities`.
1. Run `sudo systemctl start ziti-edge-tunnel.service`. The service needs to be restarted if the contents of the identities directory change.


## Manual Installation

[The latest binary release](https://github.com/openziti/ziti-tunnel-sdk-c/releases/latest/) of `ziti-edge-tunnel` is distributed as an executable for amd64, arm, arm64 architectures. The upgrade procedure is identical to the installation procedure.

```bash
** install unzip package first **
# shell script illustrating the steps to install or upgrade ziti-edge-tunnel
wget -q "https://github.com/openziti/ziti-tunnel-sdk-c/releases/latest/download/ziti-edge-tunnel-Linux_$(uname -p).zip" \
  && unzip ./ziti-edge-tunnel-Linux_$(uname -p).zip \
  && rm ./ziti-edge-tunnel-Linux_$(uname -p).zip \
  && chmod -c +x ./ziti-edge-tunnel \
  && ./ziti-edge-tunnel version
```

### Enroll Before You Run

You will need the token file or its contents to enroll. Enrollment is the act of exchanging the token for an identity that is to be permanently installed in the filesystem.

[Here's a link to the article about enrolling](/docs/core-concepts/identities/enrolling)


### Example execution command 

```bash
ziti-edge-tunnel run --verbose=2 --dns-ip-range=100.64.0.1/10 --identity-dir=/opt/openziti/etc/identities
```

To learn more about tunneler options, please refer to this [doc](linux-tunnel-options)

## Run with Docker

Please reference the [Docker README](https://github.com/openziti/ziti-tunnel-sdk-c/tree/main/docker#readme) for guidance and examples!


## Troubleshooting

Please refer to the [trobleshooting guild](linux-tunnel-troubleshooting)