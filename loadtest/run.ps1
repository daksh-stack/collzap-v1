<#
  Runs one k6 scenario in Docker and saves a JSON summary + an HTML report.

  Examples (from the loadtest folder):
    .\run.ps1 01_smoke                                   # against production
    .\run.ps1 01_smoke -BaseUrl http://host.docker.internal:8081   # against local dev
    .\run.ps1 04_read_mix -Step 1m                       # shorter steps
    .\run.ps1 12_soak -Env SOAK_VUS=200,SOAK_DURATION=30m

  Run k6 from YOUR machine, not from the VPS: k6 competes for the same CPU otherwise.
  Live dashboard: http://localhost:5665 while it runs. Ctrl+C is the kill switch.
#>
param(
  [Parameter(Mandatory = $true, Position = 0)][string]$Scenario,
  [string]$BaseUrl = "https://api.collzap.com",
  [string]$Step = "",
  [string[]]$Env = @()
)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$script = "scenarios/$Scenario.js"
if (-not (Test-Path (Join-Path $root $script))) { throw "No such scenario: $script" }

$out = Join-Path $root "results"
New-Item -ItemType Directory -Force $out | Out-Null
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$name = "$Scenario-$stamp"

$envArgs = @("-e", "BASE_URL=$BaseUrl")
if ($Step) { $envArgs += @("-e", "STEP=$Step") }
foreach ($e in $Env) { $envArgs += @("-e", $e) }

Write-Host "Scenario: $Scenario   Target: $BaseUrl" -ForegroundColor Cyan
if ($BaseUrl -match "collzap\.com") {
  Write-Host "This is PRODUCTION. Real users can be affected. Ctrl+C to stop." -ForegroundColor Yellow
}

docker run --rm -i `
  -v "${root}:/loadtest" -w /loadtest `
  -p 5665:5665 `
  -e K6_WEB_DASHBOARD=true `
  -e K6_WEB_DASHBOARD_EXPORT="results/$name.html" `
  @envArgs `
  grafana/k6 run `
  --summary-export "results/$name.json" `
  $script
