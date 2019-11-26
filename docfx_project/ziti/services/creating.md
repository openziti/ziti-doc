## Creating a Service

Here's how you can create a service.

# [New non-hosted Service via UI](#tab/create-service-ui)

1. On the left side nav bar, click "Edge Services"
1. In the top right corner of the screen click the "plus" image to add a new service
1. Choose a name for the serivce. Example "my-first-service"
1. Enter a host name for the service. Enter "intercepted-hostname"
1. Enter the port you want intercepted: 1111
1. Choose Router by name - for example "ziti-gw01" if you are using [Ziti Edge - Developer
   Edition](https://aws.amazon.com/marketplace/pp/B07YZLKMLV)
1. For Endpoint Service choose:
    * protocol = tcp
    * host = actual-hostname
    * port = 2222
1. Select a cluster. If using [Ziti Edge - Developer Edition](https://aws.amazon.com/marketplace/pp/B07YZLKMLV) choose
   "demo-c01"
1. Leave Hosting Identities as is
1. Click save

# [New hosted Service via UI](#tab/create-hosted-service-ui)

1. On the left side nav bar, click "Edge Services"
1. In the top right corner of the screen click the "plus" image to add a new service
1. Choose a name for the serivce. Example "my-first-hosted-service"
1. Enter a host name for the service. Enter "intercepted-hostname"
1. Enter the port you want intercepted: 1111
1. Choose "Hosted (No Router)" for the Router
1. Select a cluster. If using [Ziti Edge - Developer Edition](https://aws.amazon.com/marketplace/pp/B07YZLKMLV) choose
   "demo-c01"
1. Select one or more identities in "Hosting Identities" representing the identities which host the service
1. Click save

# [New Service via CLI](#tab/create-service-cli)

To change the administrator password using the CLI simply issue these two commands:

[!include[](./create-service-cli.md)]

***
