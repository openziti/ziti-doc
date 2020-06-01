    # creates a new service named ssh
    ziti edge controller create service ssh

    # creates a new service named ssh with a terminator strategy which load-balances using random selection
    ziti edge controller create service ssh --terminator-strategy random

    # creates a router based terminator for ssh on router router1 which connects to the local machine
    ziti edge controller create terminator ssh router1 tcp:localhost:22
    
    # creates a new service named postgresql with a terminator strategy which does failover
    ziti edge controller create service postgresql --terminator-strategy ha

    # creates a router based terminator for postgres on router router1
    # this is the posgres primary, so precedence is set to required
    ziti edge controller create terminator postgresql router1 tcp:pg-primary:5432 --precedence required
    
    # creates a router based terminator for postgres on router router1 which connects to another machine
    # this is the posgresql secondary, so precedence is left at default
    ziti edge controller create terminator postgresql router1 tcp:pg-secondary:5432
    
    # If the primary goes down, the controller will notice that dials are failing and set the 
    # precedence to failed. New sessions will go to the secondary. When the primary is brought 
    # back up, it can be marked as requred again
    ziti edge controller update terminator <terminator-id> --precedence required 