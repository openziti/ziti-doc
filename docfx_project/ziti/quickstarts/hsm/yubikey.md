# YubiKey by Yubico

[Yubico](https://www.yubico.com/) is a manufacturer of HSM deviceis. A popular line of HSM produced by Yubico is the
YubiKey. This quickstart guide will use specific device from Yubico - the [YubiKey 5
nfc](https://www.yubico.com/product/YubiKey-5-nfc).

## Overview

The [YubiKey 5 nfc](https://www.yubico.com/product/YubiKey-5-nfc) is a multi-purpose device with a few different
security-minded uses. One of the applications on the device is an application called PIV or "Personal Identity
Verification". PIV is a [standard published by
NIST](https://csrc.nist.gov/projects/piv/piv-standards-and-supporting-documentation) and describes the kinds of
credentials which make up the standard. PIV credentials have certificates and key pairs, pin numbers, biometrics
like fingerprints and pictures, and other unique identifiers. When put together into a PIV credential, it provides
the capability to implement multi-factor authentication for networks, applications and buildings.

In this quickstart you will see the commands and tools needed to use a [YubiKey 5
nfc](https://www.yubico.com/product/YubiKey-5-nfc) with a Ziti Network. This document is intended to serve as a
quickstart. That means limited context will be provided for each step. When appropriate there will be a small amount of
context or a comment included to aid in understanding of what is happening and why. Most if not all of these commands
are easily searched for using your search engine of choice.

> [!WARNING]
This quickstart intended audience is for more technically savvy indiviuals. You will need to be familar with the command
line interface of your operating system.

## Prerequistites

* [YubiKey 5 nfc](https://www.yubico.com/product/YubiKey-5-nfc) - clearly you'll need one in order to use this
  quickstart!
* [OpenSC](https://github.com/OpenSC/OpenSC/wiki) is installed and `pkcs11-tool` is either on the PATH or at a known
  location. Not required however this quickstart uses the `pkcs11-tool` to illustrate that the device is PKCS#11
  compliant. HSM manufacturers will generally provide a similar tool and often expand it's usage. See more below.
  [yubico-piv-tool](https://developers.yubico.com/yubico-piv-tool/) - YubiKey privides a similar tool to the
  `pkcs11-tool`. This tool is needed to be installed because it contains the pkcs#11 module (driver) for the HSM. As
  this is a tool specific to Yubico we've chosen to not use this in the following commands.
* Ensure the YubiKey is factory reset. To avoid any compliations with existing information in the YubiKey ensure the
  device is factory reset using the [YubiKey
  Manager](https://www.yubico.com/products/services-software/download/YubiKey-manager/).
* In order to successfully use the YubiKey the libraries provided by the `yubico-piv-tool` *MUST* either be on the path
  or in a common location that
* Linux Only: If you're using linux - you'll need to follow the [build
  instructions](https://developers.yubico.com/yubico-piv-tool/) provided by Yubico. Before you can do anything with the
  Yubikey you'll need to make sure the `libykcs11.so` exists on your system. When creating this quickstart the library
  was built to `./yubico-piv-tool-2.0.0/ykcs11/.libs/libykcs11.so`.
* [Ubuntu](https://ubuntu.com/) was used to test this guide. An initial attempt using [linux
  mint](https://linuxmint.com/) 

## Let's Use the YubiKey!

Here's the list of steps we'll accomplish in this quickstart:

* Establish a bunch of environment variables to make it easy to copy/paste the other commands. You'll want to *look at
  these environment variables*. They need to be setup properly. If you have problems with this guide it is almost
  certainly because you have an environment variable setup incorrectly. Double check them.
* Make a directory and generate a configuration files for Ziti
* Use the [Ziti CLI](https://netfoundry.jfrog.io/netfoundry/ziti-release/ziti/) to:
    * create two identities - one demonstrating an RSA key, one EC
    * enroll the identities
    * create a test service
    * create test router/service policies
* Use the pkcs11-tool provided by OpenSC to interact with the YubiKey to:
    * initialize the PIV app
    * create a key
* Use the [ziti-enroller](https://netfoundry.jfrog.io/netfoundry/ziti-release/ziti-enroller/) to enroll the identities
  using the YubiKey
* Use the [ziti-tunnel](https://netfoundry.jfrog.io/netfoundry/ziti-release/ziti-tunnel/) in proxy mode to verify things
  are working and traffic is flowing over the Ziti Network

> [!WARNING]
Do *NOT* use id `2` or `02` for any keys you add. Id `02` corresponds to the YubiKey's "Management Key". You will not be
able to write a key into this location. The error you will see will indicate: `CKR_USER_NOT_LOGGED_IN`.

### Establish Environment Variables

Open a command line and establish the following environment varibles. Note that for the YubiKey we do _not_ use id `02`
as it appears to be reserved by the YubiKey.  The default SOPIN and PIN are used as well. When using the YubiKey Manager
software the "SO PIN" corresponds to the "Management Key" while "pin" is the same both here and in the YubiKey Manager.

# [Linux/MacOS](#tab/env-var-linux)

    # the name of the ziti controller you're logging into
    export ZITI_CTRL=local-edge-controller
    # the location of the certificate(s) to use to validate the controller
    export ZITI_CTRL_CERT=/path/to/controller.cert

    export ZITI_USER=myUserName
    export ZITI_PWD=myPassword

    # a name for the configuration
    export HSM_NAME=yubikey_demo

    # path to the yubikey pkcs11 libraries
    export HSM_ROOT=/path/to/yubico-piv-tool-2.0.0
    export PKCS11_MODULE=${HSM_ROOT}/ykcs11/.libs/libykcs11.so

    # the id of the key - you probably want to leave these alone unless you know better
    export HSM_ID1=01
    export HSM_ID2=03

    # the pins used when accessing the pkcs11 api
    export HSM_SOPIN=010203040506070801020304050607080102030405060708
    export HSM_PIN=123456
    export RSA_ID=${HSM_NAME}${HSM_ID1}_rsa
    export EC_ID=${HSM_NAME}${HSM_ID2}_ec

    # location for the config files to be placed
    export HSM_DEST=${HSM_ROOT}/${HSM_NAME}
    export HSM_LABEL=${HSM_NAME}-label

    # make an alias for ease
    alias p='pkcs11-tool --module $PKCS11_MODULE'


# [Windows](#tab/env-var-windows)

> [!WARNING]
Ensure you use the correct dll. If you use an x86 dll with x64 binaries you'll get an error.

> [!WARNING]
With Windows - make sure you update the path to include the folder of libykcs11-1.dll as additional libraries are needed
by the pkcs11 driver!

    REM the name of the ziti controller you're logging into
    SET ZITI_CTRL=local-edge-controller
    REM the location of the certificate(s) to use to validate the controller
    SET ZITI_CTRL_CERT=c:\path\to\controller.cert
    
    SET ZITI_USER=myUserName
    SET ZITI_PWD=myPassword

    REM a name for the configuration
    SET HSM_NAME=softhsm_demo

    REM the path to the root of the softhsm config files
    SET HSM_ROOT=c:\path\to\yubico-piv-tool-2.0.0

    REM path to the pkcs11 library
    SET PATH=%PATH%;%HSM_ROOT%\bin
    SET PKCS11_MODULE=%HSM_ROOT%\bin\libykcs11-1.dll

    REM the id of the key - you probably want to leave these alone unless you know better
    SET HSM_ID1=01
    SET HSM_ID2=03
    SET RSA_ID=%HSM_NAME%%HSM_ID1%_rsa
    SET EC_ID=%HSM_NAME%%HSM_ID2%_ec
    
    REM the pins used when accessing the pkcs11 api
    SET HSM_SOPIN=010203040506070801020304050607080102030405060708
    SET HSM_PIN=123456

    SET HSM_DEST=%HSM_ROOT%\%HSM_NAME%
    SET HSM_LABEL=%HSM_NAME%-label
    SET SOFTHSM2_CONF=%HSM_DEST%\softhsm.config
    SET HSM_TOKENS_DIR=%HSM_DEST%\tokens\

    REM make an alias for ease
    doskey p="c:\Program Files\OpenSC Project\OpenSC\tools\pkcs11-tool.exe" --module %PKCS11_MODULE% $*

***

### Make Directories for Config Files

# [Linux/MacOS](#tab/dirs-and-config-linux)

    cd ${HSM_ROOT}

    rm -rf ${HSM_NAME}
    mkdir -p ${HSM_NAME}

    cd ${HSM_NAME}

# [Windows](#tab/dirs-and-config-windows)

    cd /d %HSM_ROOT%

    rmdir /s /q %HSM_NAME%
    mkdir %HSM_NAME%

    cd /d %HSM_NAME%

***

### Use the Ziti CLI

# [Linux/MacOS](#tab/ziti-cli-linux)

    ziti edge controller login $ZITI_CTRL:1280 -u $ZITI_USER -p $ZITI_PWD -c $ZITI_CTRL_CERT

    # create a new identity and output the jwt to a known location
    ziti edge controller create identity device "${RSA_ID}" -o "${HSM_DEST}/${RSA_ID}.jwt"

    # create a second new identity and output the jwt to a known location
    ziti edge controller create identity device "${EC_ID}" -o "${HSM_DEST}/${EC_ID}.jwt"

# [Windows](#tab/ziti-cli-windows)

    ziti edge controller login %ZITI_CTRL%:1280 -u %ZITI_USER% -p %ZITI_PWD% -c %ZITI_CTRL_CERT%

    REM create a new identity and output the jwt to a known location
    ziti edge controller create identity device "%RSA_ID%" -o "%HSM_DEST%\%RSA_ID%.jwt"

    REM create a second new identity and output the jwt to a known location
    ziti edge controller create identity device "%EC_ID%" -o "%HSM_DEST%\%EC_ID%.jwt"

***

### Use pkcs11-tool to Setup the YubiKey

# [Linux/MacOS](#tab/pkcs11-tool-linux)

    p --init-token --label "ziti-test-token" --so-pin $HSM_SOPIN

    # create a couple of keys - one rsa and one ec
    p -k --key-type rsa:2048 --usage-sign --usage-decrypt --login --id $HSM_ID1 --login-type so --so-pin $HSM_SOPIN --label defaultkey
    p -k --key-type EC:prime256v1 --usage-sign --usage-decrypt --login --id $HSM_ID2 --login-type so --so-pin $HSM_SOPIN --label defaultkey

# [Windows](#tab/pkcs11-tool-windows)

    p --init-token --label "ziti-test-token" --so-pin %HSM_SOPIN%

    REM create a couple of keys - one rsa and one ec
    p -k --key-type rsa:2048 --usage-sign --usage-decrypt --login --id %HSM_ID1% --login-type so --so-pin %HSM_SOPIN% --label defaultkey
    p -k --key-type EC:prime256v1 --usage-sign --usage-decrypt --login --id %HSM_ID2% --login-type so --so-pin %HSM_SOPIN% --label defaultkey

***

### Use ziti-enroller to Enroll the Identities

# [Linux/MacOS](#tab/enroll-linux)

    ziti-enroller -j "${HSM_DEST}/${RSA_ID}.jwt" -k "pkcs11://${PKCS11_MODULE}?id=${HSM_ID1}&pin=${HSM_PIN}" -v
    ziti-enroller -j "${HSM_DEST}/${EC_ID}.jwt" -k "pkcs11://${PKCS11_MODULE}?id=${HSM_ID2}&pin=${HSM_PIN}" -v

# [Windows](#tab/enroll-windows)

    ziti-enroller -j "%HSM_DEST%\%RSA_ID%.jwt" -k "pkcs11://%PKCS11_MODULE%?id=%HSM_ID1%&pin=%HSM_PIN%" -v
    ziti-enroller -j "%HSM_DEST%\%EC_ID%.jwt" -k "pkcs11://%PKCS11_MODULE%?id=%HSM_ID2%&pin=%HSM_PIN%" -v

***

### Use ziti-tunnel to Verify Things Work

# [Linux/MacOS](#tab/start-tunnel-linux)

    # if you only have a single edge router this command will work without the need for copy/paste
    EDGE_ROUTER_ID=$(ziti edge controller list edge-routers | cut -d " " -f2)
    
    # IF the above command doesn't work - run this command and get the id from the first edge-router.
    # ziti edge controller list edge-routers

    # then use the id returned from the above command and put it into a variable for use in a momment
    # EDGE_ROUTER_ID={insert the 'id' from above - example: 64d4967b-5474-4f06-8548-5700ed7bfa80}

    # remove/recreate the config - here we'll be instructing the tunneler to listen on localhost and port 9000
    ziti edge controller delete config wttrconfig
    ziti edge controller create config wttrconfig ziti-tunneler-client.v1 "{ \"hostname\" : \"localhost\", \"port\" : 9000 }"
    
    # recreate the service with the EDGE_ROUTER_ID from above. Here we are adding a ziti service that will
    # send a request to wttr.in to retreive a weather forecast
    ziti edge controller delete service wttr.ziti
    ziti edge controller create service wttr.ziti "${EDGE_ROUTER_ID}" tcp://wttr.in:80 --configs wttrconfig

    # start one or both proxies
    ziti-tunnel proxy -i "${HSM_DEST}/${RSA_ID}.json" wttr.ziti:8000 -v &
    ziti-tunnel proxy -i "${HSM_DEST}/${EC_ID}.json" wttr.ziti:9000 -v &

    # use a browser - or curl to verify the ziti tunneler is listening locally and the traffic has flowed over the ziti network
    curl -H "Host: wttr.in" http://localhost:8000
    curl -H "Host: wttr.in" http://localhost:9000

# [Windows](#tab/start-tunnel-windows)

    REM these two commands can't be copied and pasted - you need to get the result of the first command and use it in the next
    REM run this command and get the id from the first edge-router.
    ziti edge controller list edge-routers
    
    REM use the id returned from the above command and put it into a variable for use in a momment
    SET EDGE_ROUTER_ID={insert the 'id' from above - example: 64d4967b-5474-4f06-8548-5700ed7bfa80}

    REM remove/recreate the config - here we'll be instructing the tunneler to listen on localhost and port 9000
    ziti edge controller delete config wttrconfig
    ziti edge controller create config wttrconfig ziti-tunneler-client.v1 "{ \"hostname\" : \"localhost\", \"port\" : 9000 }"
    
    REM recreate the service with the EDGE_ROUTER_ID from above. Here we are adding a ziti service that will
    REM send a request to wttr.in to retreive a weather forecast
    ziti edge controller delete service wttr.ziti
    ziti edge controller create service wttr.ziti "%EDGE_ROUTER_ID%" tcp://wttr.in:80 --configs wttrconfig

    REM start one or both proxies - use ctrl-break or ctrl-pause to terminate these processes 
    start /b ziti-tunnel proxy -i "%HSM_DEST%/%RSA_ID%.json" wttr.ziti:8000 -v
    start /b ziti-tunnel proxy -i "%HSM_DEST%/%EC_ID%.json" wttr.ziti:9000 -v

    REM use a browser - or curl to verify the ziti tunneler is listening locally and the traffic has flowed over the ziti network
    curl -H "Host: wttr.in" http://localhost:8000 > "%HSM_DEST%\example_%RSA_ID%.txt"
    curl -H "Host: wttr.in" http://localhost:9000 > "%HSM_DEST%\example_%EC_ID%.txt"

    REM set the codepage for the cmd prompt so that the output looks nice
    chcp 65001
    
    REM show the results in the console
    type "%HSM_DEST%\example_%RSA_ID%.txt"
    type "%HSM_DEST%\example_%EC_ID%.txt"
    
***

### Putting It All Together

Above we've only shown the commands that need to run and not what the output of those commands would look like. Here
we'll see all the commands put together along with all the output from the commands. This section is long - you are
warned! Also note that this content is subject to change. If the output you see is not identical it's because the 

# [Sample Output](#tab/hidden-linux)

The tabs to the right contain example output from running all the commands in sequence. If you want to see what the
output would likely look like click one of the tabs to the right.

# [Linux/MacOS](#tab/verify-linux)

    -- coming soon--

# [Windows](#tab/verify-windows)

    -- coming soon --

***
