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

data "terraform_remote_state" "controller_state" {
    backend = "local"
    config = {
        path = "${path.root}/../plan-controller/terraform.tfstate"
    }
}

provider "kubernetes" {
        config_path = "~/.kube/config"
        config_context = data.terraform_remote_state.controller_state.outputs.miniziti_profile
}

provider "helm" {
    kubernetes {
        config_path = "~/.kube/config"
        config_context = data.terraform_remote_state.controller_state.outputs.miniziti_profile
    }
}

resource "local_file" "ctrl_plane_cas" {
    filename = "../ctrl-plane-cas.crt"
    content = (data.terraform_remote_state.controller_state.outputs.ctrl_plane_cas).data["ctrl-plane-cas.crt"]
}

provider restapi {
    uri                   = "https://${data.terraform_remote_state.controller_state.outputs.ziti_controller_mgmt_external_host}:443/edge/management/v1"
    cacerts_string        = (data.terraform_remote_state.controller_state.outputs.ctrl_plane_cas).data["ctrl-plane-cas.crt"]
    ziti_username         = (data.terraform_remote_state.controller_state.outputs.ziti_admin_password).data["admin-user"]
    ziti_password         = (data.terraform_remote_state.controller_state.outputs.ziti_admin_password).data["admin-password"]
}

module "minirouter2" {
    source                    = "/home/kbingham/Sites/netfoundry/github/terraform-lke-ziti/modules/ziti-router-nginx"
    name                      = "minirouter2"
    namespace                 = data.terraform_remote_state.controller_state.outputs.miniziti_profile
    ctrl_endpoint             = "${data.terraform_remote_state.controller_state.outputs.ziti_controller_ctrl_internal_host}:443"
    edge_advertised_host      = "minirouter2.${data.terraform_remote_state.controller_state.outputs.dns_zone}"
    transport_advertised_host = "minirouter2-transport.${data.terraform_remote_state.controller_state.outputs.dns_zone}"
    ziti_charts               = var.ziti_charts
    router_properties         = {
        roleAttributes = [
            "public-routers"
        ]
    }
}

# find the id of the Router's tunnel identity so we can declare it in the next
# resource for import and ongoing PATCH management
data "restapi_object" "minirouter2_identity_lookup" {
    depends_on = [module.minirouter2]
    provider     = restapi
    path         = "/identities"
    search_key   = "name"
    search_value = "minirouter2"
}

resource "restapi_object" "minirouter2_identity" {
    depends_on         = [data.restapi_object.minirouter2_identity_lookup]
    provider           = restapi
    path               = "/identities"
    update_method      = "PATCH"
    data               = jsonencode({
        id             = jsondecode(data.restapi_object.minirouter2_identity_lookup.api_response).data.id
        roleAttributes = [
            "grafana-hosts"
        ]
    })
}

resource "helm_release" "prometheus" {
    chart         = "kube-prometheus-stack"
    repository    = "https://prometheus-community.github.io/helm-charts"
    name          = "prometheus-stack"
    # wait       = false  # hooks don't run if wait=true!?
    # set             {
    #     name      = "zitiServiceName"
    #     value     = "testapi-service"
    # }
}

module "testapi_service" {
    source                   = "/home/kbingham/Sites/netfoundry/github/terraform-lke-ziti/modules/simple-tunneled-service"
    upstream_address         = "prometheus-stack-grafana.default.svc"
    upstream_port            = 80
    intercept_address        = "minigrafana.ziti"
    intercept_port           = 80
    role_attributes          = ["monitoring-services"]
    name                     = "grafana"
}
