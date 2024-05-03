# Prometheus Endpoint

The controller can expose a `/metrics` endpoint that serves network metrics in the Prometheus [text exposition format](https://prometheus.io/docs/instrumenting/exposition_formats/#text-based-format). 

The endpoint is exposed over HTTPS, and has optional support for client authentication via a certificate.

## Ziti Configuration

The Prometheus metric binding is configured as part of the controller configuration file.

### Binding

The Prometheus metrics api is not bound to any interface by default. The metrics api can be bound to the same network interface and port as the other Ziti APIs, or it can be set up on its own interface and/or port.   

#### Listener Just for Metrics

The metric api can be configured to listen on its own combination of network interface and port by adding a new section under the `web` configuration

```text
web
  # Binding for other Ziti APIs
  - name: apis
    bindPoints:
      - interface: 0.0.0.0:1280
        address: 0.0.0.0:1280
    options:
      idleTimeout: 5000ms  #http timeouts, new
      readTimeout: 5000ms
      writeTimeout: 100000ms
    apis:
      # binding - required
      # Specifies an API to bind to this webListener. Built-in APIs are
      #   - health-checks
      #   - edge-management
      #   - edge-client
      #   - fabric-management
      #   - metrics
      - binding: health-checks
        options: { }
      - binding: fabric
      - binding: edge-management
        # options - variable optional/required
        # This section is used to define values that are specified by the API they are associated with.
        # These settings are per API. The example below is for the `edge-api` and contains both optional values and
        # required values.
        options: { }
      - binding: edge-client
        options: { }

  # New binding for metrics
  - name: apis-metrics-localhost
    bindPoints:
      #interface - required
      # A host:port string on which network interface to listen on. 0.0.0.0 will listen on all interfaces
      - interface: 127.0.0.1:2112

        # address - required
        # The public address that external incoming requests will be able to resolve. Used in request processing and
        # response content that requires full host:port/path addresses.
        address: 127.0.0.1:2112
    options:
    apis:
      - binding: metrics
        options: { }
```

#### Add Metrics API to an Existing Listener

The metrics binding can be added to an existing listener in the controller. 

```text
web
  -name: apis
   bindpoints:
   apis: 
      - binding: health-checks
        options: { }
      - binding: fabric
      - binding: edge-management
        options: { }
      - binding: edge-client
        options: { }
      - binding: metrics
        options: { }
```

### Authentication

Authentication is done by adding a client certificate to the metrics binding.  The metrics endpoint will return a 401 if this certificate is not presented by clients when they connect.

The certificate is completely stand-alone - it does not need to be signed by Ziti.

The configuration is added as an option in the metrics binding.  The file must be an x509 certificate. 

```text
     - binding: metrics
        options: {
          scrapeCert: "/etc/prometheus/prom-client.crt"
        }
```

### Timestamps

OpenZiti can export timestamps in the Prometheus metrics. These timestamps can be helpful to align metrics with application logs if there is any clock skew across the OpenZiti network.

Timestamps are disabled by default, and can be enabled by setting a the `includeTimestamps` option to `true` in the metrics binding:

```text
web
  -name: apis
   bindpoints:
   apis:
      - binding: health-checks
        options: { }
      - binding: fabric
      - binding: edge-management
        options: { }
      - binding: edge-client
        options: { }
      - binding: metrics
        options: {
          includeTimestamps: true
        }
```

:::note
Prometheus will silently discard metrics that are older than five minutes.
:::

### Prometheus Configuration

#### TLS Configuration

The `/metrics` api requires TLS configuration in Prometheus. The Prometheus scrape config must have the ziti web public key, or be configured to ignore private keys.

```text
  - job_name: ziti
    scheme: https
    metrics_path: /metrics
    honor_labels: true
    honor_timestamps: true
    tls_config:
      // Path to the cert file with the ziti public key
      ca_file: /etc/prometheus/server.crt
      // OR ignore the key 
      insecure_skip_verify: true
    static_configs:
      - targets:
        - '127.0.0.1:2112'
```

#### With Authentication

It's a good idea to have metrics protected by a certificate to prevent nefarious actors from pulling metrics about your network.  The Prometheus scrape configuration can be configured with a keystore for this purpose:

```text
 - job_name: ziti
    scheme: https
    metrics_path: /metrics
    honor_labels: true
    honor_timestamps: true
    tls_config:
      cert_file: /etc/prometheus/prom-client.crt
      key_file: /etc/prometheus/prom-client.key
      ca_file: /etc/prometheus/server.crt
    static_configs:
      - targets:
        - '127.0.0.1:2112'

```

## Examples

### Setup Metrics Authentication

In this example you will:

1. Create a new cert and signing request
1. Sign the key
1. Add the key into your controller configuration
1. Add the key to your prometheus scrape config

#### Create a cert for metric scraping

```text
# Create the certificate and signing request
openssl req  -new  -newkey rsa:2048  -nodes  -keyout prom-client.key  -out prom-client.csr

# Process the cert signing signing request.  This cert will be good for 10 years.
openssl  x509  -req  -days 3650 -in /tmp/prom-client.csr  -signkey prom-client.key  -out prom-client.crt 
```

#### Add the Cert to Ziti

Open your ziti configuration file and set up the metrics api binding as shown in the `Authentication` section above. 

Some common things to watch out for:

* The controller will need to be restarted after editing the configuration file

Best practices is to use a separate metrics listener that is only accessible from Prometheus.  This configuration will expose the `metrics/` on the loopback address, port 2112.

Add this text to the `web` section of your network controller configuration file

```text
  - name: metrics-localhost
    bindPoints:
      - interface: 127.0.0.1:2112
        address: 127.0.0.1:2112
    apis:
      - binding: metrics
        options: {
          scrapeCert: "/path/to/prom-client.crt"
        }

```

#### Test the Key

I use `curl` to test my keys when I set up metrics.  If Ziti is configured to bind metrics to `127.0.0.1:2112` then curl command will be:

```text
curl -i -k --cert /path/to/prom-client.crt --key /path/to/prom-client.key https://127.0.0.1:2112/metrics
```

The options to the curl command mean:

* **-i:** Print the http status code and response headers
* **-k:** Ziti uses a self-signed cert, this option tells curl to ignore the server certificate
* **--cert:** The path to the prom-client.crt created above
* **--key:** The path to prom-client.key created above

The result should spit out a bunch of metrics.   If you see a `401` response then double-check that you've copied all of the bits from the certificate into the controller configuration file.

#### Add the Key to Prometheus

The key is added to Prometheus by referencing the crt and key files from the Ziti scrape configuration. 

Your scrape config will look something like this:

```text
global:
  scrape_interval: 10s
  scrape_timeout: 10s

rule_files:
  - alert.yml

scrape_configs:
  - job_name: self
    metrics_path: /metrics
    static_configs:
      - targets:
        - 'prometheus:9090'

  - job_name: ziti
    scheme: https
    metrics_path: /metrics
    honor_labels: true # Ziti supplies system labels for the edge routers, so we need to obey them
    honor_timestamps: true # Honor server timestamps instead of using the scrape timestamp for metrics
    tls_config:
      cert_file: /path/to/prom-client.crt
      key_file: /path/to/prom-client.key
      insecure_skip_verify: true
    static_configs:
      - targets:
        - '127.0.0.1:2112'
```
