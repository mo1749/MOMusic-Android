# Assemble Node backend: E:\work\MOMusic backend sources -> www\nodejs
# Excludes data/ lt-data/ (user data lives in app.datadir() at runtime).
$ErrorActionPreference = 'Stop'

$proj = 'E:\work\MOMusic'
$dst  = Join-Path $PSScriptRoot 'www\nodejs'

if (-not (Test-Path $proj)) { Write-Error "Project dir missing: $proj" }
if (-not (Test-Path $dst)) { New-Item -ItemType Directory -Path $dst -Force | Out-Null }

$files = @(
  'server.js',
  'listen-together.js',
  'listen-together-server.js',
  'local-collection.js',
  'dj-analyzer.js',
  'kugou-api.js',
  'qishui-api.js',
  'qq-vip-api.js',
  'spotify-api.js',
  'lx-custom-source-engine.js',
  'lx-source-api.js',
  'lx-source-sync.js',
  'lx-proxy.js',
  'cuefield',
  'qishui-audio-decryptor',
  'lx-sources',
  'lx-sources-local'
)

foreach ($f in $files) {
  $s = Join-Path $proj $f
  if (-not (Test-Path $s)) { Write-Warning "[sync-node] missing: $s"; continue }
  if ((Get-Item $s).PSIsContainer) {
    robocopy $s (Join-Path $dst $f) /E /XD node_modules /NFL /NDL /NJH /NJS /NP | Out-Null
  } else {
    Copy-Item $s $dst -Force
  }
}

# Patch local-collection.js: DATA_FILE must honor MOMusic_DATA_DIR (Android persistent storage).
$lc = Join-Path $dst 'local-collection.js'
if (Test-Path $lc) {
  $content = [System.IO.File]::ReadAllText($lc, [System.Text.Encoding]::UTF8)
  if ($content -notmatch 'MOMusic_DATA_DIR') {
    $needle = "path.join(__dirname, 'data', 'local-collection.json')"
    if ($content.Contains($needle)) {
      $replacement = "process.env.MOMusic_DATA_DIR ? path.join(process.env.MOMusic_DATA_DIR, 'local-collection.json') : path.join(__dirname, 'data', 'local-collection.json')"
      $content = $content.Replace($needle, $replacement)
      [System.IO.File]::WriteAllText($lc, $content, (New-Object System.Text.UTF8Encoding($false)))
      Write-Host '[sync-node] patched local-collection.js DATA_FILE'
    }
  }
}

# Patch qishui-api.js: nodejs-mobile V8 lacks \p{P} Unicode property escapes.
$qa = Join-Path $dst 'qishui-api.js'
if (Test-Path $qa) {
  $content = [System.IO.File]::ReadAllText($qa, [System.Text.Encoding]::UTF8)
  if ($content.Contains('\p{P}')) {
    $needle = ".replace(/[\s\p{P}\p{S}]+/gu, '');"
    $replacement = ".replace(/[\s\u0021-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007E\u2000-\u206F\u3000-\u303F\uFF00-\uFFEF\uFE10-\uFE1F\uFE30-\uFE4F]+/g, '');"
    $content = $content.Replace($needle, $replacement)
    [System.IO.File]::WriteAllText($qa, $content, (New-Object System.Text.UTF8Encoding($false)))
    Write-Host '[sync-node] patched qishui-api.js unicode-regex'
  }
}

# Patch cuefield/*.js: \p{L}\p{N} -> explicit BMP ranges.
$r1 = "/[^\u0041-\u005A\u0061-\u007A\u0030-\u0039\u00C0-\u024F\u0370-\u03FF\u0400-\u04FF\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5A'\s]+/g"
$r2 = "/[^\u0041-\u005A\u0061-\u007A\u0030-\u0039\u00C0-\u024F\u0370-\u03FF\u0400-\u04FF\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5A]+/g"
Get-ChildItem (Join-Path $dst 'cuefield') -Filter '*.js' -ErrorAction SilentlyContinue | ForEach-Object {
  $content = [System.IO.File]::ReadAllText($_.FullName, [System.Text.Encoding]::UTF8)
  $orig = $content
  $content = $content.Replace("/[^\p{L}\p{N}'\s]+/gu", $r1).Replace("/[^\p{L}\p{N}]+/gu", $r2)
  if ($content -ne $orig) {
    [System.IO.File]::WriteAllText($_.FullName, $content, (New-Object System.Text.UTF8Encoding($false)))
    Write-Host "[sync-node] patched $($_.Name) unicode-regex"
  }
}

# Install backend deps
Push-Location $dst
try {
  npm install --omit=dev --no-audit --no-fund
  if ($LASTEXITCODE -ne 0) { Write-Error 'npm install failed' }
} finally {
  Pop-Location
}

Write-Host '[sync-node] OK (backend sources + npm deps -> www/nodejs)'
