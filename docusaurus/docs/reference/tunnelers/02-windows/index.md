# Windows

The Ziti Desk for Windows (ZDEW) is the tunneler targeting the Windows operating system. The project is fully
open source and can be found on GitHub at https://github.com/openziti/desktop-edge-win

## Installation

The ZDEW has an installer available for download from GitHub.
[Download the latest release here](https://github.com/openziti/desktop-edge-win/releases/latest).

The executable is signed by a third-party using GitHub actions. [NetFoundry](https://netfoundry.io) is
the primary supporter of the project and purchases an extended validation (EV) certificate for the 
executable. This EV certificate, should prevent the [Microsoft Defender](https://learn.microsoft.com/en-us/defender-endpoint/) 
software from identifying the executable as malicious.

Download the executable from GitHub and verify the SHA256 hash of the file to ensure it has not been
tampered with from when it was released. Once installed, enroll your first identity.

## Adding Identities

* [One-Time Token](./add-ids/ott) - Add an identity with a single use token. The most common option
* [Third-Party CA](./add-ids/third-party-ca) - Add an identity using a third-party CA
* [External JWT Provider - JWT](./ext-jwt) - Add an identity using the configured provider and network JWT
* [External JWT Provider - URL](./ext-jwt-url) - Add an identity using the configured provider and URL

## Architecture
The ZDEW is composed of three main components: the data service, the monitor service, the UI. Communication among
these processes is handled through IPC and requires the process to have been started by an interactive login. The IPC
channels are not meant for direct use and using them outside of the overall tunneler is discouraged.

### The Data Service
The data service is the main workhorse of the ZDEW. It is built around the `ziti-tunneler-sdk-c` (and subsequently the
`ziti-sdk-c`). It is responsible for creating the "TUN" (virtual network interface) as well as for configuring any
routes necessary for IP-based intercepts.

#### DNS
The data service also has a DNS server listening at $TUN_IP + 1. For example, if the data service is configured to use
the default IP 100.64.0.1, there will be a DNS server listening on 100.64.0.2.

### The Monitor Service
This component is delivered as a Windows service and is set to automatic, delayed startup. It has two main functions:
automatic upgrades and diagnostic information.

#### Automatic Upgrades
This service will monitor the GitHub releases for new updates. It does this every ten minutes by default but could be
configured if the user wants to change this to be longer. Shorter is not recommended.

#### Diagnostic Information
When the ZDEW runs into problems. The UI has a 'feedback' option in the main menu to generate diagnostic information,
collect logs etc. This service performs that work resulting in a zip file saved into the `logs` folder.

### The UI
The UI is currently a .NET UWP application. It is not necessary for this program to run for the ZDEW to function. It
is exclusively for users to interact with the data and monitor services.

## Logging
Logs for ZDEW are saved relative to the location of the installation. Normally, this path will end up being:
`C:\Program Files (x86)\NetFoundry Inc\Ziti Desktop Edge`. In that directory should be a logs directory.

The logs directory has three subdirectories for each of the main components:

* service - the logs for the data service
* ZitiMonitorService - the logs for the monitor service
* UI - the logs from the UI

## Configuration and Identity Files

The ZDEW runs as a service on the machine it is installed on. It will save enrolled identities in a file in
the SYSTEM profile's `APPDIR`. Generally, this will be located at `%WINDIR%\System32\config\systemprofile\AppData\Roaming\NetFoundry`.

This location will also contain a file that captures the state of the ZitiUpdateService in a file named `ZitiUpdateService\settings.json`
in that location.

## Multiple Users

The ZDEW runs as a service on the machine it is installed on. This means it is a **SYSTEM WIDE** installation. The identities
added to the service will be available to any users that can authenticate to the machine. Tunnelers intercept all underlay
traffic from local machine, and translate that traffic to an OpenZiti service if they are configured to do so. To do this,
the ZDEW project uses the excellent [WinTun](https://www.wintun.net) project. This TUN is a network adapter. There is no
way to configure the ZDEW for "per-user" use at this time.
