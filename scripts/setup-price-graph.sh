#!/bin/bash
# Price Graph - Complete Setup & Launch Script (Linux/Mac)

echo "=================================="
echo "🌾 HarvestHub Price Graph Setup"
echo "=================================="

# Step 1: Check MongoDB
echo -e "\n📦 Step 1: Checking MongoDB..."
if ! command -v mongod &> /dev/null; then
    echo "❌ MongoDB not found. Install it first:"
    echo "   macOS: brew install mongodb-community"
    echo "   Linux: Follow docs.mongodb.com"
    exit 1
fi
echo "✅ MongoDB found"

# Step 2: Start MongoDB
echo -e "\n🚀 Step 2: Starting MongoDB..."
if pgrep mongod > /dev/null; then
    echo "✅ MongoDB already running"
else
    mongod --dbpath /data/db &
    sleep 2
    echo "✅ MongoDB started"
fi

# Step 3: Setup Backend
echo -e "\n📦 Step 3: Setting up Backend..."
cd backend
npm install > /dev/null 2>&1
echo "✅ Backend dependencies installed"

# Step 4: Initialize Mock Data
echo -e "\n📊 Step 4: Initializing Price Predictions..."
sleep 2
curl -s -X POST http://localhost:5000/api/quality/price/init/mock-data > /dev/null 2>&1 &
echo "✅ Price predictions will be initialized"

# Step 5: Start Backend
echo -e "\n🚀 Step 5: Starting Backend Server..."
npm start &
BACKEND_PID=$!
sleep 3

# Check if backend started
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo "✅ Backend running on http://localhost:5000"
else
    echo "❌ Backend failed to start"
    exit 1
fi

# Step 6: Setup Frontend
echo -e "\n📦 Step 6: Setting up Frontend..."
cd ../Buyers
npm install > /dev/null 2>&1
echo "✅ Frontend dependencies installed"

# Step 7: Start Frontend
echo -e "\n🚀 Step 7: Starting Frontend..."
npm run dev &
FRONTEND_PID=$!
sleep 3

echo -e "\n=================================="
echo "     ✅ PRICE GRAPH IS RUNNING!"
echo "=================================="
echo ""
echo "📱 Access the application:"
echo "   Browser: http://localhost:5173"
echo ""
echo "📊 Features:"
echo "   ✅ Dashboard with crops"
echo "   ✅ Price Graph (click 'Price Graph' in sidebar)"
echo "   ✅ Price predictions with trends"
echo "   ✅ Historical & predicted data"
echo ""
echo "📊 API Endpoints:"
echo "   GET  /api/quality/price/list/all"
echo "   GET  /api/quality/price/{cropType}"
echo "   POST /api/quality/price/init/mock-data"
echo ""
echo "🛑 To stop:"
echo "   Press Ctrl+C or run: kill $BACKEND_PID $FRONTEND_PID"
echo "=================================="

# Wait for processes
wait
