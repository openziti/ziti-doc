---
title: Linux
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## The Ziti Tunneller

`ziti-edge-tunnel` is the general purpose tunneller CLI and can also run as a systemd daemon.

The purpose of the tunneller is to configure host access. This means all users and all processes on the host will share the same level of access. This is accomplished by configuring the OS to have an on-board OpenZiti DNS nameserver and IP routes for authorized OpenZiti Services.

## Install Linux Package

Reasons to use the package:

1. Install the tunneller as a systemd service.
1. Create permissions and policies for the tunneller to run as a non-root user.
1. Automatically enroll the identity and clean up the enrollment token in identity directory.
1. Automatically upgrade the tunneller when a new package is available.

Linux DEB packages are currently available for the x86_64 and arm64 platforms and RPM packages are available for x86_64. Additionally, there are executable downloads available for arm/v7 (32bit) for [manual installation](#manual-installation).

:::note
It is not necessary to manually enroll the identity when using the RPM or DEB package. Just install the token in the identities directory with file owner "ziti" and it will be enrolled and cleaned up when you start the service.
:::

### Installing the DEB

1. Run the script for your OS to install `ziti-edge-tunnel`.

<Tabs
  defaultValue="Focal"
  values={[
      { label: 'Ubuntu Jammy 22.04', value: 'Jammy', },
      { label: 'Ubuntu Focal 20.04', value: 'Focal', },
      { label: 'Ubuntu Bionic 18.04', value: 'Bionic', },
      { label: 'Debian GNU/Linux', value: 'Debian', },
  ]}
>
<TabItem value="Jammy">

#### Ubuntu Jammy 22.04

Architectures available:

* x86_64
* arm64

```bash
(
set -euo pipefail

curl -sSLf https://get.openziti.io/tun/package-repos.gpg \
  | sudo gpg --dearmor --output /usr/share/keyrings/openziti.gpg

echo 'deb [signed-by=/usr/share/keyrings/openziti.gpg] https://packages.openziti.org/zitipax-openziti-deb-stable jammy main' \
  | sudo tee /etc/apt/sources.list.d/openziti.list >/dev/null

sudo apt update
sudo apt install ziti-edge-tunnel
)
```

</TabItem>
<TabItem value="Focal">

#### Ubuntu Focal 20.04

Architectures available:

* x86_64
* arm64

```bash
(
set -euo pipefail

curl -sSLf https://get.openziti.io/tun/package-repos.gpg \
  | sudo gpg --dearmor --output /usr/share/keyrings/openziti.gpg

echo 'deb [signed-by=/usr/share/keyrings/openziti.gpg] https://packages.openziti.org/zitipax-openziti-deb-stable focal main' \
  | sudo tee /etc/apt/sources.list.d/openziti.list >/dev/null

sudo apt update
sudo apt install ziti-edge-tunnel
)
```

</TabItem>
<TabItem value="Bionic">

#### Ubuntu Bionic 18.04

Architectures available:

* x86_64
* arm64

```bash
(
set -euo pipefail

curl -sSLf https://get.openziti.io/tun/package-repos.gpg \
  | sudo gpg --dearmor --output /usr/share/keyrings/openziti.gpg

echo 'deb [signed-by=/usr/share/keyrings/openziti.gpg] https://packages.openziti.org/zitipax-openziti-deb-stable bionic main' \
  | sudo tee /etc/apt/sources.list.d/openziti.list >/dev/null

sudo apt update
sudo apt install ziti-edge-tunnel
)
```

</TabItem>
<TabItem value="Debian">

#### Debian GNU/Linux

| Debian      | Ubuntu       | Archs         |
|-------------|--------------|---------------|
| 12 Bookworm | Jammy 22.04  | x86_64, arm64 |
| 11 Bullseye | Focal 20.04  | x86_64, arm64 |
| 10 Buster   | Bionic 18.04 | x86_64        |
|  9 Stretch  | Xenial 16.04 | x86_64        |
|  8 Jessie   | Trusty 14.04 | x86_64        |

This example subscribes you to the Ubuntu `focal` repo which will work well in most cases. Alternatively, you may refer to the table to find the Ubuntu release name that is the contemporary of your Debian release. Then, substitute the Ubuntu release name for `focal` in the `/etc/apt/sources.list.d/openziti.list` file.

```bash
(
set -euo pipefail

curl -sSLf https://get.openziti.io/tun/package-repos.gpg \
  | sudo gpg --dearmor --output /usr/share/keyrings/openziti.gpg

echo 'deb [signed-by=/usr/share/keyrings/openziti.gpg] https://packages.openziti.org/zitipax-openziti-deb-stable focal main' \
  | sudo tee /etc/apt/sources.list.d/openziti.list >/dev/null

sudo apt update
sudo apt install ziti-edge-tunnel
)
```

</TabItem>
</Tabs>

2. Place an enrollment token JWT file or identity config JSON file in `/opt/openziti/etc/identities`.

  ```bash
  sudo -u ziti tee /opt/openziti/etc/identities/ziti-id.jwt >/dev/null
  # past the contents of the enrollment token JWT file and press Ctrl+D
  ```

2. Enable and start the service

    ```bash
    sudo systemctl enable --now ziti-edge-tunnel.service
    ```

2. The process needs to be restarted if the contents of `/opt/openziti/etc/identities` change.

    ```bash
    sudo systemctl restart ziti-edge-tunnel.service
    ```

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

#### Red Hat

Architectures available:

* x86_64

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

#### Red Hat 9

Architectures available:

* x86_64

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

#### Fedora

Architectures available:

* x86_64

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

#### Amazon Linux

Architectures available:

* x86_64

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

2. Run `sudo yum update` to refresh your repo data cache. Optionally, you may wish to also install all available updates.
2. Run `sudo yum install ziti-edge-tunnel` to install the RPM.
2. Place an enrollment token JWT file or identity config JSON file in `/opt/openziti/etc/identities`.

  ```bash
  sudo -u ziti tee /opt/openziti/etc/identities/ziti-id.jwt >/dev/null
  # past the contents of the enrollment token JWT file and press Ctrl+D
  ```

2. Enable and start the service

    ```bash
    sudo systemctl enable --now ziti-edge-tunnel.service
    ```

2. The process needs to be restarted if the contents of `/opt/openziti/etc/identities` change.

    ```bash
    sudo systemctl restart ziti-edge-tunnel.service
    ```

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

[Learn more about enrolling](/docs/learn/core-concepts/identities/enrolling).

### Run the Manually Installed Binary

```bash
ziti-edge-tunnel run \
  --identity-dir /opt/openziti/etc/identities
```

[Learn more about tunneler options and modes](./linux-tunnel-options).

## Run with Docker

Please reference [the article about running the Linux tunneler in a container](./container/readme.mdx) for guidance and examples!

## Troubleshooting

Please refer to [the troubleshooting guide](./linux-tunnel-troubleshooting)