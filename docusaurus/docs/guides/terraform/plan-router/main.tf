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

data "terraform_remote_state" "controller_state" {
    backend = "local"
    config = {
        path = "${path.root}/../plan-controller/terraform.tfstate"
    }
}

provider "kubernetes" {
        # config_path = "~/.kube/config"
        # config_context = data.terraform_remote_state.controller_state.outputs.miniziti_profile
        config_path = "/tmp/haus11.yaml"
        config_context = "haus11"
}

provider "helm" {
    kubernetes {
        # config_path = "~/.kube/config"
        # config_context = data.terraform_remote_state.controller_state.outputs.miniziti_profile
        config_path = "/tmp/haus11.yaml"
        config_context = "haus11"
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

module "public_routers" {
    source       = "/home/kbingham/Sites/netfoundry/github/terraform-lke-ziti/modules/public-router-policies"
    router_roles = ["#public-routers"]
}

module "router" {
    source                    = "/home/kbingham/Sites/netfoundry/github/terraform-lke-ziti/modules/ziti-router-nginx"
    name                      = var.router_name
    namespace                 = data.terraform_remote_state.controller_state.outputs.miniziti_profile
    ctrl_endpoint             = "${data.terraform_remote_state.controller_state.outputs.ziti_controller_ctrl_internal_host}:443"
    edge_advertised_host      = "${var.router_name}.${data.terraform_remote_state.controller_state.outputs.dns_zone}"
    transport_advertised_host = "${var.router_name}-transport.${data.terraform_remote_state.controller_state.outputs.dns_zone}"
    ziti_charts               = var.ziti_charts
    router_properties         = {
        roleAttributes = [
            "public-routers"
        ]
    }
}

# find the id of the Router's tunnel identity so we can declare it in the next
# resource for import and ongoing PATCH management
data "restapi_object" "router_identity_lookup" {
    depends_on = [module.router]
    provider     = restapi
    path         = "/identities"
    search_key   = "name"
    search_value = var.router_name
}

resource "restapi_object" "router_identity" {
    depends_on         = [data.restapi_object.router_identity_lookup]
    provider           = restapi
    path               = "/identities"
    update_method      = "PATCH"
    data               = jsonencode({
        id             = jsondecode(data.restapi_object.router_identity_lookup.api_response).data.id
        roleAttributes = [
            "monitoring-hosts"
        ]
    })
}

resource "helm_release" "prometheus" {
    chart         = "kube-prometheus-stack"
    repository    = "https://prometheus-community.github.io/helm-charts"
    name          = "prometheus-stack"
    namespace     = "monitoring"
    create_namespace = true
    # wait       = false  # hooks don't run if wait=true!?
    set {
        name  = "grafana.adminPassword"
        value = var.monitoring_password
    }
}

resource "kubernetes_manifest" "ziti_service_monitor" {
    depends_on = [
        helm_release.prometheus
    ]
    manifest = {
        apiVersion = "monitoring.coreos.com/v1"
        kind = "ServiceMonitor"
        metadata = {
            labels = {
                team = "ziggy-ops"
                release = "prometheus-stack"
            }
            name = "ziti-monitor"
            namespace = "monitoring"
        }
        spec = {
            endpoints = [
                {
                    port = "prometheus"
                    interval = "30s"
                    scheme = "https"
                    tlsConfig = {
                        insecureSkipVerify = true
                    }
                },
            ]
            namespaceSelector = {
                matchNames = [
                    "ziti"
                ]
            }
            selector = {
                matchLabels = {
                    "prometheus.openziti.io/scrape" = "true"
                }
            }
        }
    }
}

module "grafana_service" {
    source                   = "/home/kbingham/Sites/netfoundry/github/terraform-lke-ziti/modules/simple-tunneled-service"
    upstream_address         = "prometheus-stack-grafana.monitoring.svc"
    upstream_port            = 80
    intercept_address        = "monitoring.${var.ziti_dns_zone}"
    intercept_port           = 80
    role_attributes          = ["monitoring-services"]
    name                     = "monitoring"
}

resource "restapi_object" "client_identity" {
    provider           = restapi
    path               = "/identities"
    data               = jsonencode({
        name           = "edge-client"
        type           = "Device"
        isAdmin        = false
        enrollment     = {
            ott        = true
        }
        roleAttributes = [
            "testapi-clients",
            "k8sapi-clients",
            "mgmt-clients",
            "monitoring-clients"
        ]
    })
}

resource "local_file" "client_identity_enrollment" {
    depends_on = [restapi_object.client_identity]
    content    = try(jsondecode(restapi_object.client_identity.api_response).data.enrollment.ott.jwt, "-")
    filename   = "../edge-client.jwt"
}

