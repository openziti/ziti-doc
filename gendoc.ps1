# PowerShell equivalent of gendoc.sh

function Clone-Or-Pull {
    param (
        [string]$remote,
        [string]$dir,
        [string]$branch = "main"
    )

    $dirPath = Join-Path $env:ZITI_DOC_GIT_LOC $dir

    if (Test-Path $dirPath) {
        Push-Location $dirPath
        git checkout $branch
        git pull --ff-only
        Pop-Location
    } else {
        git clone $remote --branch $branch --single-branch --no-tags --depth 1 $dirPath
    }
}

function Fix-HelmZitiEdgeTunnel {
    $target = Join-Path $env:ZITI_DOC_GIT_LOC "helm-charts\charts\ziti-edge-tunnel\README.md"
    Write-Host "fixing $target to work with docusaurus"
    $content = Get-Content $target -Raw
    $content = $content -replace [regex]::Escape('<https://openziti.io>'), '&lt;https://openziti.io&gt;'
    $content = $content -replace [regex]::Escape('<https://github.com/openziti/ziti-tunnel-sdk-c>'), '&lt;https://github.com/openziti/ziti-tunnel-sdk-c&gt;'
    $content = $content -replace [regex]::Escape('sresponse\\s<|>$'), 'sresponse\\s&lt;|>$'
    Set-Content $target -Value $content -NoNewline
}

function Fix-HelmExamples {
    $helmRouterReadme = Join-Path $env:ZITI_DOC_GIT_LOC "helm-charts\charts\ziti-router\README.md"
    $examplesUrl = "https://github.com/openziti/helm-charts/tree/main/charts/ziti-router/examples"

    Write-Host "checking file: $helmRouterReadme"
    if (Test-Path $helmRouterReadme) {
        Write-Host "found file, fixing examples links..."
        $content = Get-Content $helmRouterReadme -Raw
        $content = $content -replace '\]\(\.?/examples/?\)', "]($examplesUrl)"
        Set-Content $helmRouterReadme -Value $content -NoNewline
        Write-Host "fix completed successfully."
    } else {
        Write-Host "file not found: $helmRouterReadme"
        exit 1
    }
}

# ---- main ----

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host $scriptRoot

$SKIP_GIT         = "no"
$SKIP_LINKED_DOC  = "no"
$SKIP_CLEAN       = "no"
$ZITI_GEN_ZIP     = "no"
$env:ZITI_DOC_GIT_LOC  = "$scriptRoot\docusaurus\docs\_remotes"
if (-not $env:SDK_ROOT_TARGET) { $env:SDK_ROOT_TARGET = "$scriptRoot\docusaurus\static\docs\reference\developer\sdk" }
$ZITI_DOCUSAURUS       = "yes"
$SKIP_DOCUSAURUS_GEN   = "no"

Write-Host "- processing opts"

foreach ($arg in $args) {
    if ($arg -match '^-([glcsdz]+)$') {
        foreach ($char in $Matches[1].ToCharArray()) {
            switch ($char) {
                'g' { $SKIP_GIT = "yes";        Write-Host "- skipping creating and updating Git working copies" }
                'l' { $SKIP_LINKED_DOC = "yes"; Write-Host "- skipping linked doc generation" }
                'c' { $SKIP_CLEAN = "yes";      Write-Host "- skipping clean step that deletes Git working copies" }
                's' { $ADD_STARGAZER_DATA = "yes"; Write-Host "- fetching stargazer data as well" }
                'd' { $SKIP_DOCUSAURUS_GEN = "yes"; Write-Host "- skipping docusaurus generation" }
                'z' { $ZITI_GEN_ZIP = "yes";    Write-Host "- generating a zip file after build" }
                default { Write-Host "WARN: ignoring option: $char" }
            }
        }
    } else {
        Write-Host "WARN: ignoring argument: $arg"
    }
}

Write-Host "- done processing opts"

if ($SKIP_GIT -eq "no") {
    Write-Host "updating dependencies by rm/checkout"
    New-Item -ItemType Directory -Force -Path $env:ZITI_DOC_GIT_LOC | Out-Null
    if ($SKIP_CLEAN -eq "no") {
        Get-ChildItem "$env:ZITI_DOC_GIT_LOC\ziti-*" -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force
    }
    git config --global --add safe.directory $PWD

    Clone-Or-Pull "https://github.com/openziti/ziti"                       "ziti-cmd"
    Clone-Or-Pull "https://github.com/openziti/ziti-sdk-csharp"            "ziti-sdk-csharp"
    Clone-Or-Pull "https://github.com/openziti/ziti-sdk-c"                 "ziti-sdk-c"
    Clone-Or-Pull "https://github.com/openziti/ziti-android-app"           "ziti-android-app"
    Clone-Or-Pull "https://github.com/openziti/ziti-sdk-swift"             "ziti-sdk-swift"
    Clone-Or-Pull "https://github.com/openziti/ziti-tunnel-sdk-c"          "ziti-tunnel-sdk-c"
    Clone-Or-Pull "https://github.com/openziti/helm-charts"                "helm-charts"
    Clone-Or-Pull "https://github.com/openziti-test-kitchen/kubeztl"       "kubeztl"
    Clone-Or-Pull "https://github.com/openziti/desktop-edge-win"           "desktop-edge-win"
}

Fix-HelmZitiEdgeTunnel
Fix-HelmExamples

if ($SKIP_CLEAN -eq "no") {
    if (Test-Path $env:SDK_ROOT_TARGET) {
        Write-Host "SDK_ROOT_TARGET exists. removing previous build at: $env:SDK_ROOT_TARGET"
        Remove-Item $env:SDK_ROOT_TARGET -Recurse -Force
    } else {
        Write-Host "SDK_ROOT_TARGET [$env:SDK_ROOT_TARGET] does not exist"
    }
}

if ($SKIP_LINKED_DOC -eq "no") {
    $commandsToTest = @("doxygen", "wget")
    $missingRequirements = @()

    foreach ($cmd in $commandsToTest) {
        if (!(Get-Command $cmd -ErrorAction SilentlyContinue)) {
            $missingRequirements += " * $cmd"
        }
    }

    if ($missingRequirements.Count -gt 0) {
        Write-Host ""
        Write-Host "The commands listed below are required to be on the path for this script to function properly."
        Write-Host "Please ensure the commands listed are on the path and then try again."
        $missingRequirements | ForEach-Object { Write-Host $_ }
        Write-Host ""
        exit 1
    }

    if ($ZITI_DOCUSAURUS -eq "yes") {
        Write-Host "=================================================="
        $CSHARP_SOURCE = "$env:ZITI_DOC_GIT_LOC\ziti-sdk-csharp\docs"
        $CSHARP_TARGET = "$env:SDK_ROOT_TARGET\csharp"
        Write-Host "Copying csharp SDK docs"
        Write-Host "    from: $CSHARP_SOURCE"
        Write-Host "      to: $CSHARP_TARGET"
        New-Item -ItemType Directory -Force -Path $CSHARP_TARGET | Out-Null
        Copy-Item "$CSHARP_SOURCE\*" -Recurse -Destination $CSHARP_TARGET
    }

    $doxyfile = "$env:ZITI_DOC_GIT_LOC\ziti-sdk-c\Doxyfile"
    if (Test-Path $doxyfile) {
        Push-Location "$env:ZITI_DOC_GIT_LOC\ziti-sdk-c"
        doxygen
        $CLANG_SOURCE = "$env:ZITI_DOC_GIT_LOC\ziti-sdk-c\api"
        $CLANG_TARGET = "$env:SDK_ROOT_TARGET\clang"
        Write-Host ""
        Write-Host "Copying C SDK doc"
        Write-Host "    from: $CLANG_SOURCE"
        Write-Host "      to: $CLANG_TARGET"
        New-Item -ItemType Directory -Force -Path $CLANG_TARGET | Out-Null
        Copy-Item "$CLANG_SOURCE\*" -Recurse -Destination $CLANG_TARGET
        Write-Host ""
        Write-Host "Removing $CLANG_SOURCE"
        Remove-Item $CLANG_SOURCE -Recurse -Force
        Pop-Location
    } else {
        Write-Host "ERROR: CSDK Doxyfile not located"
    }

    $swiftProj = "$env:ZITI_DOC_GIT_LOC\ziti-sdk-swift\CZiti.xcodeproj\project.pbxproj"
    if (Test-Path $swiftProj) {
        $SWIFT_API_TARGET = "$env:SDK_ROOT_TARGET\swift"
        New-Item -ItemType Directory -Force -Path $SWIFT_API_TARGET | Out-Null
        $swiftTgz = "https://github.com/openziti/ziti-sdk-swift/releases/latest/download/ziti-sdk-swift-docs.tgz"
        Write-Host ""
        Write-Host "Copying Swift docs"
        Write-Host "    from: $swiftTgz"
        Write-Host "      to: $SWIFT_API_TARGET"
        Write-Host ""
        Push-Location $SWIFT_API_TARGET
        wget -q -O - $swiftTgz | tar -zxv
        Get-ChildItem -Recurse -Filter "EnrollmentResponse*"
        Pop-Location
    }
}

if ($ADD_STARGAZER_DATA -eq "yes") {
    if (!(Get-Command csvtojson -ErrorAction SilentlyContinue)) {
        Write-Host "csvtojson not installed, skipping stargazer data"
    } elseif (-not $env:GITHUB_TOKEN) {
        Write-Host "GITHUB_TOKEN not set, skipping stargazer data"
    } else {
        Write-Host "collecting stargazer data before building the site..."
        & "$scriptRoot\gh-stats.ps1"
    }
}

if ($SKIP_DOCUSAURUS_GEN -eq "no") {
    # ZITI_DOC_GIT_LOC is docusaurus\docs\_remotes, so ..\..\  = docusaurus\
    Push-Location (Join-Path $env:ZITI_DOC_GIT_LOC "..\..")
    Write-Host "running 'yarn install' in $PWD"
    yarn install --frozen-lockfile
    Write-Host "running 'yarn build' in $PWD"
    yarn build
    Write-Host ""

    if ($ZITI_GEN_ZIP -eq "yes") {
        Write-Host "generating docs into $scriptRoot\docusaurus\openziti"
        yarn build --out-dir=openziti
        git checkout docusaurus.config.ts
        Write-Host "zipping build directory: $scriptRoot\docusaurus\openziti"
        $zipSource = "$scriptRoot\docusaurus\openziti"
        $zipDest   = "$scriptRoot\docs-openziti.zip"
        Compress-Archive -Path "$zipSource\*" -DestinationPath $zipDest -Force
    }
    Pop-Location
}

Write-Host ""
Write-Host "------------------------"
Write-Host "gendoc complete"
