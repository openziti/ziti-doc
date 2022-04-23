# create and enroll the identity.
ziti edge create identity user kubeA.prometheus.id \
  -o /tmp/prometheus/kubeA.prometheus.id.jwt \
  -a "reflectz-clients","prometheus-clients"
ziti edge enroll /tmp/prometheus/kubeA.prometheus.id.jwt -o /tmp/prometheus/kubeA.prometheus.id.json

# create the config and service for the kubeA prometheus server
ziti edge create config "kubeA.prometheus.svc-intercept.v1" intercept.v1 \
  '{"protocols":["tcp"],"addresses":["kubeA.prometheus.svc"],"portRanges":[{"low":80, "high":80}]}'
ziti edge create config "kubeA.prometheus.svc-host.v1" host.v1 \
  '{"protocol":"tcp", "address":"prometheuz-prometheus-server","port":80}'
ziti edge create service "kubeA.prometheus.svc" \
  --configs "kubeA.prometheus.svc-intercept.v1","kubeA.prometheus.svc-host.v1"

# grant the prometheus clients the ability to dial the service and the kubeA.prometheus.id the ability to bind
ziti edge create service-policy "kubeA.prometheus.svc.dial" Dial \
  --service-roles "@kubeA.prometheus.svc" \
  --identity-roles "#prometheus-clients"
ziti edge create service-policy "kubeA.prometheus.svc.bind" Bind \
  --service-roles "@kubeA.prometheus.svc" \
  --identity-roles "@kubeA.ziti.id"

# install prometheus
helm repo add openziti-test-kitchen https://openziti-test-kitchen.github.io/helm-charts/
helm repo update
helm install prometheuz openziti-test-kitchen/prometheus \
  --set server.ziti.enabled="false" \
  --set-file server.scrape.id.contents="/tmp/prometheus/kubeA.prometheus.id.json"






kubectl get pods

echo "You should now be able to run a curl:"
echo "  curl http://kubeA.prometheus.svc:80"
echo " "
echo "now run:"
echo "  kubectl edit cm prometheuz-prometheus-server"
echo " "
echo "and add:"
echo " "
cat <<HERE
    - job_name: 'kubeA.reflectz'
      scrape_interval: 5s
      honor_labels: true
      scheme: 'ziti'
      params:
        'match[]':
          - '{job!=""}'
        'ziti-config':
          - '/etc/prometheus/scrape.json'
      static_configs:
        - targets:
          - 'kubeA.reflect.scrape.svc-kubeA.reflect.id'
HERE