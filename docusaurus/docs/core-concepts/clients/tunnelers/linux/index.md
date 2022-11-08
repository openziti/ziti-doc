---
title: Linux
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## The Ziti Tunneller

`ziti-edge-tunnel` is the general purpose tunneller CLI and can also run as a systemd daemon.

The purpose of the tunneller is to configure host access. This means all users and all processes on the host will share the same level of access. This is accomplished by configuring the OS to have an on-board OpenZiti DNS nameserver and IP routes for authorized OpenZiti Services.

## Install Linux Package

Linux packages are currently available for the amd64 (x86_64) platform. There are [binaries available for ARM](#manual-installation), and packages are [coming soon](https://github.com/openziti/ziti-tunnel-sdk-c/issues/449).

:::note
It is not necessary to manually enroll the identity when using the RPM or DEB package. Just install the token in the identities directory and it will be enrolled when you start the daemon.
:::

### Installing the DEB

1. Run the script below to import the signing key, add a package source to the list, update sources, and install ziti-edge-tunnel.

<Tabs
  defaultValue="Jammy"
  values={[
      { label: 'Ubuntu 22.04', value: 'Jammy', },
      { label: 'Ubuntu 20.04', value: 'Focal', },
      { label: 'Ubuntu 18.04', value: 'Bionic', },
      { label: 'Debian GNU/Linux', value: 'Debian', },
  ]}
>
<TabItem value="Jammy">

```bash
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

```bash
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

```bash
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

This example subscribes you to the `bionic` repo for the sake of broad compatibility. You could instead subscribe to another Ubuntu release as long as it is not younger than your Debian release.

| Debian   | Ubuntu |
|----------|--------|
| Bookworm | Jammy  |
| Bullseye | Focal  |
| Buster   | Bionic |

```bash
curl -sSLf https://raw.githubusercontent.com/openziti/ziti-tunnel-sdk-c/main/package-repos.gpg \
| gpg --dearmor \
| sudo tee /usr/share/keyrings/openziti.gpg >/dev/null
echo 'deb [signed-by=/usr/share/keyrings/openziti.gpg] https://packages.openziti.org/zitipax-openziti-deb-stable bionic main' \
| sudo tee /etc/apt/sources.list.d/openziti.list >/dev/null
sudo apt update
sudo apt install ziti-edge-tunnel
```

</TabItem>
</Tabs>

2. Install an enroll token JWT file or identity config JSON file in `/opt/openziti/etc/identities`.
2. Run `sudo systemctl restart ziti-edge-tunnel.service`. The service needs to be restarted if the contents of the identities directory change.

### Installing the RPM

1. Create a repo file like `/etc/yum.repos.d/openziti.repo` matching the appropriate example below for your OS.

<Tabs
  defaultValue="RedHat"
  values={[
      { label: 'Red Hat', value: 'RedHat', },
      { label: 'Red Hat 9', value: 'RedHat9', },
      { label: 'Fedora', value: 'Fedora', },
      { label: 'Amazon Linux', value: 'Amazon', },
  ]}
>
<TabItem value="RedHat">

Use this repo with var `$releasever` on CentOS 7, Rocky 8, RHEL 7-8.

```ini
[OpenZiti]
name=OpenZiti
baseurl=https://packages.openziti.org/zitipax-openziti-rpm-stable/redhat$releasever/$basearch
enabled=1
gpgcheck=0
gpgkey=https://packages.openziti.org/zitipax-openziti-rpm-stable/redhat$releasever/$basearch/repodata/repomd.xml.key
repo_gpgcheck=1
```

</TabItem>
<TabItem value="RedHat9">

Use the the Red Hat 8 repo until a dedicated Red Hat 9 repo becomes available ([link to issue](https://github.com/openziti/ziti-tunnel-sdk-c/issues/517)).

```ini
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

The Red Hat 8 RPM was tested on Fedora 31-36.

```ini
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

The Red Hat 7 RPM was tested on Amazon Linux.

```ini
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

2. Run `sudo yum update` to refresh your repodata cache. Optionally, you may wish to also install all available updates.
2. Run `sudo yum install ziti-edge-tunnel` to install the RPM.
2. Install an enroll token JWT file or identity config JSON file in `/opt/openziti/etc/identities`.
2. Run `sudo systemctl start ziti-edge-tunnel.service`. The service needs to be restarted if the contents of the identities directory change.

## Manual Installation

[The latest binary release](https://github.com/openziti/ziti-tunnel-sdk-c/releases/latest/) of `ziti-edge-tunnel` is distributed as an executable for amd64, arm, arm64 architectures. The upgrade procedure is identical to the installation procedure.

You'll need to install the `wget` and `unzip` commands to use this example.

```bash
wget -q "https://github.com/openziti/ziti-tunnel-sdk-c/releases/latest/download/ziti-edge-tunnel-Linux_$(uname -p).zip" \
  && unzip ./ziti-edge-tunnel-Linux_$(uname -p).zip \
  && rm ./ziti-edge-tunnel-Linux_$(uname -p).zip \
  && chmod -c +x ./ziti-edge-tunnel \
  && ./ziti-edge-tunnel version
```

### Enroll Before You Run

You will need the token file or its contents to enroll. Enrollment is the act of exchanging the token for an identity that is to be permanently installed in the filesystem.

[Learn more about enrolling here](/docs/core-concepts/identities/enrolling)

### Run the Manually Installed Binary

```bash
ziti-edge-tunnel run \
  --identity-dir /opt/openziti/etc/identities
```

[Learn more about tunneler options and modes](./linux-tunnel-options).

## Run with Docker

Please reference [the Docker README](https://github.com/openziti/ziti-tunnel-sdk-c/tree/main/docker#readme) for guidance and examples!

## Troubleshooting

Please refer to [the troubleshooting guide](./linux-tunnel-troubleshooting)