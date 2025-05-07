# PowerShell version of gendoc.sh

function Clone-Or-Pull {
    param (
        [string]$remote,
        [string]$dir,
        [string]$branch = "main"
    )
    
    $dirPath = "${env:ZITI_DOC_GIT_LOC}\$dir"

    if (Test-Path $dirPath) {
        Set-Location $dirPath
        git checkout $branch
        git pull --ff-only
        Set-Location -Path $scriptRoot
    } else {
        git clone $remote --branch $branch --single-branch $dirPath --depth 1
    }
}

function Fix-HelmZitiEdgeTunnel {
    $target = "${env:ZITI_DOC_GIT_LOC}\helm-charts\charts\ziti-edge-tunnel\README.md"
    Write-Host "Fixing $target to work with Docusaurus"
    (Get-Content $target) | ForEach-Object {
        $_ -replace "<https://openziti.io>", "&lt;https://openziti.io&gt;" `
           -replace "<https://github.com/openziti/ziti-tunnel-sdk-c>", "&lt;https://github.com/openziti/ziti-tunnel-sdk-c&gt;" `
           -replace 'sresponse\\\\s<|>\$', 'sresponse\\\\s\&lt;|>\$'
    } | Set-Content $target
}

# Main script starts here

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "Script root: $scriptRoot"

$env:SKIP_GIT = "no"
$env:SKIP_LINKED_DOC = "no"
$env:SKIP_CLEAN = "no"
$env:ZITI_DOC_GIT_LOC = "$scriptRoot\docusaurus\_remotes"
$env:SDK_ROOT_TARGET = "$scriptRoot\docusaurus\static\docs\reference\developer\sdk"
$env:ZITI_DOCUSAURUS = "yes"
$env:SKIP_DOCUSAURUS_GEN = "no"

Write-Host "Processing options"

$opts = Get-CommandLineArgs
foreach ($opt in $opts) {
    switch ($opt) {
        "g" { $env:SKIP_GIT = "yes"; Write-Host "Skipping Git" }
        "l" { $env:SKIP_LINKED_DOC = "yes"; Write-Host "Skipping linked doc generation" }
        "c" { $env:SKIP_CLEAN = "yes"; Write-Host "Skipping clean step" }
        "s" { $env:ADD_STARGAZER_DATA = "yes"; Write-Host "Fetching stargazer data" }
        "d" { $env:SKIP_DOCUSAURUS_GEN = "yes"; Write-Host "Skipping Docusaurus generation" }
        default { Write-Host "Ignoring unknown option $opt" }
    }
}

Write-Host "Done processing options"

if ($env:SKIP_GIT -eq "no") {
    Write-Host "Updating dependencies"
    New-Item -ItemType Directory -Force -Path $env:ZITI_DOC_GIT_LOC
    if ($env:SKIP_CLEAN -eq "no") {
        Remove-Item "$env:ZITI_DOC_GIT_LOC\ziti-*" -Recurse -Force
    }

    git config --global --add safe.directory (Get-Location)

    Clone-Or-Pull "https://github.com/openziti/ziti" "ziti-cmd"
    Clone-Or-Pull "https://github.com/openziti/ziti-sdk-csharp" "ziti-sdk-csharp"
    Clone-Or-Pull "https://github.com/openziti/ziti-sdk-c" "ziti-sdk-c"
    Clone-Or-Pull "https://github.com/openziti/ziti-android-app" "ziti-android-app"
    Clone-Or-Pull "https://github.com/openziti/ziti-sdk-swift" "ziti-sdk-swift"
    Clone-Or-Pull "https://github.com/openziti/ziti-tunnel-sdk-c" "ziti-tunnel-sdk-c"
    Clone-Or-Pull "https://github.com/openziti/helm-charts" "helm-charts"
    Clone-Or-Pull "https://github.com/openziti-test-kitchen/kubeztl" "kubeztl"
    Clone-Or-Pull "https://github.com/openziti/desktop-edge-win" "desktop-edge-win"

    Fix-HelmZitiEdgeTunnel
}

if ($env:SKIP_CLEAN -eq "no") {
    if (Test-Path $env:SDK_ROOT_TARGET) {
        Write-Host "Removing previous build"
        Remove-Item $env:SDK_ROOT_TARGET -Recurse -Force
    }
}

if ($env:SKIP_LINKED_DOC -eq "no") {
    $commandsToTest = @("doxygen", "wget")
    $missingRequirements = ""

    foreach ($cmd in $commandsToTest) {
        if (!(Get-Command $cmd -ErrorAction SilentlyContinue)) {
            $missingRequirements += "* $cmd`n"
        }
    }

    if ($missingRequirements) {
        Write-Host "The following commands are required but missing from your system:"
        Write-Host $missingRequirements
        exit 1
    }

    if ($env:ZITI_DOCUSAURUS -eq "yes") {
        Write-Host "Copying C# SDK docs"
        $CSHARP_SOURCE = "$env:ZITI_DOC_GIT_LOC\ziti-sdk-csharp\docs"
        $CSHARP_TARGET = "$env:SDK_ROOT_TARGET\csharp"
        New-Item -ItemType Directory -Force -Path $CSHARP_TARGET
        Copy-Item "$CSHARP_SOURCE\*" -Recurse -Destination $CSHARP_TARGET
    }

    # Repeat the process for other SDKs...
}

if ($env:ADD_STARGAZER_DATA -eq "yes") {
    Write-Host "Collecting stargazer data"
    .\gh-stats.ps1
}

if ($env:SKIP_DOCUSAURUS_GEN -eq "no") {
    Set-Location "$env:ZITI_DOC_GIT_LOC\.."
    Write-Host "Running 'yarn install' in $PWD"
    yarn install --frozen-lockfile

    Write-Host "Running 'yarn build' in $PWD"
    yarn build
}

Write-Host "gendoc complete"
