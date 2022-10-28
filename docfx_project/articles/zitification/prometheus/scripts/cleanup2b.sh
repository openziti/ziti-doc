helm uninstall prometheuz

ziti edge delete service "kubeB.prometheus.svc"
ziti edge delete config "kubeB.prometheus.svc-intercept.v1"
ziti edge delete service-policy "kubeB.prometheus.svc.dial"
ziti edge delete service-policy "kubeB.prometheus.svc.bind"

ziti edge delete identity kubeB.prometheus.id
