terraform {
    backend "local" {}
    # If you want to save state in Terraform Cloud:
    # Configure these env vars, uncomment cloud {} 
    # and comment out backend "local" {}
    #   TF_CLOUD_ORGANIZATION
    #   TF_WORKSPACE
    # cloud {}
    required_providers {
        # local = {
        #     version = "~> 2.1"
        # }
        helm = {
            source  = "hashicorp/helm"
            version = "2.5.0"
        }
        kubernetes = {
            source  = "hashicorp/kubernetes"
            version = "2.0.1"
        }
        restapi = {
            source = "qrkourier/restapi"
            version = "~> 1.23.0"
        }
    }
}

provider "kubernetes" {
        config_path = "~/.kube/config"
        config_context = var.miniziti_profile
}

provider "helm" {
    kubernetes {
        config_path = "~/.kube/config"
        config_context = var.miniziti_profile
    }
}

module "ziti_controller" {
    # depends_on       = [
    #     module.cert_manager, 
    #     helm_release.trust_manager, 
    #     helm_release.ingress_nginx
    # ]
    source = "/home/kbingham/Sites/netfoundry/github/terraform-lke-ziti/modules/ziti-controller-nginx"
    ziti_charts = var.ziti_charts
    ziti_namespace = var.miniziti_profile
    ziti_controller_release = "minicontroller"
    mgmt_domain_name = "minicontroller"
    dns_zone = var.dns_zone
    install = false  # only read controller info
}
