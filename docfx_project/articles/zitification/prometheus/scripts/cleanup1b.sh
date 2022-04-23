helm uninstall reflectz

ziti edge delete config kubeB.reflect.svc-intercept.v1
ziti edge delete config "kubeB.reflect.svc-intercept.v1.scrape"
ziti edge delete service "kubeB.reflect.svc"
ziti edge delete service "kubeB.reflect.scrape.svc"
ziti edge delete service-policy "kubeB.reflect.svc.bind"
ziti edge delete service-policy "kubeB.reflect.scrape.svc.bind"
ziti edge delete service-policy "kubeB.reflect.svc.dial"
ziti edge delete service-policy "kubeB.reflect.svc.dial.scrape"

ziti edge delete identity kubeB.reflect.id
