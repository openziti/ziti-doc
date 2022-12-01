To create a Service Policy using the CLI issue the following commands. (ensure you are [logged in](/docs/manage/cli-basics))

    # Create a service policy named 'my-policy' which allows all identities to dial/connect to all services 
    ziti edge create service-policy my-policy Dial --identity-roles '#all' --service-roles '#all'
