# Sync web assets: E:\work\MOMusic\public -> www
# Excludes nodejs dir (managed by sync-node.ps1). Injects android bridge after copy.
$ErrorActionPreference = 'Stop'

$src = 'E:\work\MOMusic\public'
$dst = Join-Path $PSScriptRoot 'www'

if (-not (Test-Path $src)) { Write-Error "Source dir missing: $src" }
if (-not (Test-Path $dst)) { New-Item -ItemType Directory -Path $dst -Force | Out-Null }

robocopy $src $dst /MIR /XD nodejs /NFL /NDL /NJH /NJS /NP | Out-Null
$code = $LASTEXITCODE
if ($code -gt 7) { Write-Error "robocopy failed, exit code $code" }

# ---- bridge injection ----
$bridge = Join-Path $PSScriptRoot 'android-bridge.js'
$bridgeTarget = Join-Path $dst 'js\android-bridge.js'
Copy-Item $bridge $bridgeTarget -Force

$htmlPath = Join-Path $dst 'index.html'
$html = [System.IO.File]::ReadAllText($htmlPath, [System.Text.Encoding]::UTF8)
if ($html -notmatch 'android-bridge\.js') {
  $tag = '<script src="js/android-bridge.js"></script>'
  $pattern = '(?s)(<head[^>]*>)(.*?)(</head>)'
  $replacement = "`$1`n  $tag`$2`$3"
  $html = [System.Text.RegularExpressions.Regex]::Replace($html, $pattern, $replacement, 1)
  [System.IO.File]::WriteAllText($htmlPath, $html, (New-Object System.Text.UTF8Encoding($false)))
  Write-Host '[sync-web] android-bridge.js reference injected'
} else {
  Write-Host '[sync-web] android-bridge.js already present, skip'
}

Write-Host '[sync-web] OK (public -> www)'
