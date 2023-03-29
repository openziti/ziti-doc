variable "dns_zone" {
    description = "The domain name zone that contains a wildcard record resolving to your load balancer"
    default = "ziti"
}

variable "miniziti_profile" {
    default = "miniziti"
}

variable "ziti_charts" {
    description = "Filesystem path to source OpenZiti Helm Charts instead of Helm repo"
    type = string
    default = ""
}

variable "controller_release" {
    default = "minicontroller"
}

variable "mgmt_domain_name" {
    default = "mgmt"
}

variable "install_controller" {
    description = "If true, install and manage the controller with TF, false not try to install but will delete the controller release and deployment if already imported in state"
    default = false
}