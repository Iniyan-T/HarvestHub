@echo off
REM Price Graph Setup Script for Windows
REM This script starts all necessary services for the Price Graph feature

setlocal enabledelayedexpansion

echo.
echo ========================================
echo  Price Graph Setup - Windows Startup
echo ========================================
echo.

REM Check if Node.js is installed
echo Checking for Node.js...
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Node.js not found! Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js found

REM Check if MongoDB is accessible
echo.
echo Checking MongoDB connection...
mongosh --eval "db.adminCommand('ping')" --quiet >nul 2>&1
if errorlevel 1 (
    echo ⚠️  MongoDB may not be running or not accessible
    echo   Make sure MongoDB is running before starting the app
) else (
    echo ✅ MongoDB is running
)

echo.
echo Starting Price Graph Components...
echo ========================================

REM Start Backend
echo.
echo 1️⃣ Starting Backend Server...
start cmd /k "cd /d %~dp0backend && npm start"
timeout /t 5 >nul

REM Initialize Mock Predictions
echo.
echo 2️⃣ Initializing Mock Price Predictions...
timeout /t 3 >nul
powershell.exe -NoProfile -Command "try { $response = Invoke-WebRequest -Method POST -Uri 'http://localhost:5000/api/quality/price/init/mock-data' -ErrorAction SilentlyContinue; if ($response.StatusCode -eq 200) { Write-Host '✅ Mock predictions initialized' -ForegroundColor Green } else { Write-Host '⚠️ Could not initialize predictions' -ForegroundColor Yellow } } catch { Write-Host '⚠️ Retrying... Ensure backend is running' -ForegroundColor Yellow }"
timeout /t 2 >nul

REM Start Frontend
echo.
echo 3️⃣ Starting Buyers Application...
start cmd /k "cd /d %~dp0Buyers && npm start"

echo.
echo ========================================
echo ✅ All services started!
echo ========================================
echo.
echo 📋 Next Steps:
echo 1. Wait for both windows to fully start (30-60 seconds)
echo 2. Browser will open automatically at http://localhost:5173
echo 3. Login as a Buyer
echo 4. Navigate to "Price Graph" tab
echo 5. View crop predictions!
echo.
echo 📊 The Price Graph shows:
echo    • Historical prices from past 30 days
echo    • Predicted prices for next 7 days
echo    • Trends and recommendations
echo    • Confidence levels for predictions
echo.
echo 🛑 To stop all services:
echo    1. Close the backend and frontend command windows
echo.
pause
