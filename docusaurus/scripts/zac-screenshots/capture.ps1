# Builds a lab network in containers, runs a flow through ZAC, and saves its screenshots in light and dark.
#   pwsh docusaurus/scripts/zac-screenshots/capture.ps1 -Flow add-by-url    # docker if its daemon answers, else wslc
#   pwsh docusaurus/scripts/zac-screenshots/capture.ps1 -Flow add-by-url -Runtime wslc -Themes light
# See README.md for what runs where.
#
# flows/<flow>/flow.ps1, if it exists, is dot-sourced here and may set:
#   $Aliases         more network aliases for the lab container (the controller's names)
#   $Sidecars        names of extra containers it starts, so they get removed
#   Start-Sidecars   a function that starts them on $Net before the lab container runs
param(
  [Parameter(Mandatory)][string]$Flow,
  [ValidateSet('auto', 'docker', 'wslc')][string]$Runtime = 'auto',
  # default: docusaurus/static/img/<flow>
  [string]$Out,
  [ValidateSet('light', 'dark')][string[]]$Themes = @('light', 'dark'),
  # leave the sidecars and the network up after the run, to debug a failure
  [switch]$Keep
)
$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $true

$FlowDir = Join-Path $PSScriptRoot "flows/$Flow"
if (-not (Test-Path (Join-Path $FlowDir 'flow.sh'))) {
  throw "no flow '$Flow'; flows: $((Get-ChildItem (Join-Path $PSScriptRoot 'flows') -Directory).Name -join ', ')"
}
if ($Runtime -eq 'auto') {
  $Runtime = if ((Get-Command docker -ErrorAction SilentlyContinue) -and
    $(& { $PSNativeCommandUseErrorActionPreference = $false; docker info *> $null; $LASTEXITCODE -eq 0 })) { 'docker' }
  elseif (Get-Command wslc -ErrorAction SilentlyContinue) { 'wslc' }
  else { throw 'no docker daemon and no wslc' }
}
function C { & $Runtime @args }

$D = 'zititv.demo.openziti.org'
$Image = 'zac-screenshots'
$Net = 'zac-screenshots'
$Lab = 'zac-screenshots-lab'
$Certs = Join-Path $PSScriptRoot '.work/certs'
$Logs = Join-Path $PSScriptRoot '.work/logs'
$Docs = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../docs'))
if (-not $Out) { $Out = Join-Path $PSScriptRoot "../../static/img/$Flow" }
$Out = [IO.Path]::GetFullPath($Out)

$Aliases = @()
$Sidecars = @()
$FlowPs1 = Join-Path $FlowDir 'flow.ps1'
if (Test-Path $FlowPs1) { . $FlowPs1 }

Remove-Item -Recurse -Force $Logs -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force $Certs, $Logs, $Out | Out-Null
Write-Host "flow: $Flow; runtime: $Runtime; shots: $Out; themes: $($Themes -join ', ')"

function Remove-Lab {
  $PSNativeCommandUseErrorActionPreference = $false
  foreach ($c in @($Sidecars) + $Lab) { C container remove -f $c *> $null }
  C network remove $Net *> $null
}

Remove-Lab
try {
  C build -t $Image $PSScriptRoot
  C network create $Net | Out-Null
  C run --rm -v "${Certs}:/certs" $Image bash /lab/lab.sh certs
  if (Get-Command Start-Sidecars -ErrorAction SilentlyContinue) { Start-Sidecars }

  # The SDK's OIDC callback binds [::1]; docker can turn IPv6 on, wslc can't (join scripts fall back to bind6.so).
  $Ipv6 = if ($Runtime -eq 'docker') { @('--sysctl', 'net.ipv6.conf.all.disable_ipv6=0') } else { @() }
  $AliasArgs = $Aliases | ForEach-Object { '--network-alias', $_ }
  C run --rm --name $Lab --network $Net @Ipv6 @AliasArgs `
    -v "${Certs}:/certs:ro" -v "${Docs}:/docs:ro" -v "${Out}:/out" -v "${Logs}:/logs" `
    $Image bash /lab/lab.sh run $Flow @Themes
  Get-ChildItem $Out -Filter '*.png' | Sort-Object Name | Format-Table Name, Length, LastWriteTime
}
finally {
  if (-not $Keep) { Remove-Lab }
}
