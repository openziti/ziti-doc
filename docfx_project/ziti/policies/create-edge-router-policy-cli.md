To create an Edge Router Policy using the CLI issue the following commands. (ensure you are [logged in](../cli-snippets/login.md))

    # Create an edge router policy named 'my-policy' which allows all identities to use all edge-routers 
    ziti edge create edge-router-policy my-policy --identity-roles '#all' --edge-router-roles '#all'
