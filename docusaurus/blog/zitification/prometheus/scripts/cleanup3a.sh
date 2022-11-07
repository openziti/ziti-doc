helm uninstall prometheuz

ziti edge delete service "kubeA.prometheus.svc"
ziti edge delete config "kubeA.prometheus.svc-intercept.v1"
ziti edge delete config "kubeA.prometheus.svc-host.v1"
ziti edge delete service-policy "kubeA.prometheus.svc.dial"
ziti edge delete service-policy "kubeA.prometheus.svc.bind"

ziti edge delete identity kubeA.prometheus.id
