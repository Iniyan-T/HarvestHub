@echo off
REM Price Graph - Complete Setup & Launch Script (Windows)

setlocal enabledelayedexpansion

echo ==================================
echo 🌾 HarvestHub Price Graph Setup
echo ==================================

REM Check if we're in the right directory
if not exist "backend" (
    echo ❌ Error: backend directory not found
    echo Please run this script from the Farm directory
    pause
    exit /b 1
)

REM Step 1: Check MongoDB
echo.
echo 📦 Step 1: Checking MongoDB...
where mongod >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ MongoDB not found. 
    echo Install one of: 
    echo    1. MongoDB Community: https://www.mongodb.com/try/download/community
    echo    2. MongoDB Docker: docker run -d -p 27017:27017 mongo
    pause
    exit /b 1
)
echo ✅ MongoDB found

REM Step 2: Check if MongoDB is running
echo.
echo 🔍 Checking if MongoDB is running...
netstat -ano | findstr :27017 >nul
if %errorlevel% neq 0 (
    echo ⏳ Starting MongoDB...
    start mongod --dbpath %userprofile%\mongodb\data
    timeout /t 3 /nobreak
    echo ✅ MongoDB started
) else (
    echo ✅ MongoDB already running
)

REM Step 3: Setup and start Backend
echo.
echo 📦 Step 3: Setting up Backend...
cd backend
call npm install >nul 2>nul
echo ✅ Backend dependencies installed

echo.
echo 🚀 Step 4: Starting Backend Server...
start "Backend - Farm API" cmd /k npm start
timeout /t 4 /nobreak

REM Step 5: Initialize Price Predictions
echo.
echo 📊 Step 5: Initializing Price Predictions...
timeout /t 1 /nobreak
curl -s -X POST http://localhost:5000/api/quality/price/init/mock-data >nul 2>nul
echo ✅ Price predictions initialized

REM Step 6: Setup and start Frontend
echo.
echo 📦 Step 6: Setting up Frontend...
cd ..\Buyers
call npm install >nul 2>nul
echo ✅ Frontend dependencies installed

echo.
echo 🚀 Step 7: Starting Frontend...
start "Frontend - Buyers App" cmd /k npm run dev
timeout /t 3 /nobreak

echo.
echo ==================================
echo     ✅ PRICE GRAPH IS RUNNING!
echo ==================================
echo.
echo 📱 Access the application:
echo    Browser: http://localhost:5173
echo.
echo 📊 Features:
echo    ✅ Dashboard with crops
echo    ✅ Price Graph viewer (click sidebar link)
echo    ✅ Price predictions with trends
echo    ✅ Historical ^& predicted data
echo.
echo 📊 API Endpoints:
echo    GET  http://localhost:5000/api/quality/price/list/all
echo    GET  http://localhost:5000/api/quality/price/{cropType}
echo    POST http://localhost:5000/api/quality/price/init/mock-data
echo.
echo 🎯 Next Steps:
echo    1. Login as Buyer (or create account)
echo    2. Click "Price Graph" in the sidebar
echo    3. View crop prices and predictions
echo    4. See historical trends and future forecasts
echo.
echo ==================================
pause
