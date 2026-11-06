param(
    [string]$Path = ""
)

$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
if (-not $Path) {
    $Path = Join-Path $Root 'desktop\release'
}
$Target = (Resolve-Path $Path).Path
if (-not (Test-Path $Target)) {
    throw "打包目录不存在：$Target"
}

# DSH / sandboxed shells may create files with Low mandatory integrity.
# Electron refuses to start correctly from those files; promote the release tree to Medium.
Write-Host "Set Medium integrity: $Target"
icacls $Target /setintegritylevel Medium /T /C | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'icacls 执行失败。' }
Write-Host 'Done.'
