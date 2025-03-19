---
sidebar_label: Console
sidebar_position: 40
---

import Wizardly from '@site/src/components/Wizardly';

# Console Configuration

## Alternative Server Certificates

At the time of writing the ZAC is deployed as part of the controller, which is the likely direction of travel
for the future.

As mentioned in the [identity](conventions.md#identity) section of the Conventions reference document, you can
use externally provided certificates from public CAs like Let's Encrypt and associate them with the controller
config in order to present valid certificates for the ZAC single page application.

The `alt_server_certs` configuration key is an array of certificate information, so the first-matched server
certificate is presented to the TLS client (in this case, a browser).

## Short Steps to achieve valid certificates:

1. Configure a DNS address for the IP of your server
1. Install [Certbot](https://certbot.eff.org/instructions)
1. Create a DNS access token for your given DNS provider
1. Generate the certificates and validate via the
[CertBot DNS Plugins](https://eff-certbot.readthedocs.io/en/latest/using.html#dns-plugins)
1. Alter the controller configuration as per the detailed example below (altering the paths if necessary)

At this point, the file watcher should automatically see the configuration change, and restart the controller
service.

## Further details:

### Creating a DNS Record

Before generating an SSL certificate, ensure you have a valid DNS record pointing to the public IP address of
your server. This can be done through your DNS provider’s control panel, dashboard, or directly via a domain
registrar.

Ensure you wait for DNS propagation to complete before attempting ACME DNS-based challenge.

This may take a few minutes to a few hours, but you can use tools like [whatsmydns](https://whatsmydns.com/)
to track the progress on the propagation.

### Install Let’s Encrypt CertBot

General instructions for this can be found by visiting the
[Let's Encrypt Documentation](https://letsencrypt.org/docs/), and  also by reviewing the documentation of
[Certbot](https://certbot.eff.org/instructions). These documents go into detail about various bespoke
configuratons so you can choose the right one for your scenario.

A simple way to satisfy the DNS-based challenge from Let's Encrypt is to use the Certbot DNS plugin.
[CertBot DNS Plugins](https://eff-certbot.readthedocs.io/en/latest/using.html#dns-plugins).

These are specific to DNS providers, but you can see an example of how they should be used in
[this tutorial](https://www.digitalocean.com/community/tutorials/how-to-create-let-s-encrypt-wildcard-certificates-with-certbot)

### Configure DNS Provider Authentication

CertBot requires access to your DNS provider’s API to perform DNS-based domain validation. This is because
it provisions a TXT resource in the domain, as per [RFC8555](https://datatracker.ietf.org/doc/html/rfc8555#section-8.4).
For this you will need to look up how to create the token from your DNS provider.

Other mechanisms of satifying the challenge are available. However, this method allows for better automation.

Again, read the documentation from [CertBot DNS Plugins](https://eff-certbot.readthedocs.io/en/latest/using.html#dns-plugins)
to determine how to configure this correctly for your setup.

### Obtain an SSL Certificate

Once all the above is correct, you can run CertBot using the DNS-based challenge. The following command demonstrates the principle.
You should change the dns provider specific arguments to match your scenario.

```bash
sudo certbot certonly \
  --dns-digitalocean \
  --dns-digitalocean-credentials ~/certbot-creds.ini \
  -d <YOUR_DOMAIN_NAME>
```

If all goes well, this request will generate an SSL certificate for your domain, which by default
will be stored in `/etc/letsencrypt/live/<YOUR_DOMAIN_NAME>/`

### Configure and Restart Services

You can update the controller service configuration to use the newly generated certificates.

This is done by changing the `alt_server_certs` information in the controller configuration here: `$ZITI_HOME/$(hostname -s).yaml`

Change the content of the file so that it points these keys to the newly created certificates:

```yaml
web:
  - name: client-management
    identity:
      ...
      alt_server_certs:
      - server_cert: "/etc/letsencrypt/live/<YOUR_DOMAIN_NAME>/fullchain.pem"
        server_key:  "/etc/letsencrypt/live/<YOUR_DOMAIN_NAME>/privkey.pem"
```

<Wizardly></Wizardly>
