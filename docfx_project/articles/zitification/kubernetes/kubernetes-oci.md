establish some variables just to make commands easier:

```bash
service_name=k8s.oci
the_user_identity="${service_name}".client
the_kubernetes_identity="${service_name}".private
oci_cluster_id=ocid1.cluster.oc1.iad.aaaaaaaaexhqpfgv6rl7dhq4jzgptiejxw7qksw3qyx62inq4cjw4arxuolq
```

# clean up if needed:

```bash
rm /tmp/oci/config.oci.public
rm /tmp/oci/config.oci.private
ziti edge delete identity "${the_kubernetes_identity}"
ziti edge delete identity "${the_user_identity}"
```

work done ahead of time - takes time to establish a cluster:
    * previously setup kubernetes in OKE
        * simple cluster
        * standard quick create cluster
        * public endpoint
        * Shape: VM.Standard2.2
        * 1 node
        * pasted my public key for access
        * exposed the cluster with public ip
    * already installed oci as well as helm
    * already deployed a ziti environment using https://github.com/openziti/ziti/blob/release-next/quickstart/aws.md

create kubernetes config files - public and private:

```bash
oci ce cluster create-kubeconfig \
    --cluster-id ${oci_cluster_id} \
    --file /tmp/oci/config.oci.public \
    --region us-ashburn-1 \
    --token-version 2.0.0 \
    --kube-endpoint PUBLIC_ENDPOINT
chmod 600 /tmp/oci/config.oci.public
    
oci ce cluster create-kubeconfig \
    --cluster-id ${oci_cluster_id} \
    --file /tmp/oci/config.oci.private \
    --region us-ashburn-1 \
    --token-version 2.0.0 \
    --kube-endpoint PRIVATE_ENDPOINT
chmod 600 /tmp/oci/config.oci.private
```

delete any resources if needed:

```bash
export KUBECONFIG=/tmp/oci/config.oci.public
helm uninstall ziti-host
kubectl delete persistentvolume ziti-host-pv
```

show it working via public ip from wsl:
wsl:

```bash
export KUBECONFIG=/tmp/oci/config.oci.public
kubectl get pods -v7 --request-timeout='5s'
```

show it failing via private ip from wsl:

```bash
export KUBECONFIG=/tmp/oci/config.oci.private
kubectl get pods -v7 --request-timeout='2s'
```
let's install ziti in the cluster:

make a new identity:

```bash 
ziti edge create identity device "${the_kubernetes_identity}" -a "${service_name}"ServerEndpoints -o "${the_kubernetes_identity}".jwt
ziti edge create identity device "${the_user_identity}" -a "${service_name}"ClientEndpoints -o "${the_user_identity}".jwt
```

add the identity to the cluster (using the public ip):

```bash
helm repo add netfoundry https://netfoundry.github.io/charts/
```

create the config file to apply
```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: ziti-host-pv
  labels:
    type: local
spec:
  storageClassName: oci
  capacity:
    storage: 100Mi
  accessModes:
    - ReadWriteMany
  hostPath:
    path: "/netfoundry"
```

kubectl apply the config:
```bash
export KUBECONFIG=/tmp/oci/config.oci.public
kubectl apply -f add-persistent-claims.yaml 
helm install ziti-host netfoundry/ziti-host --set-file enrollmentToken=k8s.private.jwt
```

verify the ziti identity was bootstrapped by using kubectl logs

```bash
kubectl logs ziti-host<tab><enter>
```
---

now go disable the public ip so private access ONLY works... this takes "a minute or two or three"...

---

let's setup the ziti bits we need

setup ziti to access the private server address... 
set environment variables to make it easier to reference:

```bash
export KUBECONFIG=/tmp/oci/config.oci.private
k8s_private_host_and_port=$(kubectl config view | grep server | cut -d "/" -f3)
k8s_private_host=$(echo ${k8s_private_host_and_port} | cut -d ":" -f1)
k8s_private_port=$(echo ${k8s_private_host_and_port} | cut -d ":" -f2)
echo "Private URL: ${k8s_private_host_and_port}, Host: ${k8s_private_host}, Port: ${k8s_private_port}"
```

ziti setup:
```bash
k8s_private_dns=kubernetes

ziti edge delete config "${service_name}"-host.v1
ziti edge delete config "${service_name}"-client-config
ziti edge delete service "${service_name}"
ziti edge delete service-policy "${service_name}"-binding
ziti edge delete service-policy "${service_name}"-dialing

ziti edge create config "${service_name}"-host.v1 host.v1 '{"protocol":"tcp", "address":"'${k8s_private_host}'","port":'${k8s_private_port}' }'
ziti edge create config "${service_name}"-client-config intercept.v1 '{"protocols":["tcp"],"addresses":["'${k8s_private_host}'","'${k8s_private_dns}'"], "portRanges":[{"low":443, "high":443}]}'
ziti edge create service "${service_name}" --configs "${service_name}"-client-config,"${service_name}"-host.v1
ziti edge create service-policy "${service_name}"-binding Bind --service-roles '@'"${service_name}" --identity-roles '#'"${service_name}"'ServerEndpoints'
ziti edge create service-policy "${service_name}"-dialing Dial --service-roles '@'"${service_name}" --identity-roles '#'"${service_name}"'ClientEndpoints'
```

verify windows can access the kubernetes api (using wsl for ease):

```bash
cmd.exe /c curl -k "https://${k8s_private_dns}"
cmd.exe /c curl -k "https://${k8s_private_host}"    
```
at this point from wsl kubectl will work using the ip address - but not dns

```bash
    zConfig: /mnt/v/temp/oci/oci.json
    service: k8s.oci
```

use "kubeztl":

download from github:
DONOTCOMMIT: 
ln -s /mnt/c/Windows/system32/config/systemprofile/AppData/Roaming/NetFoundry
/aa63dfc0aa33a4a23b2e697dddbcf895435f7b90.json id.json

```bash
curl -L -o kubeztl https://github.com/openziti-incubator/kubectl/releases/download/v0.0.4/kubectl-linux-amd64
./kubeztl get pods -c ./id.json -S "${service_name}"
```
modify config if you want:
    find your context, add two lines:

```bash
    zConfig: /mnt/v/temp/oci/oci.json
    service: k8s.oci
```

useful if you need to update either of the identities...
``bash
    ziti edge update identity "${the_user_identity}" -a "${service_name}"ClientEndpoints
    ziti edge update identity "${the_kubernetes_identity}" -a "${service_name}"ServerEndpoints
```





