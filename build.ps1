# build.ps1
# This script converts every .tex file in the src folder to an HTML page using Pandoc,
# then creates a simple index.html with links to each generated page.

param(
    [string]$SrcDir = "src",
    [string]$CssFile = "assets/style.css"
)

# Ensure the source directory exists
if (-not (Test-Path $SrcDir)) {
    Write-Error "Source directory '$SrcDir' not found."
    exit 1
}

# Get all .tex files
$texFiles = Get-ChildItem $SrcDir -Filter *.tex
if ($texFiles.Count -eq 0) {
    Write-Error "No .tex files found in $SrcDir"
    exit 1
}

# Convert each .tex to its own .html file
foreach ($file in $texFiles) {
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
    $outHtml = "$baseName.html"
    Write-Host "Converting $($file.Name) → $outHtml"
    pandoc $file.FullName `
        --standalone `
        --css $CssFile `
        -f latex -t html5 `
        -o $outHtml
    if (-not (Test-Path $outHtml)) {
        Write-Error "Failed to generate $outHtml"
    }
}

# Build index.html linking to each generated page
$indexPath = "index.html"
$indexHeader = @"
<!DOCTYPE html>
<html lang=\"tr\">
<head>
    <meta charset=\"UTF-8\" />
    <title>İstatistik Teorisi Notları</title>
    <link rel=\"stylesheet\" href=\"assets/style.css\" />
</head>
<body>
    <h1>İstatistik Teorisi Notları</h1>
    <ul>
"@
$indexFooter = @"
    </ul>
</body>
</html>
"@

$indexHeader | Set-Content $indexPath
foreach ($file in $texFiles) {
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
    $link = "$baseName.html"
    $listItem = "        <li><a href=\"$link\">$baseName</a></li>"
    Add-Content $indexPath $listItem
}
$indexFooter | Add-Content $indexPath

Write-Host "Index page generated at $indexPath"
