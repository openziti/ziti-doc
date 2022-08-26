1. On the left side nav bar, click "Ziti Policies"
1. On the top nav bar, click "Service Policies"
1. In the top right corner of the screen click the "plus" image to add a new Service Policy
1. Choose a name for the Service Policy, such as "My Service Policy"
1. Select "Dial" or "Bind" in the Type dropdown
    1. Dial policies allow identities to use or connect to the service
    1. Bind policies allow identities to host or provide the service
1. Enter the services you want to include in the policy
    1. Specific services can be referenced by ID or name using `@`.  For example, a service called `ssh` can be referenced using `@ssh`. 
    1. Services can be referenced by role attribute using `#`. For example, any service which has the `sales` role attribute will be included if `#sales` is included in the service roles list.
1. Enter the identities you want to include in the policy
    1. Specific identities can be referenced by ID or name using `@`.  For example, as identity called `jsmith-desktop` can be referenced using `@jsmith-desktop`. 
    1. Identities can be referenced by role attribute using `#`. For example, any identity which has the `sales` role attribute will be included if `#sales` is included in the identities roles list.
1. Specify the role semantic
     1. If you select `Has Any Role` then if you specify multiple roles then all entities which include **any** of the roles will be included.
     1. If you select `Must Have All Roles`, then if you specify multiple roles then only entities which include **all** of the given roles will be included    
1. Click save
