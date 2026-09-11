#Requires -Version 5.1
<#
.SYNOPSIS
    Thin Windows shim for the OpenZiti documentation build.

.DESCRIPTION
    All build logic lives in gendoc.mjs, the single cross-platform source of
    truth (shared with gendoc.sh). This script only maps its PowerShell-style
    parameters onto gendoc.mjs flags so existing Windows callers keep working
    unchanged. It also still accepts the original combined short flags
    (e.g. -cld) so nothing that called the old script has to change.

    Run `node gendoc.mjs --help` for the full option/env-var reference.

.EXAMPLE
    .\gendoc.ps1

.EXAMPLE
    .\gendoc.ps1 -SkipClean -SkipLinkedDoc -SkipDocusaurus

.EXAMPLE
    .\gendoc.ps1 -cld
#>
[CmdletBinding()]
param(
    # Skip creating and updating the Git working copies
    [switch]$SkipGit,

    # Skip linked doc generation (doxygen/doxybook2/wget)
    [switch]$SkipLinkedDoc,

    # Skip the clean step that deletes Git working copies
    [switch]$SkipClean,

    # Also fetch stargazer data (needs gh and a token)
    [switch]$Stargazers,

    # Skip the yarn install + yarn build at the end
    [switch]$SkipDocusaurus,

    # Generate docs-openziti.zip after the build
    [switch]$Zip,

    # Original combined short flags, e.g. -cld. Forwarded verbatim.
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Passthru
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$mjs       = Join-Path $scriptDir "gendoc.mjs"

# Map PowerShell params -> gendoc.mjs flags. Only forward params the caller
# explicitly passed so gendoc.mjs owns the defaults (single source of truth).
$mjsArgs = @()
if ($SkipGit)        { $mjsArgs += "--skip-git" }
if ($SkipLinkedDoc)  { $mjsArgs += "--skip-linked-doc" }
if ($SkipClean)      { $mjsArgs += "--skip-clean" }
if ($Stargazers)     { $mjsArgs += "--stargazers" }
if ($SkipDocusaurus) { $mjsArgs += "--skip-docusaurus" }
if ($Zip)            { $mjsArgs += "--zip" }
if ($Passthru)       { $mjsArgs += $Passthru }

& node $mjs @mjsArgs
exit $LASTEXITCODE
