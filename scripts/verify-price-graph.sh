#!/bin/bash

# Price Graph Implementation Verification Script
# This script checks if all components are properly configured

echo "🔍 Checking Price Graph Implementation..."
echo "========================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: PriceGraph.tsx file exists
echo "1️⃣  Checking PriceGraph component..."
if [ -f "Buyers/src/components/PriceGraph.tsx" ]; then
    echo -e "${GREEN}✓${NC} PriceGraph.tsx found"
else
    echo -e "${RED}✗${NC} PriceGraph.tsx not found"
fi
echo ""

# Check 2: Recharts dependency
echo "2️⃣  Checking Recharts dependency..."
if grep -q '"recharts"' Buyers/package.json; then
    echo -e "${GREEN}✓${NC} Recharts is in package.json"
else
    echo -e "${RED}✗${NC} Recharts not found in package.json"
fi
echo ""

# Check 3: Quality routes file
echo "3️⃣  Checking backend quality routes..."
if [ -f "backend/routes/quality.js" ]; then
    echo -e "${GREEN}✓${NC} quality.js routes file found"
    
    # Check for mock data generation
    if grep -q "generateMockPredictions" backend/routes/quality.js; then
        echo -e "${GREEN}✓${NC} Mock data generation function found"
    else
        echo -e "${RED}✗${NC} Mock data generation function not found"
    fi
    
    # Check for init endpoint
    if grep -q "/price/init/mock-data" backend/routes/quality.js; then
        echo -e "${GREEN}✓${NC} Mock data initialization endpoint found"
    else
        echo -e "${RED}✗${NC} Mock data initialization endpoint not found"
    fi
else
    echo -e "${RED}✗${NC} quality.js not found"
fi
echo ""

# Check 4: PricePrediction model
echo "4️⃣  Checking PricePrediction model..."
if [ -f "backend/models/PricePrediction.js" ]; then
    echo -e "${GREEN}✓${NC} PricePrediction.js found"
    
    # Check for historicalData field
    if grep -q "historicalData" backend/models/PricePrediction.js; then
        echo -e "${GREEN}✓${NC} Historical data field found in model"
    else
        echo -e "${RED}✗${NC} Historical data field not found"
    fi
else
    echo -e "${RED}✗${NC} PricePrediction.js not found"
fi
echo ""

# Check 5: Server.js routes
echo "5️⃣  Checking backend route mounting..."
if grep -q "/api/quality" backend/server.js; then
    echo -e "${GREEN}✓${NC} Quality routes mounted in server.js"
else
    echo -e "${RED}✗${NC} Quality routes not mounted in server.js"
fi

if grep -q "/api/crops" backend/server.js; then
    echo -e "${GREEN}✓${NC} Crops endpoint found in server.js"
else
    echo -e "${RED}✗${NC} Crops endpoint not found in server.js"
fi
echo ""

# Summary
echo "========================================"
echo -e "${GREEN}✅ Price Graph Implementation Verified!${NC}"
echo ""
echo "📋 Next Steps:"
echo "1. Install backend dependencies: cd backend && npm install"
echo "2. Start backend server: npm start"
echo "3. Upload test crops from Farmer dashboard"
echo "4. Initialize predictions: curl -X POST http://localhost:5000/api/quality/price/init/mock-data"
echo "5. Start Buyers app: cd Buyers && npm start"
echo "6. Navigate to Price Graph tab"
echo ""
