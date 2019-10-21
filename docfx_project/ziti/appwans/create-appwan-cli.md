To create an AppWAN using the CLI issue the following commands. (ensure you are [logged in](../cli-snippets/login.md))

    #load the identity's id into an environment variable
    identity=$(ziti edge controller list identities | grep NewUser | cut -d " " -f2)

    #load the service id into an environment variable
    service=$(ziti edge controller list services | grep ethzero-cli | cut -d " " -f2)

    #update the admin user. This command will prompt you to enter the password
    ziti edge controller create app-wan my-first-cli-appwan -i $identity -s $service