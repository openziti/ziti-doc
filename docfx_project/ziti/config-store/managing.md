## Managing Configurations
Here is a JSON schema, modeled on the tunneler client configuration. 

```json
{
  "$id": "http://myapp.company.com/schemas/myapp.v1.config.json",
  "additionalProperties": false,
  "properties": {
    "hostname": {
      "type": "string"
    },
    "port": {
      "maximum": 65535,
      "minimum": 0,
      "type": "integer"
    }
  },
  "required": [
    "hostname",
    "port"
  ],
  "type": "object"
}
```

Put the schema in a file named `example-config-type.json`, and you can create a configuration type named my-app with it. 

    $ ziti edge controller create config-type my-app --schema-file example-config-type.json 

You can now create a configuration of this type

    $ ziti edge controller create config ssh-client my-app '{ "hostname" : "ssh.company.com", "port" : 22 }'

Finally, you can reference this when creating a service.


   $ ziti edge controller create service ssh --configs ssh

If a particular site wanted SSH on a different port, you could create a different configuration

   $ ziti edge controller create config scranton-office-ssh-client my-app '{ "hostname" : "ssh.company.com", "port" : 2222 }'

The identity corresponding to a tunneler at that site could then be configured to use that configuration.

    $ ziti edge controller create identity service scranton-office

    $ ziti edge controller update identity-configs scranton-office ssh scranton-office-ssh-client

    $ ziti edge controller list identity service-configs scranton-office
    service: ssh    config: scranton-office-ssh-client
    results: 1-1 of 1

Overrides can be removed as well, if they are no longer needed.

    $ ziti edge controller update identity-configs scranton-office ssh scranton-office-ssh-client --remove

    $ ziti edge controller list identity service-configs scranton-office
    results: none