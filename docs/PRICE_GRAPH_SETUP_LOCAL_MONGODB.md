# 🚀 Price Graph - Quick Start Guide

## ⚡ TL;DR (Fastest Setup - 2 Minutes)

### Windows Users - One Click Setup
```
Double-click: setup-price-graph.bat
```
Wait for all windows to open, then visit `http://localhost:5173`

### Mac/Linux Users - One Command Setup
```bash
bash setup-price-graph.sh
```

---

## 📋 Prerequisites

Before you start, make sure you have:

### ✅ Required
- **Node.js** v16+ ([Download](https://nodejs.org/))
- **MongoDB** (Choose one):
  - **Option A - Install**: [MongoDB Community](https://www.mongodb.com/try/download/community)
  - **Option B - Docker** (Easier): `docker run -d -p 27017:27017 mongo:latest`
  
### ✅ Already Done
- Backend API configured ✅
- Database models ready ✅
- Frontend components set up ✅
- Routes configured ✅

---

## 🎯 Step-by-Step Manual Setup (If Automated Script Fails)

### Step 1: Start MongoDB

**Windows:**
```powershell
mongod
```

**Mac:**
```bash
brew services start mongodb-community
```

**Linux or Docker:**
```bash
docker run -d -p 27017:27017 --name harvesthub-mongodb mongo:latest
```

**Verify MongoDB is running:**
```bash
# Should show something related to port 27017
netstat -an | findstr 27017  # Windows
lsof -i :27017               # Mac/Linux
```

### Step 2: Setup & Start Backend

```bash
# Navigate to backend
cd Farm/backend

# Install dependencies
npm install

# Start server with local MongoDB
npm start
```

**Expected Output:**
```
✅ MongoDB Connected
🚀 Server running on http://localhost:5000
🤖 AI Assistant initialized with Ollama
```

### Step 3: Initialize Price Predictions (New Terminal)

Wait 2 seconds after backend starts, then run:

```bash
curl -X POST http://localhost:5000/api/quality/price/init/mock-data
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Generated predictions for X crops",
  "generated": X
}
```

### Step 4: Start Frontend (New Terminal)

```bash
# Navigate to frontend
cd Farm/Buyers

# Install dependencies
npm install

# Start development server
npm run dev
```

**Expected Output:**
```
  VITE v5.0.0  ready in XXX ms

  Local:    http://localhost:5173/
```

### Step 5: View Price Graph

1. Open browser: **http://localhost:5173**
2. Login as Buyer (create account if needed)
3. Click **"Price Graph"** in the sidebar (📈 icon)
4. ✅ You should see graphs with crop prices!

---

## 📊 What You'll See

### Price Graph Features
- **Crop List**: All available crops from farmers
- **Interactive Chart**: 30-day historical + 7-day predictions
- **Price Trends**: Up/Down/Stable indicators
- **Confidence Levels**: 0-100% prediction accuracy
- **Best Sell Time**: Recommendations for farmers
- **Multi-Crop View**: Compare multiple crops

---

## 🔧 Troubleshooting

### Error: "Port 5000 already in use"
```bash
# Find process using port 5000
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # Mac/Linux

# Kill the process
taskkill /PID <PID> /F        # Windows
```

### Error: "MongoDB connection failed"
```bash
# Check if MongoDB is running
# Windows: mongod should show "waiting for connections on port 27017"
# Mac/Docker: ps aux | grep mongo or docker ps

# Start MongoDB if not running (see Step 1 above)
```

### Error: "Cannot find module 'mongoose'"
```bash
cd backend
npm install
```

### Error: "No crops available in Price Graph"
```bash
# Reinitialize price predictions
curl -X POST http://localhost:5000/api/quality/price/init/mock-data

# Or upload a crop from Farmer dashboard first
```

### Chart not displaying / Page blank
```bash
# Check browser console (F12 → Console tab)
# Restart frontend:
cd Buyers
npm run dev
```

---

## 🌐 API Endpoints (For Testing)

### Get All Price Predictions
```bash
curl http://localhost:5000/api/quality/price/list/all
```

### Get Price for Specific Crop
```bash
curl http://localhost:5000/api/quality/price/Rice
```

### Initialize Mock Data
```bash
curl -X POST http://localhost:5000/api/quality/price/init/mock-data
```

---

## 📱 Features Overview

### For Farmers 👨‍🌾
✅ See real-time market prices  
✅ Get predictions for next 7 days  
✅ Know best time to sell crops  
✅ View market trends  

### For Buyers 🛒
✅ Plan crop procurement  
✅ Track price movements  
✅ Compare multiple crops  
✅ Budget forecasting  

---

## 🎓 Sample Data

The system automatically generates mock data including:
- **Crops**: Rice, Wheat, Tomato, Potato, Carrot, Onion
- **Price Range**: ₹500 - ₹4000 per unit
- **Trends**: Up/Down/Stable forecasts
- **Confidence**: 60-100% accuracy levels
- **History**: 30 days of data
- **Forecast**: 7 days ahead

---

## 🔐 Default Credentials

**If you need to create a test account:**
- Email: `buyer@test.com`
- Password: `password123`
- Role: Buyer

---

## 📈 Performance Tips

💡 **For faster initial load:**
1. Keep MongoDB running in background
2. Don't refresh browser too often (API has rate limiting)
3. Close other CPU-intensive applications

💡 **For better predictions:**
1. Upload more crops from Farmer dashboard
2. Re-initialize price data: `POST /api/quality/price/init/mock-data`
3. The system improves with more data

---

## 📞 Need Help?

1. **Check Logs**: Look for error messages in terminal/browser console
2. **Verify Services**: All 3 should be running:
   - ✅ MongoDB (port 27017)
   - ✅ Backend (port 5000)
   - ✅ Frontend (port 5173)
3. **Restart Services**: Kill processes and restart them

---

## 🚀 Deploy to Production

When ready to deploy:

1. **Update MongoDB**:
   - Replace local connection with MongoDB Atlas
   - Update `.env` with cloud credentials

2. **Build Frontend**:
   ```bash
   cd Buyers
   npm run build
   ```

3. **Deploy Backend**:
   - Push to Heroku, AWS, DigitalOcean, etc.

4. **Update API URLs**:
   - Frontend: API_URL = production backend URL

---

## ✅ Checklist

Before considering setup complete:
- [ ] MongoDB running on port 27017
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] User logged in as Buyer
- [ ] "Price Graph" menu item clickable
- [ ] Chart displaying with crops
- [ ] No console errors (F12)

---

**🎉 Done! Happy Farming!**

Questions? Check the documentation files:
- `PRICE_GRAPH_IMPLEMENTATION_GUIDE.md` - Technical details
- `PRICE_GRAPH_TEST_GUIDE.md` - Complete testing guide
- `backend/API_DOCUMENTATION.md` - API reference

**Version**: 1.0.0  
**Last Updated**: February 6, 2026
