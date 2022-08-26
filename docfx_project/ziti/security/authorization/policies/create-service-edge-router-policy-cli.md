To create a Service Edge Router Policy using the CLI issue the following commands. (ensure you are [logged in](../../../cli-snippets/login.md))

    # Create a service edge router policy which allows all services to use all edge routers 
    ziti edge create service-edger-router-policy 'my-policy' --service-roles '#all' --edge-router-roles '#all'
