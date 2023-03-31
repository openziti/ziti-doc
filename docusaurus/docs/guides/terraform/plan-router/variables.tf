variable "ziti_charts" {
    description = "Filesystem path to source OpenZiti Helm Charts instead of Helm repo"
    type = string
    default = ""
}

variable "router_name" {
    default = "minirouter"
}

variable "ziti_dns_zone" {
    default = "ziti"
}

variable "monitoring_password" {
    default = "prom-operator"
}

variable "image_repo" {
    description = "debug value for alternative container image repo"
    default = "openziti/ziti-router"
}

variable "image_tag" {
    description = "debug value for container image tag"
    default = ""
}