ziti edge create identity device kubeA.ziti.id -o /tmp/prometheus/kubeA.ziti.id.jwt -a "kubeA.services"

helm repo add netfoundry https://netfoundry.github.io/charts/
helm repo update
helm install ziti-host netfoundry/ziti-host --set-file enrollmentToken="/tmp/prometheus/kubeA.ziti.id.jwt"

kubectl get pods