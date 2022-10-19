# Windows

## Installation

The ZDEW has an installer which is available for download from GitHub.
[Download the latest release here](https://github.com/openziti/desktop-edge-win/releases/latest).
The installer will require administrator privileges to install successfully.

## Architecture
The ZDEW is composed of three main components: the data service, the monitor service, the UI. Communication among
these processes is handled through IPC and requires the process to have been started by an interactive login.

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
Logs for ZDEW are saved relative to the location of the installation. Normally this path will end up being:
`C:\Program Files (x86)\NetFoundry, Inc\Ziti Desktop Edge`. In that directory should be a logs directory.

The logs directory has three subdirectories for each of the main components:

* service - the logs for the data service
* ZitiMonitorService - the logs for the monitor service
* UI - the logs from the UI

## Source
The source for ZDEW is found on GitHub at https://github.com/openziti/desktop-edge-win