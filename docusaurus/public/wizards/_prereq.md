---
description: whatever here
junk: prereq
---
## Prerequisites

:::note
Make sure you have `tar`, `hostname`, `jq` and `curl` installed before running the `expressInstall` one-liner.
:::

There is not much preparation necessary to getting up-and-running locally. At this time, this guide expects that
you'll be running commands within a `bash` shell. If you're running Windows, you will need to make sure you have
Windows Subsystem for Linux installed for now. We plan to provide a Powershell script in the future, but for now the
script requires you to be able to use `bash`. Make sure your local ports 1280, 6262, 10000 are free before running the
controller. These ports are the default ports used by the controller. Also ensure ports 10080 and 3022 are open as these
are the default ports the edge router will use.
