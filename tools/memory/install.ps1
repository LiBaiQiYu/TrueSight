param(
    [switch]$Init
)

$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    throw '未找到 git，请先安装 Git for Windows。'
}

if (-not (Test-Path (Join-Path $Root '.git'))) {
    if (-not $Init) {
        throw "当前目录不是 Git 仓库：$Root`n请先执行：powershell -ExecutionPolicy Bypass -File tools/memory/install.ps1 -Init"
    }
    git -C $Root init -b main
    if ($LASTEXITCODE -ne 0) { throw 'git init 失败' }
    Write-Host "已初始化 Git 仓库：$Root"
}

$hooks = Join-Path $Root '.githooks'
foreach ($name in @('pre-commit', 'pre-push')) {
    $path = Join-Path $hooks $name
    if (-not (Test-Path $path)) { throw "缺少 hook：$path" }
}

git -C $Root config core.hooksPath .githooks
if ($LASTEXITCODE -ne 0) { throw '设置 core.hooksPath 失败' }

Write-Host '已启用 AI 记忆 hook：core.hooksPath=.githooks'
Write-Host ''
Write-Host '提交时会自动执行：'
Write-Host '  tools/memory/update.py -> memory/ai/state.md -> git add'
Write-Host ''
Write-Host '首次同步建议：'
Write-Host '  git add .'
Write-Host '  git commit -m "chore: init TrueSight project memory"'
Write-Host '  git remote add origin <你的仓库地址>'
Write-Host '  git push -u origin main'
