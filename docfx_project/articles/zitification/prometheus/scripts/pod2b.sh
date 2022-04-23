# create and enroll the identity.
ziti edge create identity user kubeB.prometheus.id \
  -o /tmp/prometheus/kubeB.prometheus.id.jwt \
  -a "reflectz-clients","prometheus-clients"
ziti edge enroll /tmp/prometheus/kubeB.prometheus.id.jwt -o /tmp/prometheus/kubeB.prometheus.id.json

# create the config and service for the kubeB prometheus server
ziti edge create config "kubeB.prometheus.svc-intercept.v1" intercept.v1 \
  '{"protocols":["tcp"],"addresses":["kubeB.prometheus.svc"],"portRanges":[{"low":80, "high":80}], "dialOptions": {"identity":"kubeB.prometheus.id"}}'


ziti edge create service "kubeB.prometheus.svc" \
  --configs "kubeB.prometheus.svc-intercept.v1"

# grant the prometheus clients the ability to dial the service and the kubeB.prometheus.id the ability to bind
ziti edge create service-policy "kubeB.prometheus.svc.dial" Dial \
  --service-roles "@kubeB.prometheus.svc" \
  --identity-roles "#prometheus-clients"
ziti edge create service-policy "kubeB.prometheus.svc.bind" Bind \
  --service-roles "@kubeB.prometheus.svc" \
  --identity-roles "@kubeB.prometheus.id"

# install prometheus
helm repo add openziti-test-kitchen https://openziti-test-kitchen.github.io/helm-charts/
helm repo update
helm install prometheuz openziti-test-kitchen/prometheus \
  --set-file configmapReload.ziti.id.contents="/tmp/prometheus/kubeB.prometheus.id.json" \
       --set configmapReload.ziti.targetService="kubeB.prometheus.svc" \
       --set configmapReload.ziti.targetIdentity="kubeB.prometheus.id" \
  --set-file server.ziti.id.contents="/tmp/prometheus/kubeB.prometheus.id.json" \
       --set server.ziti.service="kubeB.prometheus.svc" \
       --set server.ziti.identity="kubeB.prometheus.id" \
  --set-file server.scrape.id.contents="/tmp/prometheus/kubeB.prometheus.id.json"

kubectl get pods

echo "You should now be able to run a curl:"
echo "  curl http://kubeB.prometheus.svc:80"
echo " "
echo "now run:"
echo "  kubectl edit cm prometheuz-prometheus-server"
echo " "
echo "and add:"
echo " "
cat <<HERE
    - job_name: 'kubeB.reflectz'
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
          - 'kubeB.reflect.scrape.svc-kubeB.reflect.id'
HERE