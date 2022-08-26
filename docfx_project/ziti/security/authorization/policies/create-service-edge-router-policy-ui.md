1. On the left side nav bar, click "Ziti Policies"
1. On the top nav bar, click "Service Edge Router Policies"
1. In the top right corner of the screen click the "plus" image to add a new Service Edge Router Policy
1. Choose a name for the Service Edge Router Policy, such as "My Service Edge Router Policy"
1. Enter the services you want to include in the policy
    1. Specific services can be referenced by ID or name using `@`.  For example, a service called `ssh` can be referenced using `@ssh`. 
    1. Services can be referenced by role attribute using `#`. For example, any service which has the `sales` role attribute will be included if `#sales` is included in the service roles list.
1. Enter the services you want to include in the policy
    1. Specific services can be referenced by ID or name using `@`.  For example, a service called `ssh` can be referenced using `@ssh`. 
    1. Services can be referenced by role attribute using `#`. For example, any service which has the `sales` role attribute will be included if `#sales` is included in the service roles list.
1. Specify the role semantic
     1. If you select `Has Any Role` then if you specify multiple roles then all entities which include **any** of the roles will be included.
     1. If you select `Must Have All Roles`, then if you specify multiple roles then only entities which include **all** of the given roles will be included    
1. Click save
