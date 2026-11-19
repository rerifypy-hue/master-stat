$ErrorActionPreference = "Stop"

$root = $PSScriptRoot
$requiredFiles = @(
    "index.html",
    "assets\css\style.css",
    "assets\js\main.js",
    "assets\js\tex-mml-chtml.js",
    "assets\js\week-01-charts.js",
    "assets\js\week-charts.js",
    "courses\istatistik-teorisi\index.html"
)

1..7 | ForEach-Object {
    $requiredFiles += "courses\istatistik-teorisi\hafta-{0:D2}.html" -f $_
}

$missingFiles = @(
    $requiredFiles | Where-Object {
        -not (Test-Path -LiteralPath (Join-Path $root $_) -PathType Leaf)
    }
)

if ($missingFiles.Count -gt 0) {
    Write-Error ("Missing static site files: " + ($missingFiles -join ", "))
    exit 1
}

Write-Host "Static site files validated."
