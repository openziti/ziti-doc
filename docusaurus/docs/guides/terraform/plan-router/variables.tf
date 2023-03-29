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

