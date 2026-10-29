# The add-by-url lab, host side. capture.ps1 dot-sources this; see capture.ps1 for the contract.
# step 2: Keycloak on the IdP name, with the lab certificate, set up by kc-setup.sh as in 20-identity-provider.md
$Aliases = @("addbyurl.$D", "addbyurl-ctrl.$D", "addbyurl-router.$D")
$Kc = 'zac-screenshots-kc'
$KeycloakImage = 'quay.io/keycloak/keycloak:26.0'
$Sidecars = @($Kc)

function Start-Sidecars {
  C run -d --name $Kc --network $Net --network-alias "addbyurl-idp.$D" `
    -v "${Certs}:/certs:ro" -v "${FlowDir}:/flow:ro" `
    -e KC_BOOTSTRAP_ADMIN_USERNAME=admin -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin-demo-pw `
    -e KC_HTTPS_PORT=9780 -e KC_HTTPS_CERTIFICATE_FILE=/certs/fullchain.pem `
    -e KC_HTTPS_CERTIFICATE_KEY_FILE=/certs/privkey.pem -e "KC_HOSTNAME=https://addbyurl-idp.${D}:9780" `
    $KeycloakImage start-dev | Out-Null
  $deadline = (Get-Date).AddMinutes(3)
  while (-not ((C logs $Kc 2>&1) -match 'Running the server')) {
    if ((Get-Date) -gt $deadline) { C logs $Kc; throw 'keycloak did not start' }
    Start-Sleep -Seconds 3
  }
  C exec $Kc bash /flow/kc-setup.sh
}
