@echo off
setlocal
cd /d "%~dp0"

rem Clarity/snappy needs a writable temp directory.
if not exist "%~dp0.cache\tmp" mkdir "%~dp0.cache\tmp"
set "TEMP=%~dp0.cache\tmp"
set "TMP=%TEMP%"

set "PORT=%~1"
if "%PORT%"=="" set "PORT=8077"

start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 1; Start-Process 'http://127.0.0.1:%PORT%'"

if exist "%~dp0runtime\python\python.exe" (
    "%~dp0runtime\python\python.exe" "%~dp0server.py" %*
) else (
    where python >nul 2>nul
    if not errorlevel 1 (
        python "%~dp0server.py" %*
    ) else (
        where py >nul 2>nul
        if not errorlevel 1 (
            py -3 "%~dp0server.py" %*
        ) else (
            echo.
            echo Python 3.10+ not found.
            echo Install Python 3.10+ or put a portable Python at runtime\python\python.exe.
            echo.
            pause
            exit /b 1
        )
    )
)

echo.
echo TrueSight stopped.
pause
