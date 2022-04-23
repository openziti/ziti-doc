ziti edge create identity user kubeA.reflect.id -o /tmp/prometheus/kubeA.reflect.id.jwt
ziti edge enroll /tmp/prometheus/kubeA.reflect.id.jwt -o /tmp/prometheus/kubeA.reflect.id.json

# create intercept configs for the two services
ziti edge create config kubeA.reflect.svc-intercept.v1 intercept.v1 \
  '{"protocols":["tcp"],"addresses":["kubeA.reflect.svc.ziti"],"portRanges":[{"low":80, "high":80}]}'
ziti edge create config "kubeA.reflect.svc-intercept.v1.scrape" intercept.v1 \
  '{"protocols":["tcp"],"addresses":["kubeA.reflect.scrape.svc.ziti"], "portRanges":[{"low":80, "high":80}], "dialOptions":{"identity":"kubeA.reflect.id"}}'

# create the two services
ziti edge create service "kubeA.reflect.svc" --configs "kubeA.reflect.svc-intercept.v1" -a "kubeA.reflect.svc.services"
ziti edge create service "kubeA.reflect.scrape.svc" --configs "kubeA.reflect.svc-intercept.v1.scrape"

# create the bind service policies and authorize the reflect id to bind these services
ziti edge create service-policy "kubeA.reflect.svc.bind" Bind \
  --service-roles "@kubeA.reflect.svc" --identity-roles "@kubeA.reflect.id"
ziti edge create service-policy "kubeA.reflect.scrape.svc.bind" Bind \
  --service-roles "@kubeA.reflect.scrape.svc" --identity-roles "@kubeA.reflect.id"

# create the dial service policies and authorize the reflect id to bind these services
ziti edge create service-policy "kubeA.reflect.svc.dial" Dial \
  --service-roles "@kubeA.reflect.svc" --identity-roles "#reflectz-clients"
ziti edge create service-policy "kubeA.reflect.svc.dial.scrape" Dial \
  --service-roles "@kubeA.reflect.scrape.svc" --identity-roles "#reflectz-clients"

helm repo add openziti-test-kitchen https://openziti-test-kitchen.github.io/helm-charts/
helm repo update
helm install reflectz openziti-test-kitchen/reflect \
  --set-file reflectIdentity="/tmp/prometheus/kubeA.reflect.id.json" \
  --set serviceName="kubeA.reflect.svc" \
  --set prometheusServiceName="kubeA.reflect.scrape.svc"

kubectl get pods

# should work: nc kubeA.reflect.svc.ziti 80
# should work: nc kubeA.reflect.scrape.svc.ziti 80