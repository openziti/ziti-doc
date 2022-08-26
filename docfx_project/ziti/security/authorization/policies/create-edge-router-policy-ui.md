1. On the left side nav bar, click "Ziti Policies"
1. It should already be selected, but if not, on the top nav bar, click "Edge Router Policies"
1. In the top right corner of the screen click the "plus" image to add a new Edge Router Policy
1. Choose a name for the Edge Router Policy, such as "My Edge Router Policy"
1. Enter the edge routers you want to include in the policy
    1. Specific edge routers can be referenced by ID or name using `@`.  For example, an edge router called `us-east-4` can be referenced using `@us-east-4`. 
    1. Edge routers can be referenced by role attribute using `#`. For example, any edge router which has the `us-seast` role attribute will be included if `#us-east` is included in the edge routers roles list.
1. Enter the identities you want to include in the policy
    1. Specific identities can be referenced by ID or name using `@`.  For example, as identity called `jsmith-desktop` can be referenced using `@jsmith-desktop`. 
    1. Identities can be referenced by role attribute using `#`. For example, any identity which has the `sales` role attribute will be included if `#sales` is included in the identities roles list.
1. Specify the role semantic
     1. If you select `Has Any Role` then if you specify multiple roles then all entities which include **any** of the roles will be included.
     1. If you select `Must Have All Roles`, then if you specify multiple roles then only entities which include **all** of the given roles will be included    
1. Click save
