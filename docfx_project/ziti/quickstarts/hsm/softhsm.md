# SoftHSMv2

## Overview

[SoftHSMv2](https://www.opendnssec.org/softhsm/) is a purely software-based implementation of PKCS#11. Because it is
software it is not as secure as a physical HSM but it is very useful to explore the world of PKCS#11 and how it can be
used with a Ziti-enabled client.

In this quickstart you will see the commands used to work with SoftHSMv2 and ziti. Since this is a quickstart limited
context will be provided for each step. When appropriate there will be a small amount of context included to aid in
understanding of what is happening and why.

> [!WARNING]
This quickstart intended audience is for more technically savvy indiviuals. You will need to be familar with the command
line interface of your operating system.

## Prerequistites

* [SoftHSMv2](https://www.opendnssec.org/softhsm/) is downloaded and installed in a known location
* [OpenSC](https://github.com/OpenSC/OpenSC/wiki) is installed and `pkcs11-tool` is either on the PATH or at a known
  location

## Let's Do This - SoftHSMv2

Here's the list of steps we'll accomplish in this quickstart:

* Establish a bunch of environment variables to make it easy to copy/paste the other commands
* Make a directory and generate a configuration file for SoftHSM
* Use the [Ziti CLI](https://netfoundry.jfrog.io/netfoundry/ziti-release/ziti/) to:
    * create an identity
    * enroll the identity
    * create a test service
    * create test router/service policies
* Use the pkcs11-tool provided by OpenSC to interact with SoftHSM to:
    * initialize the SoftHSM driver
    * create a key
* Use the [ziti-tunnel](https://netfoundry.jfrog.io/netfoundry/ziti-release/ziti-tunnel/) in proxy mode to verify things
  are working and traffic is flowing over the Ziti Network

### Establish Environment Variables

Open a command line and establish the following environment varibles. 

# [Linux/MacOS](#tab/env-var-linux)

    # the name of the ziti controller you're logging into
    export ZITI_CTRL=local-edge-controller
    # the location of the certificate(s) to use to validate the controller
    export ZITI_CTRL_CERT=/path/to/controller.cert

    export ZITI_USER=myUserName
    export ZITI_PWD=myPassword

    # a name for the configuration
    export HSM_NAME=softhsm_demo

    # the path to the root of the softhsm config files
    export HSM_ROOT=/home/cd/.softhsm
    # location for the config file and tokens to be placed
    export HSM_DEST=${HSM_ROOT}/${HSM_NAME}

    # path to the softhsm2 library
    export PKCS11_MODULE=/usr/local/lib/softhsm/libsofthsm2.so

    # the id of the key - you probably want to leave these alone unless you know better
    export HSM_ID1=01

    # the pins used when accessing the pkcs11 api
    export HSM_SOPIN=1111
    export HSM_PIN=2222

    export HSM_DEST=${HSM_ROOT}/${HSM_NAME}
    export SOFTHSM2_CONF=${HSM_DEST}/softhsm.config
    export HSM_LABEL=${HSM_NAME}-label
    export HSM_TOKENS_DIR="${HSM_DEST}/tokens/"

    # make an alias for ease
    alias p='pkcs11-tool --module $PKCS11_MODULE'

# [Windows](#tab/env-var-windows)

Ensure you use the correct dll. If you use an x86 dll with x64 binaries you'll get an error.

    REM the name of the ziti controller you're logging into
    SET ZITI_CTRL=local-edge-controller
    REM the location of the certificate(s) to use to validate the controller
    SET ZITI_CTRL_CERT=c:\path\to\controller.cert
    
    SET ZITI_USER=myUserName
    SET ZITI_PWD=myPassword

    REM a name for the configuration
    SET HSM_NAME=softhsm_demo

    REM the path to the root of the softhsm config files
    SET HSM_ROOT=c:\path\to\softhsm
    REM path to the softhsm2 library
    SET PKCS11_MODULE=%HSM_ROOT%\lib\softhsm2.dll
    --- or ---
    SET PKCS11_MODULE=%HSM_ROOT%\lib\softhsm2-x64.dll

    REM the id of the key - you probably want to leave these alone unless you know better
    SET HSM_ID1=01
    SET HSM_ID2=02
    
    REM the pins used when accessing the pkcs11 api
    SET HSM_SOPIN=1111
    SET HSM_PIN=2222

    SET HSM_DEST=%HSM_ROOT%\%HSM_NAME%
    SET HSM_LABEL=%HSM_NAME%-label
    SET SOFTHSM2_CONF=%HSM_DEST%\softhsm.config
    SET HSM_TOKENS_DIR=%HSM_DEST%\tokens\

    REM make an alias for ease
    doskey p="c:\Program Files\OpenSC Project\OpenSC\tools\pkcs11-tool.exe" --module %PKCS11_MODULE% $*

***

### Make Directories and Generate Config Files

# [Linux/MacOS](#tab/dirs-and-config-linux)

    cd ${HSM_ROOT}

    rm -rf ${HSM_NAME}
    mkdir -p ${HSM_TOKENS_DIR}

    cd ${HSM_NAME}

    # Create a text file at ${SOFTHSM2_CONF} with these contents but make sure you replace the tokendir entry with ${HSM_TOKENS_DIR}
    cat > ${SOFTHSM2_CONF} <<HERE
    # SoftHSM v2 configuration file

    directories.tokendir = ${HSM_TOKENS_DIR}
    objectstore.backend = file

    # ERROR, WARNING, INFO, DEBUG
    log.level = INFO

    # If CKF_REMOVABLE_DEVICE flag should be set
    slots.removable = false

    # Enable and disable PKCS#11 mechanisms using slots.mechanisms.
    slots.mechanisms = ALL
    HERE

# [Windows](#tab/dirs-and-config-windows)

    cd /d %HSM_ROOT%

    rmdir /s /q %HSM_NAME%
    mkdir %HSM_TOKENS_DIR%

    cd /d %HSM_NAME%

Create a text file at %SOFTHSM2_CONF% with these contents but make sure you replace the tokendir entry with %HSM_TOKENS_DIR%

    # SoftHSM v2 configuration file

    directories.tokendir = _REPLACE_TOKENDIR_
    objectstore.backend = file

    # ERROR, WARNING, INFO, DEBUG
    log.level = INFO

    # If CKF_REMOVABLE_DEVICE flag should be set
    slots.removable = false

    # Enable and disable PKCS#11 mechanisms using slots.mechanisms.
    slots.mechanisms = ALL

***

### Use the Ziti CLI

# [Linux/MacOS](#tab/ziti-cli-linux)

    ziti edge controller login $ZITI_CTRL:1280 -u $ZITI_USER -p $ZITI_PWD -c $ZITI_CTRL_CERT

    # create a new identity and output the jwt to a known location
    ziti edge controller create identity device "${HSM_NAME}${HSM_ID1}" -o "${HSM_DEST}/${HSM_NAME}${HSM_ID1}.jwt"

    # create a second new identity and output the jwt to a known location
    ziti edge controller create identity device "${HSM_NAME}${HSM_ID2}" -o "${HSM_DEST}/${HSM_NAME}${HSM_ID2}.jwt"

# [Windows](#tab/ziti-cli-windows)

    ziti edge controller login %ZITI_CTRL%:1280 -u %ZITI_USER% -p %ZITI_PWD% -c %ZITI_CTRL_CERT%

    REM create a new identity and output the jwt to a known location
    ziti edge controller create identity device "%HSM_NAME%%HSM_ID1%" -o %HSM_DEST%\%HSM_NAME%%HSM_ID1%.jwt"

    REM create a second new identity and output the jwt to a known location
    ziti edge controller create identity device "%HSM_NAME%%HSM_ID2%" -o %HSM_DEST%\%HSM_NAME%%HSM_ID2%.jwt"

***

### Use pkcs11-tool to Setup SoftHSMv2

# [Linux/MacOS](#tab/pkcs11-tool-linux)

    p --init-token --label "ziti-test-token" --so-pin $HSM_SOPIN
    p --init-pin --pin $HSM_PIN --so-pin $HSM_SOPIN

    # create a couple of keys - one rsa and one ec
    p -p $HSM_PIN -k --key-type rsa:2048 --id "${HSM_ID1}" --label ziti-rsa-key --usage-sign --usage-decrypt
    p -p $HSM_PIN -k --key-type EC:prime256v1 --id ${HSM_ID2} --label ziti-ecdsa-key --usage-sign --usage-decrypt

# [Windows](#tab/pkcs11-tool-windows)

    p --init-token --label "ziti-test-token" --so-pin %HSM_SOPIN%
    p --init-pin --pin "%HSM_PIN%" --so-pin %HSM_SOPIN%

    REM create a couple of keys - one rsa and one ec
    p -p "%HSM_PIN%" -k --key-type rsa:2048 --id "%HSM_ID1%" --label ziti-rsa-key --usage-sign --usage-decrypt
    p -p "%HSM_PIN%" -k --key-type EC:prime256v1 --id "%HSM_ID2%" --label ziti-ecdsa-key --usage-sign --usage-decrypt

***

### Use ziti-tunnel to Verify Things Work

# [Linux/MacOS](#tab/verify-linux)

    ziti-enroller -j "${HSM_DEST}/${HSM_NAME}1.jwt" -k "pkcs11:///${PKCS11_MODULE}?id=${HSM_ID1}&pin=${HSM_PIN}" -v
    ziti-enroller -j "${HSM_DEST}/${HSM_NAME}2.jwt" -k "pkcs11:///${PKCS11_MODULE}?id=${HSM_ID2}&pin=${HSM_PIN}" -v

# [Windows](#tab/verify-windows)

    ziti-enroller -j "%HSM_DEST%\%HSM_NAME%%HSM_ID1%.jwt" -k "pkcs11://%PKCS11_MODULE%?id=%HSM_ID1%&pin=%HSM_PIN%" -v
    ziti-enroller -j "%HSM_DEST%\%HSM_NAME%%HSM_ID2%.jwt" -k "pkcs11://%PKCS11_MODULE%?id=%HSM_ID2%&pin=%HSM_PIN%" -v

***

### Putting It All Together

Above we've only shown the commands that need to run and not what the output of those commands would look like. Here
we'll see all the commands put together along with all the output from the commands. This section is long - you are
warned!

# [Linux/MacOS](#tab/verify-linux)

    ziti-enroller -j "${HSM_DEST}/${HSM_NAME}1.jwt" -k "pkcs11:///${PKCS11_MODULE}?id=${HSM_ID1}&pin=${HSM_PIN}" -v
    ziti-enroller -j "${HSM_DEST}/${HSM_NAME}2.jwt" -k "pkcs11:///${PKCS11_MODULE}?id=${HSM_ID2}&pin=${HSM_PIN}" -v

# [Windows](#tab/verify-windows)

    ziti-enroller -j "%HSM_DEST%\%HSM_NAME%%HSM_ID1%.jwt" -k "pkcs11://%PKCS11_MODULE%?id=%HSM_ID1%&pin=%HSM_PIN%" -v
    ziti-enroller -j "%HSM_DEST%\%HSM_NAME%%HSM_ID2%.jwt" -k "pkcs11://%PKCS11_MODULE%?id=%HSM_ID2%&pin=%HSM_PIN%" -v

***
