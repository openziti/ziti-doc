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
            version = "~> 2.19"
        }
        restapi = {
            source = "qrkourier/restapi"
            version = "~> 1.23.0"
        }
    }
}

provider "kubernetes" {
        # config_path = "~/.kube/config"
        # config_context = var.miniziti_profile
        config_path = "/tmp/haus11.yaml"
        config_context = "haus11"
}

provider "helm" {
    kubernetes {
        # config_path = "~/.kube/config"
        # config_context = var.miniziti_profile
        config_path = "/tmp/haus11.yaml"
        config_context = "haus11"
    }
}

module "ziti_controller" {
    # depends_on       = [
    #     module.cert_manager, 
    #     helm_release.trust_manager, 
    #     helm_release.ingress_nginx
    # ]
    source = "/home/kbingham/Sites/netfoundry/github/terraform-lke-ziti/modules/ziti-controller-nginx"
    image_repo = var.image_repo
    admin_image_repo = var.admin_image_repo
    image_tag = var.image_tag
    ziti_charts = var.ziti_charts
    ziti_namespace = var.miniziti_profile
    ziti_controller_release = var.controller_release
    mgmt_domain_name = var.mgmt_domain_name
    dns_zone = var.dns_zone
    # intrall=true will install and manage the controller with TF, false not try
    # to install but will delete the controller release and deployment if
    # already imported in state
    install = var.install_controller
}
