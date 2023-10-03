---
title: Linux
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## The Ziti Tunneller

`ziti-edge-tunnel` is the tunneller CLI and daemon. The purpose of the tunneller is to configure host access. This means
all users and all processes on the host will share the same level of access. This is accomplished by configuring the OS
to have an OpenZiti DNS nameserver and IP routes for authorized OpenZiti Services.

## Install Linux Package

Reasons to use the package:

1. Install the tunneller as a systemd service.
1. Create permissions and policies for the tunneller to run as a non-root user.
1. Automatically enroll the identity and clean up the enrollment token in identity directory.
1. Automatically upgrade the tunneller when a new package is available.

Linux DEB packages are currently available for the x86_64 and arm64 platforms and RPM packages are available for x86_64.
ARM/v7 (32bit) binaries are available from GitHub. See [manual installation](#manual-installation).

### Installing the DEB

1. Select an OS to see the appropriate steps.

<Tabs
  defaultValue="Ubuntu"
  values={[
      { label: 'Ubuntu', value: 'Ubuntu', },
      { label: 'Debian GNU/Linux', value: 'Debian', },
  ]}
>

<TabItem value="Ubuntu">

#### Ubuntu

Packages are available for all Ubuntu releases since 18.04 (Bionic).
<br/>
Architectures available:

* x86_64
* arm64

:::note
Please read this script to ensure it is safe before running it.
:::

```text
curl -sSLf https://get.openziti.io/tun/scripts/install-ubuntu.bash | bash
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

Refer to the table to find the Ubuntu release name that is the contemporary of the Debian release. Substitute the Ubuntu
release name for `focal` in the `/etc/apt/sources.list.d/openziti.list` file.

```text
(
UBUNTU_RELEASE=focal

set -euo pipefail

curl -sSLf https://get.openziti.io/tun/package-repos.gpg \
  | sudo gpg --dearmor --output /usr/share/keyrings/openziti.gpg

echo 'deb [signed-by=/usr/share/keyrings/openziti.gpg] https://packages.openziti.org/zitipax-openziti-deb-stable $UBUNTU_RELEASE main' \
  | sudo tee /etc/apt/sources.list.d/openziti.list >/dev/null

sudo apt update
sudo apt install ziti-edge-tunnel
)
```

</TabItem>
</Tabs>

2. Enable and start the service

    ```text
    sudo systemctl enable --now ziti-edge-tunnel.service
    ```

2. [Add an Identity](#adding-identities)

### Installing the RPM

1. Create a repo file like `/etc/yum.repos.d/openziti.repo` matching the OS.

<Tabs
  defaultValue="RedHat"
  values={[
      { label: 'Red Hat', value: 'RedHat', },
      { label: 'Fedora', value: 'Fedora', },
      { label: 'Amazon Linux', value: 'Amazon', },
  ]}
>
<TabItem value="RedHat">

#### Red Hat

Architectures available:

* x86_64

Use this repo with var `$releasever` on CentOS 7, Rocky 8-9, and RHEL 7-9.

```text
[OpenZiti]
name=OpenZiti
baseurl=https://packages.openziti.org/zitipax-openziti-rpm-stable/redhat$releasever/$basearch
enabled=1
gpgcheck=0
gpgkey=https://packages.openziti.org/zitipax-openziti-rpm-stable/redhat$releasever/$basearch/repodata/repomd.xml.key
repo_gpgcheck=1
```

</TabItem>

<TabItem value="Fedora">

#### Fedora

Architectures available:

* x86_64

```text
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

```text
[OpenZiti]
name=OpenZiti
baseurl=https://packages.openziti.org/zitipax-openziti-rpm-stable/redhat8/$basearch
enabled=1
gpgcheck=0
gpgkey=https://packages.openziti.org/zitipax-openziti-rpm-stable/redhat8/$basearch/repodata/repomd.xml.key
repo_gpgcheck=1
```

</TabItem>
</Tabs>

2. Run `sudo yum update` to refresh the repo data cache.
2. Run `sudo yum install ziti-edge-tunnel` to install the RPM.
2. Enable and start the service

    ```text
    sudo systemctl enable --now ziti-edge-tunnel.service
    ```

2. [Add an Identity](#adding-identities)

## Manual Installation

[The latest binary release](https://github.com/openziti/ziti-tunnel-sdk-c/releases/latest/) of `ziti-edge-tunnel` is
distributed as an executable for amd64, arm, and arm64 architectures. To upgrade the tunneller perform the installation
procedure again.

Install the `wget` and `unzip` commands to use this example.

```text
(set -euo pipefail
cd $(mktemp -d)
wget -q \
  "https://github.com/openziti/ziti-tunnel-sdk-c/releases/latest/download/ziti-edge-tunnel-Linux_$(uname -m).zip"
unzip ./ziti-edge-tunnel-Linux_$(uname -m).zip
sudo install -o root -g root ./ziti-edge-tunnel /usr/local/bin/
grep -q '^ziti:' /etc/group || sudo groupadd --system ziti
sudo mkdir -pv /opt/openziti/etc/identities
ziti-edge-tunnel version
)
```

### Run the Manually Installed Binary

You must run the manually-installed tunneller as root because only the Linux package configures systemd ambient
capabilities that enable managing DNS and IP routes with reduced privileges.

```text
sudo ziti-edge-tunnel run --identity-dir /opt/openziti/etc/identities
```

[Learn more about tunneller options and modes](./linux-tunnel-options.md).

## Adding Identities

The tunneller can run with zero or more identities loaded, and needs at least one to make OpenZiti services available on
the host. Adding an identity means providing a JWT enrollment token which is used by the tunneller to obtain a client
certificate from the OpenZiti controller. [Learn more about OpenZiti Identities](/learn/core-concepts/identities/overview.mdx).

### Add a Single Identity

Root and members of group `ziti` may add an identity without restarting. 

```text
sudo ziti-edge-tunnel add --jwt "$(< ./in-file.jwt)" --identity myIdentityName
```

[Learn more about enrolling](/learn/core-concepts/identities/20-enrolling.md).

### Load Identities Directory

The tunneller will load all enrolled identities in the `--identity-dir` directory at startup. The default location for
identities is is `/opt/openziti/etc/identities`. Add enrolled identity files to this directory by copying the JSON file
into the directory and setting permissions for group `ziti`.

:::note
Linux package users may place enrollment tokens named `*.jwt` in this directory for automatic enrollment at next
startup.
:::

Ensure the identities directory is writable by group `ziti` and not readable by others to protect the confidentiality of
the identities.

```text
sudo chown -cR :ziti        /opt/openziti/etc/identities
sudo chmod -cR ug=rwX,o-rwx /opt/openziti/etc/identities
```

The tunneller process needs to be restarted if the contents of `/opt/openziti/etc/identities` change.

```text
# package users can restart with systemd
sudo systemctl restart ziti-edge-tunnel.service
```

## Run with Docker

Reference [the article about running the Linux tunneller in a container](./container/readme.mdx) for guidance and
examples.

## Troubleshooting

Refer to [the troubleshooting guide](./linux-tunnel-troubleshooting.md).
