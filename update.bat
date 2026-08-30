@echo off
title Overseer Updater
cd /d "%~dp0"

echo.
echo ========================================
echo        OVERSEER UPDATE SYSTEM
echo ========================================
echo.

echo [1/4] Checking GitHub...
git fetch origin
if errorlevel 1 goto :error

for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD 2^>nul') do set BRANCH=%%b
if "%BRANCH%"=="" goto :error
if "%BRANCH%"=="HEAD" goto :error

echo [2/4] Updating Overseer from %BRANCH%...
git pull --ff-only origin %BRANCH%
if errorlevel 1 goto :error

echo [3/4] Checking dependencies...
call npm ci
if errorlevel 1 goto :error

echo [4/4] UPDATE COMPLETE!
echo.
echo Your .env and local database remain untouched.
echo.
pause
exit /b 0

:error
echo.
echo ERROR: The update could not be completed.
echo Your existing files were not intentionally deleted.
echo.
pause
exit /b 1
