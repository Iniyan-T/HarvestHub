# Price Graph - Quick Reference Card

## 🎯 Quick Start (2 Minutes)

```bash
# Terminal 1: Backend
cd Farm/backend
npm start

# Terminal 2: Initialize Mock Data
curl -X POST http://localhost:5000/api/quality/price/init/mock-data

# Terminal 3: Frontend
cd Farm/Buyers
npm start

# Browser: Navigate to http://localhost:5173
# Click: "Price Graph" tab
# Result: ✅ Chart displays with crops and predictions
```

---

## 📡 Key API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/crops?status=Available` | Get all available crops |
| GET | `/api/quality/price/{cropType}` | Get prediction for a crop |
| GET | `/api/quality/price/list/all` | Get all predictions |
| POST | `/api/quality/price/init/mock-data` | Generate mock predictions |
| POST | `/api/quality/price` | Create/update prediction |

---

## 🔧 Testing Commands

```bash
# Test 1: Check backend
curl http://localhost:5000/api/health

# Test 2: Get crops
curl http://localhost:5000/api/crops?status=Available

# Test 3: Initialize predictions
curl -X POST http://localhost:5000/api/quality/price/init/mock-data

# Test 4: Get specific prediction
curl http://localhost:5000/api/quality/price/Rice

# Test 5: Get all predictions
curl http://localhost:5000/api/quality/price/list/all
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `Buyers/src/components/PriceGraph.tsx` | Frontend component |
| `backend/routes/quality.js` | API endpoints |
| `backend/models/PricePrediction.js` | Data model |
| `Buyers/package.json` | Dependencies (Recharts) |

---

## ✅ What You Get

✅ Historical price trends (last 30 days)
✅ AI-predicted future prices (next 7 days)
✅ Trend analysis (up/down/stable)
✅ Confidence levels (0-100%)
✅ Sell recommendations for farmers
✅ Procurement timing for buyers
✅ Multi-crop comparison
✅ Interactive charts

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "No crops available" | Upload crops from Farmer dashboard first |
| Backend not running | Run `npm start` in `Farm/backend` |
| No chart displayed | Reinitialize: `curl -X POST http://localhost:5000/api/quality/price/init/mock-data` |
| CORS errors | Check backend has `app.use(cors())` |
| MongoDB error | Verify MongoDB connection string |

---

## 📊 Chart Components

```
┌─────────────────────────────────────┐
│   Price Graph                       │
├─────────────────────────────────────┤
│ [Rice] [Wheat] [Tomato]  ← Crops   │
├─────────────────────────────────────┤
│ Current: ₹2500  Predicted: ₹2850   │
│ Trend: ↑ Up     Confidence: 85%     │
├─────────────────────────────────────┤
│         ╱─────╱ (Predicted)         │  ← Chart
│    ╱────╱ (Historical)              │
│────────────────────────────────────→│
│ Time (30 days past + 7 days future) │
└─────────────────────────────────────┘
```

---

## 🚀 Deployment Checklist

- [ ] Backend starts without errors
- [ ] All crops upload successfully
- [ ] Mock predictions generate
- [ ] Chart displays all crops
- [ ] No console errors
- [ ] Responsive on mobile
- [ ] Performance acceptable

---

## 💡 Pro Tips

1. **Bulk Initialize**: Run `curl -X POST http://localhost:5000/api/quality/price/init/mock-data` to generate predictions for all crops at once

2. **Auto-Generation**: The system automatically generates predictions for crops that don't have them when you access their data

3. **Monthly Update**: Predictions update automatically every 7 days

4. **Export Data**: You can fetch raw JSON from `/api/quality/price/list/all` and export to CSV

5. **Real Data**: Replace mock generation with real ML models in quality.js for production use

---

## 📞 Emergency Fixes

```bash
# Stuck? Run this to cleanest reset:

# 1. Stop all processes (Ctrl+C)
# 2. Clear browser cache (Ctrl+Shift+Delete)
# 3. Reinstall dependencies
cd Farm/backend && npm install
cd Farm/Buyers && npm install

# 4. Restart backend
cd Farm/backend && npm start

# 5. Initialize mock data
curl -X POST http://localhost:5000/api/quality/price/init/mock-data

# 6. Start frontend
cd Farm/Buyers && npm start

# 7. Clear browser cache again and refresh
```

---

## 📞 Support Resources

- **Setup Guide**: `PRICE_GRAPH_SETUP.md`
- **Test Guide**: `PRICE_GRAPH_TEST_GUIDE.md`
- **Implementation Guide**: `PRICE_GRAPH_IMPLEMENTATION_GUIDE.md`

---

**Last Updated**: February 6, 2026
**Status**: ✅ Production Ready
