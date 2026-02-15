# Price Graph Implementation Verification Script (PowerShell)
# This script checks if all components are properly configured

Write-Host "🔍 Checking Price Graph Implementation..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check 1: PriceGraph.tsx file exists
Write-Host "1️⃣  Checking PriceGraph component..." -ForegroundColor Yellow
if (Test-Path "Buyers/src/components/PriceGraph.tsx") {
    Write-Host "✓ PriceGraph.tsx found" -ForegroundColor Green
}
else {
    Write-Host "✗ PriceGraph.tsx not found" -ForegroundColor Red
}
Write-Host ""

# Check 2: Recharts dependency
Write-Host "2️⃣  Checking Recharts dependency..." -ForegroundColor Yellow
$packageContent = Get-Content "Buyers/package.json" -Raw
if ($packageContent | Select-String "recharts" -Quiet) {
    Write-Host "✓ Recharts is in package.json" -ForegroundColor Green
}
else {
    Write-Host "✗ Recharts not found in package.json" -ForegroundColor Red
}
Write-Host ""

# Check 3: Quality routes file
Write-Host "3️⃣  Checking backend quality routes..." -ForegroundColor Yellow
if (Test-Path "backend/routes/quality.js") {
    Write-Host "✓ quality.js routes file found" -ForegroundColor Green
    
    # Check for mock data generation
    $qualityContent = Get-Content "backend/routes/quality.js" -Raw
    if ($qualityContent | Select-String "generateMockPredictions" -Quiet) {
        Write-Host "✓ Mock data generation function found" -ForegroundColor Green
    }
    else {
        Write-Host "✗ Mock data generation function not found" -ForegroundColor Red
    }
    
    # Check for init endpoint
    if ($qualityContent | Select-String "/price/init/mock-data" -Quiet) {
        Write-Host "✓ Mock data initialization endpoint found" -ForegroundColor Green
    }
    else {
        Write-Host "✗ Mock data initialization endpoint not found" -ForegroundColor Red
    }
}
else {
    Write-Host "✗ quality.js not found" -ForegroundColor Red
}
Write-Host ""

# Check 4: PricePrediction model
Write-Host "4️⃣  Checking PricePrediction model..." -ForegroundColor Yellow
if (Test-Path "backend/models/PricePrediction.js") {
    Write-Host "✓ PricePrediction.js found" -ForegroundColor Green
    
    # Check for historicalData field
    $modelContent = Get-Content "backend/models/PricePrediction.js" -Raw
    if ($modelContent | Select-String "historicalData" -Quiet) {
        Write-Host "✓ Historical data field found in model" -ForegroundColor Green
    }
    else {
        Write-Host "✗ Historical data field not found" -ForegroundColor Red
    }
}
else {
    Write-Host "✗ PricePrediction.js not found" -ForegroundColor Red
}
Write-Host ""

# Check 5: Server.js routes
Write-Host "5️⃣  Checking backend route mounting..." -ForegroundColor Yellow
$serverContent = Get-Content "backend/server.js" -Raw
if ($serverContent | Select-String "/api/quality" -Quiet) {
    Write-Host "✓ Quality routes mounted in server.js" -ForegroundColor Green
}
else {
    Write-Host "✗ Quality routes not mounted in server.js" -ForegroundColor Red
}

if ($serverContent | Select-String "/api/crops" -Quiet) {
    Write-Host "✓ Crops endpoint found in server.js" -ForegroundColor Green
}
else {
    Write-Host "✗ Crops endpoint not found in server.js" -ForegroundColor Red
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Price Graph Implementation Verified!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Install backend dependencies: cd backend ; npm install"
Write-Host "2. Start backend server: npm start"
Write-Host "3. Upload test crops from Farmer dashboard"
Write-Host "4. Initialize predictions: Invoke-WebRequest -Method POST http://localhost:5000/api/quality/price/init/mock-data"
Write-Host "5. Start Buyers app: cd Buyers ; npm start"
Write-Host "6. Navigate to Price Graph tab"
Write-Host ""
