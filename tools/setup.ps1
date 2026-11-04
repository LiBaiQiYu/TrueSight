param(
    [switch]$NoClone,
    [switch]$SkipClarity
)

$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$Lib = Join-Path $Root 'lib'
$Classes = Join-Path $Root 'classes'

function Write-Step([string]$Text) {
    Write-Host ''
    Write-Host "== $Text ==" -ForegroundColor Cyan
}

function Get-NativeText {
    param([string]$Exe, [string[]]$Arguments)
    $previous = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try { return (& $Exe @Arguments 2>&1 | Out-String) }
    finally { $ErrorActionPreference = $previous }
}

Write-Host 'TrueSight setup' -ForegroundColor Green
Write-Host "Project: $Root"

# ---------------------------------------------------------------- Python
Write-Step 'Python 3.10+'
$python = $null
$pythonChecks = @(
    @{ Path = (Join-Path $Root 'runtime\python\python.exe'); Prefix = @() },
    @{ Path = 'python'; Prefix = @() },
    @{ Path = 'py'; Prefix = @('-3') }
)
foreach ($item in $pythonChecks) {
    $isPath = $item.Path.Contains('\') -or $item.Path.Contains('/')
    if ($isPath) {
        if (-not (Test-Path $item.Path)) { continue }
    } else {
        if (-not (Get-Command $item.Path -ErrorAction SilentlyContinue)) { continue }
    }
    try {
        $prefix = @($item.Prefix)
        $value = (Get-NativeText $item.Path (@($prefix) + @('-c', 'import sys; print(sys.version_info[0]*100+sys.version_info[1])'))).Trim()
        if ($value -match '^\d+$' -and [int]$value -ge 310) {
            $python = $item
            break
        }
    } catch {
        # try next candidate
    }
}
if (-not $python) {
    throw '未找到 Python 3.10+。请安装 Python 3.10+，或把便携版放到 runtime\python\python.exe。'
}
$pyVersion = (Get-NativeText $python.Path (@($python.Prefix) + @('--version'))).Trim()
Write-Host "OK: $pyVersion" -ForegroundColor Green
Write-Host 'Python 只使用标准库（http.server / urllib / subprocess 等），不需要 pip 安装第三方包。'

if ($SkipClarity) {
    Write-Host ''
    Write-Host '已跳过 Clarity 检查（-SkipClarity）。' -ForegroundColor Yellow
    exit 0
}

# ---------------------------------------------------------------- Java
Write-Step 'Java 21+'
$javaCandidates = New-Object System.Collections.Generic.List[string]
$javaCandidates.Add((Join-Path $Root 'runtime\jre\bin\java.exe'))
$javaCandidates.Add((Join-Path $Root 'jre\bin\java.exe'))
if ($env:JAVA_HOME) {
    $javaCandidates.Add((Join-Path $env:JAVA_HOME 'bin\java.exe'))
}
$javaCandidates.Add('java')
$java = $null
foreach ($candidate in $javaCandidates) {
    $isPath = $candidate.Contains('\') -or $candidate.Contains('/')
    if ($isPath) {
        if (-not (Test-Path $candidate)) { continue }
    } else {
        if (-not (Get-Command $candidate -ErrorAction SilentlyContinue)) { continue }
    }
    $text = Get-NativeText $candidate @('-version')
    if ($text -match 'version "(\d+)') {
        $major = [int]$Matches[1]
        if ($major -ge 21) {
            $java = $candidate
            break
        }
    }
}
if (-not $java) {
    throw '未找到 Java 21+。请安装 JDK 21，或把 JRE 放到 jre\bin\java.exe。'
}
Write-Host "OK: $java" -ForegroundColor Green

$javacCandidates = New-Object System.Collections.Generic.List[string]
if ($env:JAVA_HOME) {
    $javacCandidates.Add((Join-Path $env:JAVA_HOME 'bin\javac.exe'))
}
$javacCandidates.Add('javac')
$javac = $null
foreach ($candidate in $javacCandidates) {
    $isPath = $candidate.Contains('\') -or $candidate.Contains('/')
    if ($isPath) {
        if (-not (Test-Path $candidate)) { continue }
    } else {
        if (-not (Get-Command $candidate -ErrorAction SilentlyContinue)) { continue }
    }
    $text = Get-NativeText $candidate @('-version')
    if ($text -match 'javac (\d+)' -and [int]$Matches[1] -ge 21) {
        $javac = $candidate
        break
    }
}
if (-not $javac) {
    throw '未找到 JDK 21 的 javac。JRE 只能运行，不能编译 MatchJsonMain；请安装 JDK 21。'
}
Write-Host "OK: $javac" -ForegroundColor Green

# ---------------------------------------------------------------- Clarity
Write-Step 'Clarity runtime'
$patterns = @('clarity-5*.jar', 'clarity-protobuf-7*.jar', 'fastutil-core-8*.jar', 'slf4j-api-2*.jar', 'snappy-java-*.jar')
function Test-Jars([string]$Dir) {
    if (-not (Test-Path $Dir)) { return $false }
    foreach ($pattern in $patterns) {
        if (-not (Get-ChildItem $Dir -Filter $pattern -File -ErrorAction SilentlyContinue)) { return $false }
    }
    return $true
}

$clarityDir = Join-Path (Split-Path $Root -Parent) 'clarity'
if (-not (Test-Jars $Lib)) {
    New-Item -ItemType Directory -Force -Path $Lib | Out-Null

    if (-not (Test-Path $clarityDir)) {
        if ($NoClone) {
            throw "缺少 Clarity：$clarityDir。已指定 -NoClone，请手动准备 ../clarity 或 lib/*.jar。"
        }
        Write-Host "未找到 $clarityDir，正在克隆 skadistats/clarity..." -ForegroundColor Yellow
        $previous = $ErrorActionPreference
        $ErrorActionPreference = 'Continue'
        git clone https://github.com/skadistats/clarity.git $clarityDir
        $cloneExit = $LASTEXITCODE
        $ErrorActionPreference = $previous
        if ($cloneExit -ne 0) { throw 'Clarity 克隆失败。' }
    }

    $clarityJar = Get-ChildItem (Join-Path $clarityDir 'build\libs') -Filter 'clarity-5*.jar' -File -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if (-not $clarityJar) {
        $gradlew = Join-Path $clarityDir 'gradlew.bat'
        if (-not (Test-Path $gradlew)) { throw "Clarity 缺少 gradlew.bat：$clarityDir" }
        Write-Host '正在构建 Clarity（gradlew build -x test）...' -ForegroundColor Yellow
        Push-Location $clarityDir
        try {
            $previous = $ErrorActionPreference
            $ErrorActionPreference = 'Continue'
            & $gradlew build -x test
            $buildExit = $LASTEXITCODE
            $ErrorActionPreference = $previous
            if ($buildExit -ne 0) { throw 'Clarity 构建失败。' }
        } finally {
            Pop-Location
        }
        $clarityJar = Get-ChildItem (Join-Path $clarityDir 'build\libs') -Filter 'clarity-5*.jar' -File -ErrorAction SilentlyContinue |
            Sort-Object LastWriteTime -Descending | Select-Object -First 1
    }
    if (-not $clarityJar) { throw 'Clarity 构建后仍未找到 clarity-5*.jar。' }
    Copy-Item $clarityJar.FullName $Lib -Force
    Write-Host "已复制 $($clarityJar.Name)" -ForegroundColor Green

    $cache = Join-Path $env:USERPROFILE '.gradle\caches\modules-2\files-2.1'
    $dependencyPatterns = @('clarity-protobuf-7', 'fastutil-core-8', 'slf4j-api-2', 'snappy-java-')
    foreach ($pattern in $dependencyPatterns) {
        $existing = Get-ChildItem $Lib -Filter "$pattern*.jar" -File -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($existing) { continue }
        $found = $null
        if (Test-Path $cache) {
            $found = Get-ChildItem $cache -Recurse -Filter '*.jar' -File -ErrorAction SilentlyContinue |
                Where-Object { $_.Name -like "$pattern*" -and $_.Name -notlike '*-sources.jar' -and $_.Name -notlike '*-javadoc.jar' } |
                Sort-Object LastWriteTime -Descending | Select-Object -First 1
        }
        if (-not $found) { throw "缺少依赖 $pattern*.jar，请手动放入 lib\。" }
        Copy-Item $found.FullName $Lib -Force
        Write-Host "已复制 $($found.Name)" -ForegroundColor Green
    }
}

if (-not (Test-Jars $Lib)) {
    throw 'lib\ 中的 Clarity 依赖仍不完整。'
}
Write-Host "OK: $Lib" -ForegroundColor Green

# ---------------------------------------------------------------- exporter
Write-Step 'MatchJsonMain exporter'
New-Item -ItemType Directory -Force -Path $Classes | Out-Null
$classpath = "$Classes;$(Join-Path $Lib '*')"
$previous = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
$compile = (& $javac --release 21 -encoding UTF-8 -cp $classpath -d $Classes (Join-Path $Root 'java\MatchJsonMain.java') 2>&1 | Out-String)
$compileExit = $LASTEXITCODE
$ErrorActionPreference = $previous
if ($compileExit -ne 0) { throw "MatchJsonMain 编译失败：`n$compile" }
Write-Host 'OK: classes\skadistats\clarity\bench\MatchJsonMain.class' -ForegroundColor Green

$check = Get-NativeText $java @('-cp', $classpath, 'skadistats.clarity.bench.MatchJsonMain')
if ($check -notmatch 'usage:') {
    throw "MatchJsonMain 启动检查失败：`n$check"
}
Write-Host 'OK: Java 类路径可用' -ForegroundColor Green

Write-Host ''
Write-Host '准备完成。启动：.\start.bat' -ForegroundColor Green
Write-Host '高级分析首次会下载回放并运行 Clarity，耗时取决于录像大小。'
