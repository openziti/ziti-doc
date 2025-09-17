---
slug: lessons-learned-writing-a-zero-trust-nginx-module
title: "Lessons Learned Writing a Zero Trust NGINX Module"
authors: [AndrewMartinez]
date: 2023-01-18
tags:
- nginx
- zero trust
- security
- module
---

# Lessons Learned Writing A Zero Trust NGINX Module

I authored my first NGINX module to offload [OpenZiti](http://openziti.io) connections into a legacy application deployment. That work can be seen in Github in the OpenZiti [`ngx_ziti_module`](https://github.com/openziti/ngx_ziti_module) and an article explaining its operation can be found here: [NGINX& ZeroTrust API Security](https://blog.openziti.io/nginx-zerotrust-api-security)

This article describes how the goals of the module were achieved and outlines some NGINX not-so-obvious-to-me gotchas.

Resources I used include the following:

* [NGINX web site](https://nginx.org/en/)
    
* [NGINX GitHub mirror](https://github.com/nginx/nginx)
    
* [NGINX Developer Documentation](https://nginx.org/en/docs/dev/development_guide.html)
    
* [OpenZiti web site](http://openziti.io)
    
* [OpenZiti GitHub](https://github.com/openziti)
    
* [OpenZiti C SDK GitHub](https://github.com/openziti/ziti-sdk-c)
    

## Enabling CMake

At first, I failed to grasp how much easier it is to use CMake in modern IDEs over other build processes. Most of my work has been in projects that already had CMake implemented. The NGINX repository has its own method of building itself and its modules. However, IDEs, such as CLion, do not immediately pick it up. I spent some time learning to use the NGINX build scripts, but it left me wanting.

I decided to make my module buildable with CMake. I knew it would enable an automatic build flow in CLion, my IDE of choice, and would provide patterns for dependency management. CMake makes it trivial to include other projects no matter how they are built. I had two dependencies NGINX itself and the Ziti C SDK. I figured it would make my life easier....and it did eventually, but only after I learned that the NGINX build tools auto-generate module code for you. If you miss this, as I did, NGINX will not load the resulting library.

Below you can see the main `CMakeLists.txt` used in the `ngx_ziti_module` project:

```plaintext
cmake_minimum_required(VERSION 3.16)
project(ngx_ziti_module C)

set(CMAKE_C_STANDARD 99)

include(ExternalProject)
include(FetchContent)
find_package(Git REQUIRED)

add_library(${PROJECT_NAME} SHARED ngx_ziti_module.c)
set_target_properties(${PROJECT_NAME} PROPERTIES PREFIX "")

add_compile_definitions(IS_CMAKE=1)

add_subdirectory("deps")
```

Additionally, there is a `deps` folder that contains another `CMakeLists.txt` that includes both the [Ziti C SDK](https://github.com/openziti/ziti-sdk-c) and NGINX as dependencies.

```plaintext
set(NGINX_CONFIGURE_ARGS "--with-threads" "--with-compat")

if (DEBUG)
    set(NGINX_CONFIGURE_ARGS "--with-threads" "--with-compat" "--with-debug")
endif()

message("args ${NGINX_CONFIGURE_ARGS}")

# build against nginx at the version specified by GIT_TAG. nginx uses custom auto configuration scripts that
# creates header files that are specific to the current host and output to <nginx dir>/objs/*.h.
ExternalProject_Add(
        nginx
        PREFIX ${CMAKE_BINARY_DIR}/_deps/nginx
        GIT_REPOSITORY https://github.com/nginx/nginx.git
        GIT_TAG release-1.23.2
        TIMEOUT 10
        CONFIGURE_COMMAND ./auto/configure ${NGINX_CONFIGURE_ARGS}
        INSTALL_COMMAND "" #empty install command to disable install
        UPDATE_COMMAND "" #empty update command to disable update
        LOG_DOWNLOAD ON
        BUILD_IN_SOURCE 1 #build inside of the downloaded repo's source directory as expected by auto/configure
)

if(NOT DEFINED $ENV{ZITI_SDK_C_BRANCH})
    SET(ZITI_SDK_C_BRANCH "main")
endif()

FetchContent_Declare(ziti-sdk-c
        GIT_REPOSITORY https://github.com/openziti/ziti-sdk-c.git
        GIT_TAG ${ZITI_SDK_C_BRANCH}
        )


set(ZITI_BUILD_TESTS off)
set(ZITI_BUILD_PROGRAMS off)
FetchContent_MakeAvailable(ziti-sdk-c)

add_dependencies(${PROJECT_NAME} nginx)

ExternalProject_Get_property(nginx SOURCE_DIR)
message("project name ${PROJECT_NAME}")
target_include_directories(${PROJECT_NAME}
        PUBLIC "${SOURCE_DIR}/objs"
        PUBLIC "${SOURCE_DIR}/src/core"
        PUBLIC "${SOURCE_DIR}/src/event"
        PUBLIC "${SOURCE_DIR}/src/event/modules"
        PUBLIC "${SOURCE_DIR}/src/http"
        PUBLIC "${SOURCE_DIR}/src/http/modules"
        PUBLIC "${SOURCE_DIR}/src/mail"
        PUBLIC "${SOURCE_DIR}/src/stream"
        PUBLIC "${SOURCE_DIR}/src/os/unix"
        )

target_link_libraries(${PROJECT_NAME} ziti)
```

For a new project that doesn't need the Ziti C SDK, the above can be simplified and reduced to one file if desired.

```plaintext
cmake_minimum_required(VERSION 3.16)
include(ExternalProject)
find_package(Git REQUIRED)

project(ngx_ziti_module C)

set(CMAKE_C_STANDARD 99)

set(NGINX_CONFIGURE_ARGS "--with-threads" "--with-compat")

if (DEBUG)
    set(NGINX_CONFIGURE_ARGS "--with-threads" "--with-compat" "--with-debug")
endif()

message("args ${NGINX_CONFIGURE_ARGS}")

# build against nginx at the version specified by GIT_TAG. nginx uses custom auto configuration scripts that
# creates header files that are specific to the current host and output to <nginx dir>/objs/*.h.
ExternalProject_Add(
        nginx
        PREFIX ${CMAKE_BINARY_DIR}/_deps/nginx
        GIT_REPOSITORY https://github.com/nginx/nginx.git
        GIT_TAG release-1.23.2
        TIMEOUT 10
        CONFIGURE_COMMAND ./auto/configure ${NGINX_CONFIGURE_ARGS}
        INSTALL_COMMAND "" #empty install command to disable install
        UPDATE_COMMAND "" #empty update command to disable update
        LOG_DOWNLOAD ON
        BUILD_IN_SOURCE 1 #build inside of the downloaded repo's source directory as expected by auto/configure
)

add_dependencies(${PROJECT_NAME} nginx)

add_library(${PROJECT_NAME} SHARED ngx_ziti_module.c)
set_target_properties(${PROJECT_NAME} PROPERTIES PREFIX "")

add_compile_definitions(IS_CMAKE=1)
```

Of vital importance is the `add_compile_definitions(IS_CMAKE=1)` line. This line is used to generate a `#define IS_CMAKE=1` line during compilation performed by CMake. If the NGINX build tools are used, it will not be defined. This allowed me to conditionally define the code that the NGINX build tool generates during a CMake build.

The following code shows how the `IS_CMAKE` definition is used and shows an example of the auto-generated code that the NGINX tool produces.

```c
#ifdef IS_CMAKE
/*
 * nginx required symbols, unused by this project, but required by nginx.
 * The standard nginx build tools add this section of code automatically during `./configure ....`.
 * This is only used for standalone CMake builds.
 */
ngx_module_t *ngx_modules[] = {
        &ngx_ziti_module,
        NULL
};

char *ngx_module_names[] = {
        "ngx_ziti_module",
        NULL
};

char *ngx_module_order[] = {
        NULL
};

#endif //IS_CMAKE
```

The variables `ngx_modules`, `ngx_module_names`, and `ngx_module_order` are required to be present in every NGINX module. NGINX will refuse to load libraries without them. As stated earlier, the NGINX build tools do this for you. For CMake, we must do it for ourselves.

## Debugging

NGINX will default to starting a background (daemon) process and then fork many processes underneath it. This is not favorable for debugging and testing, as your IDE will not be attached to the correct process unless you manually attach a debugger to a specific child process. Even so, it is difficult to know which child process will handle a given incoming test request.

I chose violence from the start by beginning to develop with child processes enabled and in daemon mode. Debugging would not hit my breakpoints, nor would the process end when I stopped it via my IDE. This caused me much confusion, and I unknowingly had a pile of NGINX processes all running or trying to run in the background. I was slowly strangling my machine, causing it to run slower and slower. I was already upset that I couldn't debug my module, and I was becoming increasingly upset that my machine was running slowly. It was a vicious cycle.

After taking a break and a bit of searching on the internet, I figured out what I was doing wrong and how to deal with it. It is possible to start NGINX in a single foreground process with the following lines added to the top of an NGINX configuration:

```plaintext
# development settings to keep nginx from starting in daemon mode and forking child processes
# do not use for non-dev deployments
daemon off;
master_process off;
```

The line `daemon off` starts NGINX as a foreground process. This is desirable so that killing the process via `ctrl+c`, interrupts (i.e., SIGINT), or via an IDE's stop/kill buttons, will have the NGINX process fully exit. Without it, the process and its children will remain in the background even if the IDE is no longer debugging. This can cause issues with subsequent runs and may lead to scenarios where one is debugging a previous run instead of the current run.

The line `master_process off` keeps NGINX from forking into many child processes. This effectively creates a single process that is easier to debug. This will simplify attaching debuggers and enable you to debug the entire life cycle of a module.

It is worth noting that you must test your module with `master_process on` (it can be omitted and will default to on) to ensure it works when running in child processes. Your module will configure once at startup and initialize in each child process. I could not find clear documentation of this. I discovered this only after stepping through the NGINX startup process. If your module depends on shared memory, it cannot be initialized during configuration. It must be configured in each process initialization. If not, you risk accessing random memory or null pointers.

## Logging

I found logging in NGINX to be misleading during initial module development. One of the first tasks in writing a module includes adding configuration processing. This configuration is what helps your module to do "something" - like hit a specific server or load resources. I wanted to index any `ziti` blocks and prepare to handle them. This included many log statements about what blocks and values were found. This did not work.

During configuration, logging statements with a level lower than `emergency` are ignored and produce no output. At this point in the NGINX process, your only options are to return a configuration error or to log emergency statements.

I initially did not understand the difference between the configuration and run phases. This caused me hours of debug time trying to figure out why my log messages were not emitting. Once I understood what was going on, I started to attack logging in other areas of my module.

I found the following macros to be useful:

```c
#define ngx_ziti_debug(log, ...) ngx_log_error(NGX_LOG_DEBUG, log, 0, __VA_ARGS__)
#define ngx_ziti_emerg(log, ...) ngx_log_error(NGX_LOG_EMERG, log, 0, __VA_ARGS__)
#define ngx_ziti_warn(log, ...) ngx_log_error(NGX_LOG_WARN, log, 0, __VA_ARGS__)
#define ngx_ziti_info(log, ...) ngx_log_error(NGX_LOG_INFO, log, 0, __VA_ARGS__)
```

Example invocation:

```c
static void ngx_ziti_run_service(void *data, ngx_log_t *log) {
    //...
    if(server_socket <= 0) {
        ngx_ziti_emerg(log, "for block %s service %s could not open server socket (%d), service thread exiting", service_ctx->block->name.data, service_ctx->service.data, server_socket);
        return;
    }
    //...
}
```

## Custom Configuration Blocks

For the `ngx_ziti_module` I wanted a clean top-level custom block. Most of the examples of configuration I found only included adding directives to existing blocks or a simple single top-level configuration value. I wanted to define blocks that could contain more configuration values.

I could have had many `ziti_` prefixed configuration items and simply moved on, but that would have bruised my sensibilities. I had "higher" aspirations. The goal was the following configuration block:

```nginx
ziti myZitiInstanceNameUsedForLogging {
    identity_file /home/testacct/.zi/identities/http_host.json;

    bind http-service {
        upstream localhost:7070;
    }
}
```

However, I could not get it to work. NGINX complained about the block not being allowed or the block not being allowed to have sub-configuration items. To make matters worse, I could not find an example that demonstrated what I was doing wrong. The NGINX developer documentation also left me puzzled.

So, I started reading the NGINX code that already defines complex configuration blocks, and I eventually stumbled upon what I was missing. It turns out there were some very subtle configurations necessary to do it. I needed custom location ids, and I needed to set the type of my blocks during configuration.

The following are the directives I eventually settled upon:

```c
#define NGX_ZITI_CONF 0x80000001
#define NGX_ZITI_BIND_CONF 0x80000002

/**
 * Defines nginx directives for the ziti block and sub components.
 */
static ngx_command_t ngx_ziti_commands[] = {

        {ngx_string("ziti"), /* directive */
         NGX_MAIN_CONF| NGX_DIRECT_CONF | NGX_CONF_BLOCK | NGX_CONF_TAKE1, /* location context and takes
                                            no arguments*/
         ngx_ziti, /* configuration setup function */
         0, /* No offset. Only one context is supported. */
         0, /* No offset when storing the module configuration on struct. */
         NULL},

        {ngx_string("identity_file"),
         NGX_ZITI_CONF | NGX_DIRECT_CONF | NGX_CONF_TAKE1,
         ngx_ziti_identity_file,
         0,
         0,
         NULL},
        { ngx_string("bind"),
          NGX_ZITI_CONF | NGX_DIRECT_CONF | NGX_CONF_BLOCK | NGX_CONF_TAKE1,
          ngx_ziti_bind,
          0,
          0,
          NULL
        },
        { ngx_string("upstream"),
          NGX_ZITI_BIND_CONF | NGX_DIRECT_CONF | NGX_CONF_TAKE1,
          ngx_ziti_bind_upstream,
          0,
          0,
          NULL
        },
        ngx_null_command /* command termination */
};
```

This code starts with some declarations of id's that are used later on during configuration parsing:

```c
#define NGX_ZITI_CONF 0x80000001
#define NGX_ZITI_BIND_CONF 0x80000002
```

`NGX_ZITI_CONF` and `NGX_ZITI_BINDCONF` are both block ids - one for `ziti` and the other for `bind`. The `ziti` and `bind` items are both blocks that will contain other configuration items. During the `ziti` and `bind` configuration item processing, they will set their type to `NGX_ZITI_CONF` and `NGX_ZITI_BIND_CONF`. Configuration items that go within those blocks will specify `NGX_ZITI_CONF` or `NGX_ZITI_BIND_CONF` as their configuration location during their definition.

The following snippet shows the declaration of the `ziti` block item

```c
/**
 * Defines nginx directives for the ziti block and sub components.
 */
static ngx_command_t ngx_ziti_commands[] = {

        {ngx_string("ziti"), /* directive */
         NGX_MAIN_CONF| NGX_DIRECT_CONF | NGX_CONF_BLOCK | NGX_CONF_TAKE1, /* location context and takes
                                            no arguments*/
         ngx_ziti, /* configuration setup function */
         0, /* No offset. Only one context is supported. */
         0, /* No offset when storing the module configuration on struct. */
         NULL},
//...
}
```

Each entry in the array `ngx_ziti_commands` specified the name of the configuration item, and the second section is a bit `OR`'ed set of flags that determines how the named configuration item is processed. The `ziti` directive is described as `NGX_MAIN_CONF| NGX_DIRECT_CONF | NGX_CONF_BLOCK | NGX_CONF_TAKE1`.

* `NGX_MAIN_CONF` declares that this item should be under the main or "root" configuration section
    
* `NGX_DIRECT_CONF` declares this item will only be in the main configuration file
    
* `NGX_CONF_BLOCK` declares that this item is expected to be a block (`{}`) that contains more configuration items
    
* `NGX_CONF_TAKE1` signifies that this item expects a single block
    

The value `ngx_ziti` is a function that is called when the `ziti` block items are encountered in the main/root configuration section. That function is responsible for handling any initialization needed as well as specifying its type via `cf->cmd_type = NGX_ZITI_CONF;`.

```c
static char *ngx_ziti(ngx_conf_t *cf, ngx_command_t *cmd, void *conf) {
    //...
    cf->cmd_type = NGX_ZITI_CONF;
    //...
}
```

For an item within the `ziti` block, the `NGX_ZITI_CONF` location is used. The `identity_file` configuration item is an example of this.

```c
        {ngx_string("identity_file"),
         NGX_ZITI_CONF | NGX_DIRECT_CONF | NGX_CONF_TAKE1,
         ngx_ziti_identity_file,
         0,
         0,
         NULL},
```

* `NGX_ZITI_CONF` declares that this item should be under the configuration block, `ziti`
    
* `NGX_DIRECT_CONF` declares this item will only be in the main configuration file
    
* `NGX_CONF_TAKE1` signifies that this item expects a single value
    

The process of declaring configuration items is repeated, specifying each configuration item's location, expected values, and callback.

## Threading Support

Threading support does not exist in Windows (as of writing 1/18/2023). I did not initially know this, and attempting to test on Windows proved very quick - as it would not compile.

Enabling threading support can significantly increase the performance of an NGINX deployment. It is possible for each module to detect if threading is enabled or not at compile time and output a helpful message to instruct the operator to use `--with-threads`. This can be included anywhere.

```c
#ifndef NGX_THREADS
#error ngx_ziti_module.c requires --with-threads
#endif /* NGX_THREADS */
```

Additionally, the following code is used to make use of threading:

```c
    //multiple adds are fine, they are cached by name
    tp = ngx_thread_pool_add(cf, &ngx_ziti_thread_pool_name);


    if (tp == NULL) {
        return NGX_CONF_ERROR;
    }
```

This code will handle scenarios where the platform supports threading, but threading has not been enabled. A thread pool named `ngx_ziti_tp` must be enabled in the NGINX configuration file with the following:

```nginx
thread_pool ngx_ziti_tp threads=32 max_queue=65536;
```

## Invoking the Ziti SDK

Before working on the `ngx_ziti_module` I had developed within the [Ziti C SDK](https://github.com/openziti/ziti-sdk-c), but I had not developed applications that made use of it beyond simple test applications. Between then and now, the SDK has become incredibly friendly to use. I was used to a lower-level API that required quite a bit of knowledge. I was prepared to get bloody cutting my hands on it.

However, my colleagues pointed me to the `Ziti_*` API functions in `ziti_lib.h`. I was pleasantly surprised by it. There was no blood this time from the Zit C SDK, but I still found way to weaponize my NGINX inexperience against myself.

To get started, the line `Ziti_lib_init();` must be invoked. Since child processes are at play, it has to be invoked in each process during process initialization. I had initially included the call during module initialization, but that occurs during configuration processing and within the NGINX main process. Meaning that each child process did not have an initialized library. The main NGINX process did, but the module code doesn't run there. My module effectively sat there doing nothing - no matter how hard I edited and saved my NGNIX configuration file. No matter how many times i stepped through the configuration parsing. Nothing was working! Not until I realized each child process has a life cycle that NGINX provides callbacks for.

Process initialization is done according to the module's `ngx_module_t` definition. Below you can see my module, `ngx_ziti_module`.

```c
ngx_module_t ngx_ziti_module = {
        NGX_MODULE_V1,
        &ngx_ziti_module_ctx, /* module context */
        ngx_ziti_commands, /* module directives */
        NGX_CORE_MODULE, /* module type */
        ngx_ziti_init_master, /* init master */
        ngx_ziti_init_module, /* init module */
        ngx_ziti_init_process, /* init process */
        ngx_ziti_init_thread, /* init thread */
        ngx_ziti_exit_thread, /* exit thread */
        ngx_ziti_exit_process, /* exit process */
        ngx_ziti_exit_master, /* exit master */
        NGX_MODULE_V1_PADDING
};
```

The process initialization callback is the seventh callback - where `ngx_ziti_init_process` is provided. This callback is triggered when a child process is started and is where the Ziti C SDK had to be initialized.

The callback, `ngx_ziti_init_process`, checks to see if the configuration had any `ziti` blocks defined. If so, it initializes the Ziti C SDK. Otherwise, it does not initialize it and saves some resources.

```c
static ngx_int_t ngx_ziti_init_process(ngx_cycle_t *cycle){
    ngx_ziti_debug(cycle->log, "enter: ngx_ziti_init_process");


    ngx_ziti_conf_t* ziti_conf = (ngx_ziti_conf_t*) ngx_get_conf(cycle->conf_ctx, ngx_ziti_module);

    if(ziti_conf->blocks->nelts > 0){
        Ziti_lib_init();
    } else {
        return NGX_OK;
    }
    //...
}
```

Further down, `ngx_initi_process` then checks for each `ziti` block's `identity_file` value and loads them.

```c
static ngx_int_t ngx_ziti_init_process(ngx_cycle_t *cycle){
    //...
    ngx_ziti_block_conf_t **blocks = ziti_conf->blocks->elts;

    for(ngx_uint_t i = 0; i < ziti_conf->blocks->nelts; i++) {
        ngx_ziti_block_conf_t* block = blocks[i];
        ngx_ziti_warn(cycle->log, "initializing block %s", block->name.data);
        ngx_str_t         identity_file_full_path;

        identity_file_full_path = block->identity_file;

        if (ngx_conf_full_name(cycle, &identity_file_full_path, 0) != NGX_OK) {
            return NGX_ERROR;
        }

        block->ztx = Ziti_load_context((char*)block->identity_file.data);
    //...
}
```

After all `ziti` blocks and `identity_file`s have been processed, we have a collection of `ztx` instances or "ziti contexts." Each `ztx` represents an OpenZiti identity that is connected to an OpenZiti network. We can use each `ztx` to either request connections to services or host services. The module aims to terminate services to a back-end legacy system - so we will be hosting services. Hosting services is done via the `Ziti_socket()`, `Ziti_bind()`, `Ziti_listen()` , and `Ziti_accept()` functions.

```c
    //create a socket
    server_socket = Ziti_socket(SOCK_STREAM);
    //error handling

    //use the socket to bind/host a specific service on specific ztx
    int err = Ziti_bind(server_socket, service_ctx->block->ztx, (char*)service_ctx->service.data, NULL);
    //error handling

    //start to listen
    err = Ziti_listen(server_socket, 64);
    //error handling

    do {
         //wait for new connections
         new_client = Ziti_accept(server_socket, new_client_name, sizeof(new_client_name));
        //...
```

After creating a socket, binding (hosting) a service, and starting to listen, the process will sit and wait for incoming connections. The thread blocks on `Ziti_accept` waiting for client connections. When a new connection is received, standard C socket programming is used to send/receive data and close sockets when necessary.

## Closing Remarks

NGINX module development has several startup hurdles. Attempting to search for answers to those questions was difficult. NGINX is so widely used that I would routinely only have search results filled with deployment/configuration articles rather than articles aimed at module developers. I made the most progress by reading the NGINX developer documentation and then reading the code while stepping through on a debugger. It wasn't always easy, but I triumphed in the end.

Overall I'm proud of the progress I made. My understanding of NGINX has been dramatically improved, and the addition of the `ziti_lib.h` `Ziti_*` API was a refreshing way to use the Ziti C SDK.