curl -s https://raw.githubusercontent.com/openziti/ziti-doc/main/docfx_project/blog/zitification/prometheus/scripts/local.prometheus.yml > /tmp/prometheus/prometheus.config.yml

ziti edge create identity user local.prometheus.id -o /tmp/prometheus/local.prometheus.id.jwt -a "reflectz-clients","prometheus-clients"
ziti edge enroll /tmp/prometheus/local.prometheus.id.jwt -o /tmp/prometheus/local.prometheus.id.json

# create the config and service for the local prometheus server
ziti edge create config "local.prometheus.svc-intercept.v1" intercept.v1 \
  '{"protocols":["tcp"],"addresses":["local.prometheus.svc"],"portRanges":[{"low":80, "high":80}], "dialOptions": {"identity":"local.prometheus.id"}}'

ziti edge create service "local.prometheus.svc" \
  --configs "local.prometheus.svc-intercept.v1"

# grant the prometheus clients the ability to dial the service and the local.prometheus.id the ability to bind
ziti edge create service-policy "local.prometheus.svc.dial" Dial \
  --service-roles "@local.prometheus.svc" \
  --identity-roles "#prometheus-clients"
ziti edge create service-policy "local.prometheus.svc.bind" Bind \
  --service-roles "@local.prometheus.svc" \
  --identity-roles "@local.prometheus.id"


docker run \
  -v /tmp/prometheus/local.prometheus.id.json:/etc/prometheus/ziti.id.json \
  -v /tmp/prometheus/prometheus.config.yml:/etc/prometheus/prometheus.yml \
  -p 9090:9090 \
  openziti/prometheuz


docker run \
    -e ZITI_LISTENER_SERVICE_NAME=local.prometheus.svc \
    -e ZITI_LISTENER_IDENTITY_FILE=/etc/prometheus/ziti.server.json \
    -e ZITI_LISTENER_IDENTITY_NAME=local.prometheus.id \
    -v /tmp/prometheus/prometheus.config.yml:/etc/prometheus/prometheus.yml \
    -v /tmp/prometheus/local.prometheus.id.json:/etc/prometheus/ziti.id.json \
    -v /tmp/prometheus/local.prometheus.id.json:/etc/prometheus/ziti.server.json \
    openziti/prometheuz


