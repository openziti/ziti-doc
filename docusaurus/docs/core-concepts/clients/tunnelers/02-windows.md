# Windows

## Installation

The ZDEW has an installer which is available for download from GitHub.
[Download the latest release here](https://github.com/openziti/desktop-edge-win/releases/latest).

This brings the user to the NetFoundry Ziti GitHub repository.  There are a list of releases, select the top release and the .exe package from the list of files.

![image](/img/clients/windows-install1.jpg)

**NOTE: Installer requires elevated permissions**. Right click on  Ziti.Desktop Edge Client installer file and select **Run as Administrator**.

This will launch the installation on the user Windows Machine.  Click **Next>**

![image](/img/clients/windows-install2.jpg)

Keep the default file location unless you have a reason to move to another location.  Select **Next>**

![image](/img/clients/windows-install3.png)

Click **Install** to execute the installation of the Windows Desktop Edge.  Select to **install WinTun driver** if prompted. Select **YES** when prompted in the next screen to allow the application to make changes.

![image](/img/clients/windows-install4.png)

Click **Run Ziti Desktop Edge** when installation completes.

![image](/img/clients/windows-install5.png)

## Enrolling 

Following this [guide](/docs/core-concepts/identities/creating) to create an identity and transfer the jwt file to your PC.

Go back to the **Windows Desktop Edge** widget and click **ADD IDENTITY**.

![image](/img/clients/windows-install6.jpg)

You will be brought to your file manager and should navigate to the directory where you saved the .jwt file in the previous steps. Click **Open**

![image](/img/clients/windows-install7.jpg)

Once the identity has been enrolled and registered you will see any services you have been granted. Status = Active and the IP/Hostname/Port of rendered services.

![image](/img/clients/windows-install8.jpg)

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