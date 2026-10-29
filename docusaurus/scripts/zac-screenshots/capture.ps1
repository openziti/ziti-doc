# Builds the add-by-url lab in containers, does steps 3-8 through ZAC, and saves the ZAC screenshots.
#   pwsh docusaurus/scripts/zac-screenshots/capture.ps1    # docker if its daemon answers, else wslc
#   pwsh docusaurus/scripts/zac-screenshots/capture.ps1 -Runtime wslc -Themes light
# See README.md for what runs where.
param(
  [ValidateSet('auto', 'docker', 'wslc')][string]$Runtime = 'auto',
  [string]$Out = (Join-Path $PSScriptRoot '../../static/img/add-by-url'),
  [ValidateSet('light', 'dark')][string[]]$Themes = @('light', 'dark'),
  [string]$KeycloakImage = 'quay.io/keycloak/keycloak:26.0',
  # leave the Keycloak container and the network up after the run, to debug a failure
  [switch]$Keep
)
$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $true

if ($Runtime -eq 'auto') {
  $Runtime = if ((Get-Command docker -ErrorAction SilentlyContinue) -and
    $(docker info *> $null; $LASTEXITCODE -eq 0)) { 'docker' }
  elseif (Get-Command wslc -ErrorAction SilentlyContinue) { 'wslc' }
  else { throw 'no docker daemon and no wslc' }
}
function C { & $Runtime @args }

$D = 'zititv.demo.openziti.org'
$Image = 'zac-screenshots'
$Net = 'zac-screenshots'
$Kc = 'zac-screenshots-kc'
$Lab = 'zac-screenshots-lab'
$Certs = Join-Path $PSScriptRoot '.work/certs'
$Logs = Join-Path $PSScriptRoot '.work/logs'
$Out = [IO.Path]::GetFullPath($Out)
Remove-Item -Recurse -Force $Logs -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force $Certs, $Logs, $Out | Out-Null
Write-Host "runtime: $Runtime; shots: $Out; themes: $($Themes -join ', ')"

function Remove-Lab {
  $PSNativeCommandUseErrorActionPreference = $false
  foreach ($c in $Kc, $Lab) { C container remove -f $c *> $null }
  C network remove $Net *> $null
}

Remove-Lab
try {
  C build -t $Image $PSScriptRoot
  C network create $Net | Out-Null
  C run --rm -v "${Certs}:/certs" $Image bash /lab/lab.sh certs

  # step 2: Keycloak on the IdP name, with the lab certificate
  C run -d --name $Kc --network $Net --network-alias "addbyurl-idp.$D" `
    -v "${Certs}:/certs:ro" -v "${PSScriptRoot}:/lab:ro" `
    -e KC_BOOTSTRAP_ADMIN_USERNAME=admin -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin-demo-pw `
    -e KC_HTTPS_PORT=9780 -e KC_HTTPS_CERTIFICATE_FILE=/certs/fullchain.pem `
    -e KC_HTTPS_CERTIFICATE_KEY_FILE=/certs/privkey.pem -e "KC_HOSTNAME=https://addbyurl-idp.${D}:9780" `
    $KeycloakImage start-dev | Out-Null
  $deadline = (Get-Date).AddMinutes(3)
  while (-not ((C logs $Kc 2>&1) -match 'Running the server')) {
    if ((Get-Date) -gt $deadline) { C logs $Kc; throw 'keycloak did not start' }
    Start-Sleep -Seconds 3
  }
  C exec $Kc bash /lab/kc-setup.sh

  # steps 1 and 3-8: controller, router, ZAC, services, tunnelers and the browser, on the controller's names.
  # The SDK's OIDC callback binds [::1]; docker can turn IPv6 on, wslc can't (join.sh falls back to bind6.so).
  $Ipv6 = if ($Runtime -eq 'docker') { @('--sysctl', 'net.ipv6.conf.all.disable_ipv6=0') } else { @() }
  C run --rm --name $Lab --network $Net @Ipv6 `
    --network-alias "addbyurl.$D" --network-alias "addbyurl-ctrl.$D" --network-alias "addbyurl-router.$D" `
    -v "${Certs}:/certs:ro" -v "${Out}:/out" -v "${Logs}:/logs" `
    $Image bash /lab/lab.sh run @Themes
  Get-ChildItem $Out -Filter 'zac-*.png' | Sort-Object Name | Format-Table Name, Length, LastWriteTime
}
finally {
  if (-not $Keep) { Remove-Lab }
}
