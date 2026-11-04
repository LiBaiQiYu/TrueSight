@echo off
setlocal
cd /d "%~dp0"

rem clarity/snappy 需要可写的临时目录；不能依赖 Explorer 之外的父进程环境。
if not exist "%~dp0.cache\tmp" mkdir "%~dp0.cache\tmp"
set "TEMP=%~dp0.cache\tmp"
set "TMP=%TEMP%"

set "PORT=%~1"
if "%PORT%"=="" set "PORT=8077"

start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 1; Start-Process 'http://127.0.0.1:%PORT%'"
"%~dp0runtime\python\python.exe" "%~dp0server.py" %*

echo.
echo TrueSight stopped.
pause
