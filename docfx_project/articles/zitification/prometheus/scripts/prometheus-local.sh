ziti edge create identity user local.prometheus.id -o /tmp/prometheus/local.prometheus.id.jwt -a "reflectz-clients","prometheus-clients"
ziti edge enroll /tmp/prometheus/local.prometheus.id.jwt -o /tmp/prometheus/local.prometheus.id.json

docker run \
  -v /tmp/prometheus/local.prometheus.id.json:/etc/prometheus/ziti.id.json \
  -v /mnt/v/temp/prometheus.scraper.yml:/etc/prometheus/prometheus.yml \
  -p 9090:9090 \
  openziti/prometheuz


