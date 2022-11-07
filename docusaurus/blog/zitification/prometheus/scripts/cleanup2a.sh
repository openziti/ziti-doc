helm uninstall reflectz

ziti edge delete config kubeA.reflect.svc-intercept.v1
ziti edge delete config "kubeA.reflect.svc-intercept.v1.scrape"
ziti edge delete service "kubeA.reflect.svc"
ziti edge delete service "kubeA.reflect.scrape.svc"
ziti edge delete service-policy "kubeA.reflect.svc.bind"
ziti edge delete service-policy "kubeA.reflect.scrape.svc.bind"
ziti edge delete service-policy "kubeA.reflect.svc.dial"
ziti edge delete service-policy "kubeA.reflect.svc.dial.scrape"

ziti edge delete identity kubeA.reflect.id
