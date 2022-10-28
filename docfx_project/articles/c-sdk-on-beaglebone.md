# Building the Ziti C SDK and Sample Apps for arm (BeagleBone)

This article walks you through building the Ziti C SDK for Linux-arm and running
the wttr sample application on a [BeagleBone SanCloud](https://beagleboard.org/enhanced).

## Configure the Host System

This article uses an Ubuntu 19.10 virtual machine as a development host because it's
relatively easy to install a functional toolchain that targets arm-linux.

    devbox$ sudo apt-get install gcc-arm-linux-gnueabihf g++-arm-linux-gnueabihf \
        binutils-arm-linux-gnueabihf gdb-multiarch cmake git

## Build the SDK and Sample Applications


    devbox$ git clone --recurse-submodules https://github.com/netfoundry/ziti-sdk-c.git
    Cloning into 'ziti-sdk-c'...
    remote: Enumerating objects: 77, done.
    remote: Counting objects: 100% (77/77), done.
    remote: Compressing objects: 100% (50/50), done.
    remote: Total 1287 (delta 35), reused 51 (delta 24), pack-reused 1210
    Receiving objects: 100% (1287/1287), 475.44 KiB | 4.85 MiB/s, done.
    ...

    devbox$ cd ziti-sdk-c
    devbox$ mkdir build-Linux-arm
    devbox$ cd build-Linux-arm
    devbox$ cmake -DCMAKE_TOOLCHAIN_FILE=../toolchains/Linux-arm.cmake ..
    project version: 0.9.2.1 (derived from git)
    -- The C compiler identification is GNU 9.2.1
    -- The CXX compiler identification is GNU 9.2.1
    -- Check for working C compiler: /usr/bin/arm-linux-gnueabihf-gcc
    ...

    $ make
    [  1%] Building C object deps/uv-mbed/deps/libuv/CMakeFiles/uv_a.dir/src/fs-poll.c.o
    [  1%] Building C object deps/uv-mbed/deps/libuv/CMakeFiles/uv_a.dir/src/idna.c.o
    [  2%] Building C object deps/uv-mbed/deps/libuv/CMakeFiles/uv_a.dir/src/inet.c.o
    [  2%] Building C object deps/uv-mbed/deps/libuv/CMakeFiles/uv_a.dir/src/random.c.o
    ...
    [ 99%] Building C object programs/sample_wttr/CMakeFiles/sample_wttr.dir/sample_wttr.c.o
    [ 99%] Linking C executable sample_wttr
    [ 99%] Built target sample_wttr
    [100%] Built target sample-host


When `make` completes, you'll have statically linked binaries for the SDK's sample applications.

## Set up a Ziti Network

For this article we'll use a Ziti Edge Developer Edition to run our network. Follow
the [Ziti Network Quickstart](../ziti/quickstarts/quickstart-overview.md).

### Create the "demo-weather" Service

The sample_wttr application accesses a service named "demo-weather", so we'll create
that service now. Log in to your Ziti Edge Developer Edition web UI and follow the
steps:

1. On the left side nav bar, click "Edge Services"
2. In the top right corner of the screen click the "plus" image to add a new service
3. Choose a name for the serivce. Enter "demo-weather"
4. Choose Router "ziti-gw01"
5. For Endpoint Service choose:
    * protocol = tcp
    * host = wttr.in
    * port = 80
6. Click save

## Upload the Artifacts to Your BeagleBone

At this point we have created all of the artifacts that are needed for running the
sample application:

- The "sample_wttr" executable
- The Ziti identity json file (e.g. "NewUser.json")

Now we need to upload these artifacts to the BeagleBone. The scp command shown here
assumes that:

 - You are in the `build-Linux-arm` subdirectory where the `make` command was executed above.
 - Your BeagleBone is running sshd and has an IP address of 192.168.2.2 which
   can be reached from your development host
 - The Ziti identity json file that was created when you followed the Ziti Network Quickstart
   was downloaded to your ~/Downloads directory.


    devbox$ scp ./programs/sample_wttr/sample_wttr root@192.168.2.2:.
    $ scp ~/Downloads/NewUser.json ./programs/sample_wttr/sample_wttr debian@192.168.2.2:.
    NewUser.json                                  100% 6204     2.5MB/s   00:00
    sample_wttr                                   100% 2434KB   5.4MB/s   00:00


## Run the Application

Now we're ready to log into the BeagleBone and run the sample application.
Let's go!

    ubuntu@beaglebone:~$ ./sample_wttr ./NewUser.json
    [        0.000] INFO    library/ziti.c:173 NF_init(): ZitiSDK version 0.9.2.1-local @de37e6f(wttr-sample-shutdown-cleanup) starting at (2019-09-05T22:35:12.259)
    [        0.000] INFO    library/ziti.c:195 NF_init_with_tls(): ZitiSDK version 0.9.2.1-local @de37e6f(wttr-sample-shutdown-cleanup)
    /home/scarey/repos/github.com/netfoundry/ziti-sdk-c/deps/uv-mbed/src/http.c:315 ERR TLS handshake error 
    /home/scarey/repos/github.com/netfoundry/ziti-sdk-c/deps/uv-mbed/src/http.c:153 WARN received -103 (software caused connection abort)
    [        0.210] ERROR   library/ziti.c:433 version_cb(): failed to get controller version from ec2-54-164-120-24.compute-1.amazonaws.com:1280 CONTROLLER_UNAVAILABLE(software caused connection abort)
    [        0.210] WARN    library/ziti_ctrl.c:49 code_to_error(): unmapped error code: CONTROLLER_UNAVAILABLE
    [        0.210] ERROR   library/ziti.c:419 session_cb(): failed to login: CONTROLLER_UNAVAILABLE[-11](software caused connection abort)
    ERROR: status => WTF: programming error
    ubuntu@beaglebone:~# 

Oops. Actually The Ziti SDK verifies the certificate from the Ziti Edge Controller,
so we need to set the clock on the BeagleBone to a time/date that is within the
valid range of the certificate. Might as well set the clock to the current time:

    ubuntu@beaglebone:~# sudo rdate time.nist.gov
    Wed Mar 18 15:46:56 2020

And _now_ we are ready to run the application:

    ubuntu@beaglebone:~$ ./sample_wttr ./NewUser.json
    [        0.000] INFO    library/ziti.c:173 NF_init(): ZitiSDK version 0.9.2.1-local @de37e6f(wttr-sample-shutdown-cleanup) starting at (2020-03-18T15:46:57.536)
    [        0.000] INFO    library/ziti.c:195 NF_init_with_tls(): ZitiSDK version 0.9.2.1-local @de37e6f(wttr-sample-shutdown-cleanup)
    [        0.554] INFO    library/ziti.c:438 version_cb(): connected to controller ec2-54-164-120-24.compute-1.amazonaws.com:1280 version v0.9.0(ea556fc18740 2020-02-11 16:09:08)
    [        0.696] INFO    library/connect.c:180 connect_get_service_cb(): got service[demo-weather] id[cc90410f-1017-4d23-977a-3695cb58f4e8]
    [        0.810] INFO    library/connect.c:209 connect_get_net_session_cb(): got session[d89bfdd8-c7e5-42ff-a39f-63056eeb3a82] for service[demo-weather]
    [        0.810] INFO    library/channel.c:148 ziti_channel_connect(): opening new channel for ingress[tls://ec2-54-164-120-24.compute-1.amazonaws.com:3022] ch[0]
    sending HTTP request
    request success: 99 bytes sent
    HTTP/1.1 200 OK
    Server: nginx/1.10.3
    Date: Wed, 18 Mar 2020 15:47:00 GMT
    Content-Type: text/plain; charset=utf-8
    Content-Length: 8662
    Connection: close
    
    Weather report: Rochester
    
         \   /     Sunny
          .-.      39 °F          
       ― (   ) ―   ↖ 0 mph        
          `-’      9 mi           
         /   \     0.0 in         
                                                           ┌─────────────┐                                                       
    ┌──────────────────────────────┬───────────────────────┤  Wed 18 Mar ├───────────────────────┬──────────────────────────────┐
    │            Morning           │             Noon      └──────┬──────┘     Evening           │             Night            │
    ├──────────────────────────────┼──────────────────────────────┼──────────────────────────────┼──────────────────────────────┤
    │               Overcast       │               Overcast       │               Cloudy         │               Overcast       │
    │      .--.     32..35 °F      │      .--.     35..41 °F      │      .--.     39..44 °F      │      .--.     37..42 °F      │
    │   .-(    ).   ↖ 3-4 mph      │   .-(    ).   ← 6-8 mph      │   .-(    ).   ← 9-16 mph     │   .-(    ).   ↖ 9-17 mph     │
    │  (___.__)__)  6 mi           │  (___.__)__)  6 mi           │  (___.__)__)  6 mi           │  (___.__)__)  6 mi           │
    │               0.0 in | 0%    │               0.0 in | 0%    │               0.0 in | 0%    │               0.0 in | 0%    │
    └──────────────────────────────┴──────────────────────────────┴──────────────────────────────┴──────────────────────────────┘
                                                           ┌─────────────┐                                                       
    ┌──────────────────────────────┬───────────────────────┤  Thu 19 Mar ├───────────────────────┬──────────────────────────────┐
    │            Morning           │             Noon      └──────┬──────┘     Evening           │             Night            │
    ├──────────────────────────────┼──────────────────────────────┼──────────────────────────────┼──────────────────────────────┤
    │    \  /       Partly cloudy  │               Cloudy         │    \  /       Partly cloudy  │  _`/"".-.     Patchy light d…│
    │  _ /"".-.     41..44 °F      │      .--.     50 °F          │  _ /"".-.     53..55 °F      │   ,\_(   ).   50..53 °F      │
    │    \_(   ).   ← 4-7 mph      │   .-(    ).   ← 4-6 mph      │    \_(   ).   ↖ 6-11 mph     │    /(___(__)  ↖ 10-19 mph    │
    │    /(___(__)  3 mi           │  (___.__)__)  6 mi           │    /(___(__)  6 mi           │      ‘ ‘ ‘ ‘  4 mi           │
    │               0.0 in | 0%    │               0.0 in | 0%    │               0.0 in | 0%    │     ‘ ‘ ‘ ‘   0.0 in | 20%   │
    └──────────────────────────────┴──────────────────────────────┴──────────────────────────────┴──────────────────────────────┘
                                                           ┌─────────────┐                                                       
    ┌──────────────────────────────┬───────────────────────┤  Fri 20 Mar ├───────────────────────┬──────────────────────────────┐
    │            Morning           │             Noon      └──────┬──────┘     Evening           │             Night            │
    ├──────────────────────────────┼──────────────────────────────┼──────────────────────────────┼──────────────────────────────┤
    │  _`/"".-.     Light rain sho…│    \  /       Partly cloudy  │    \  /       Partly cloudy  │               Cloudy         │
    │   ,\_(   ).   62 °F          │  _ /"".-.     66 °F          │  _ /"".-.     48..51 °F      │      .--.     46 °F          │
    │    /(___(__)  ↑ 14-27 mph    │    \_(   ).   ↗ 26-41 mph    │    \_(   ).   → 24-36 mph    │   .-(    ).   → 22-30 mph    │
    │      ‘ ‘ ‘ ‘  6 mi           │    /(___(__)  6 mi           │    /(___(__)  6 mi           │  (___.__)__)  6 mi           │
    │     ‘ ‘ ‘ ‘   0.0 in | 29%   │               0.0 in | 59%   │               0.0 in | 41%   │               0.0 in | 0%    │
    └──────────────────────────────┴──────────────────────────────┴──────────────────────────────┴──────────────────────────────┘
    Location: Rochester, Monroe County, New York, United States of America [43.157285,-77.6152139]
    
    Follow @igor_chubin for wttr.in updates
    request completed: Connection closed
    [        3.714] INFO    library/ziti.c:238 NF_shutdown(): Ziti is shutting down
    ========================
