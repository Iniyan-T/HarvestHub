# Predictive Price Graph Implementation Guide

## Overview
The predictive price graph should display historical price trends and future price predictions for **crops that farmers have actually uploaded and updated** in the system.

## Current Architecture

### 1. **Crop Data Flow**
```
Farmer uploads crop → Crop stored in DB → Available in /api/crops endpoint
```

**Key Endpoint:** `GET /api/crops?status=Available`
- Returns all crops uploaded by farmers with status="Available"
- Dashboard already extracts **unique cropName** values from this endpoint
- Examples: "Rice", "Wheat", "Tomato", "Potato", etc.

### 2. **Price Prediction Architecture**
```
cropType (e.g., "Rice") → PricePrediction model → Historical + Predicted data
```

**Database Model:** `PricePrediction`
- Indexed by `cropType` (matches farmer's `cropName`)
- Contains:
  - `historicalData[]` - Array of {date, price} pairs
  - `currentPrice` - Current market price
  - `predictedPrice` - AI-predicted future price
  - `trend` - "up", "down", or "stable"
  - `confidence` - Prediction confidence (0-100%)
  - `bestSellTime` - Recommendation for farmers

### 3. **API Endpoints**

#### Get Available Crops (Currently Uploaded by Farmers)
```
GET /api/crops?status=Available

Response:
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "cropName": "Rice",
      "quantity": 500,
      "price": 2500,
      "farmerId": "...",
      ...
    },
    {
      "_id": "...",
      "cropName": "Wheat",
      "quantity": 300,
      "price": 2000,
      ...
    }
  ]
}
```

#### Get Price Prediction for a Specific Crop
```
GET /api/quality/price/:cropType

Example: GET /api/quality/price/Rice

Response:
{
  "success": true,
  "data": {
    "cropType": "Rice",
    "currentPrice": 2500,
    "predictedPrice": 2800,
    "trend": "up",
    "confidence": 85,
    "bestSellTime": "Next Week",
    "data": {
      "historicalData": [
        { "date": "2026-01-01", "price": 2300 },
        { "date": "2026-01-08", "price": 2400 },
        { "date": "2026-01-15", "price": 2500 }
      ]
    }
  }
}
```

## Implementation Requirements

### Step 1: Fetch Unique Crop Types Uploaded by Farmers
```javascript
// In PriceGraph component
const response = await fetch('http://localhost:5000/api/crops?status=Available');
const crops = response.data;

// Extract unique crop names
const uniqueCropTypes = [...new Set(crops.map(crop => crop.cropName))];
// Result: ["Rice", "Wheat", "Tomato", "Potato", ...]
```

### Step 2: Fetch Price Predictions for Each Crop
```javascript
// For each unique crop type
const predictions = await Promise.all(
  uniqueCropTypes.map(cropType =>
    fetch(`http://localhost:5000/api/quality/price/${cropType}`)
      .then(res => res.json())
  )
);
```

### Step 3: Prepare Data for Graph Display
```javascript
// Combine historical data from predictions
const graphData = predictions.map(pred => ({
  cropType: pred.data.cropType,
  historicalData: pred.data.data.historicalData, // [{date, price}, ...]
  predictedPrice: pred.data.predictedPrice,
  current_price: pred.data.currentPrice,
  trend: pred.data.trend,
  confidence: pred.data.confidence,
  bestSellTime: pred.data.bestSellTime
}));
```

### Step 4: Display in Graph
- **X-Axis:** Time (dates from historical data)
- **Y-Axis:** Crop prices
- **Historical Line:** Past price data (solid line)
- **Predicted Line:** Future prediction (dashed/colored differently)
- **Color:** Different color per crop for multi-crop view

## Example Visual Layout

```
╔═══════════════════════════════════════════════════════════╗
║         PREDICTIVE PRICE GRAPH                            ║
║  (Showing crops uploaded by farmers)                      ║
╠═══════════════════════════════════════════════════════════╣
║                                                            ║
║  Price (₹) │                 ╱───╱ (Predicted)           ║
║   4000     │             ╱───╱                            ║
║   3500     │         ╱───╱  ← Rice (Trend: Up ↑)          ║
║   3000     │     ╱───╱                                     ║
║   2500     │ ───╱ Rice Historical Data                     ║
║   2000     │ ─────────  Wheat (Trend: Stable →)            ║
║   1500     │     ╲──╲  ← Tomato (Trend: Down ↓)            ║
║   1000     │         ╲──╲                                  ║
║            │____________╲──╲____________________           ║
║            └──────────────────────────────────→ Time       ║
║                                                            ║
║  Legend:                                                   ║
║  ─── Historical Data      ╱── Predicted Data              ║
║  ─── Rice  ─── Wheat  ─── Tomato                          ║
║                                                            ║
╚═══════════════════════════════════════════════════════════╝
```

## Data Requirements

### What Crops Should Appear?
✅ **Crops that are currently in the database with status="Available"**

Examples of crops that farmers would have uploaded:
- Rice
- Wheat
- Tomato
- Potato
- Onion
- Corn
- Soybeans
- Cotton
- Sugar Cane
- Pulses (Dal)

### What Farmers Need?
- **Historical price trends:** To understand market behavior
- **Predicted future prices:** To decide optimal harvest/sell timing
- **Confidence levels:** To understand prediction reliability
- **Sell recommendations:** Best time window to sell for maximum profit

### What Buyers Need?
- **Price forecasts:** To plan procurement timing
- **Trend indicators:** To negotiate better prices
- **Volume availability:** Which crops are available and when
- **Quality patterns:** Correlate with price movements

## Implementation Status

| Component | Status | Location |
|-----------|--------|----------|
| Crop Upload | ✅ Complete | `Farmer/src/app/App.tsx` |
| Get All Crops | ✅ Complete | `GET /api/crops` |
| Price Prediction Model | ✅ Complete | `models/PricePrediction.js` |
| Get Price by Crop Type | ✅ Complete | `GET /quality/price/:cropType` |
| **Price Graph UI** | 🔴 **Placeholder** | `Buyers/src/components/PriceGraph.tsx` |

## Next Steps to Implement

### 1. Update PriceGraph Component
- Fetch all available crops from `/api/crops`
- Get unique crop types
- Fetch price predictions for each
- Render interactive chart (use Chart.js, Recharts, or similar)

### 2. Add Chart Library
```bash
npm install recharts  # or chart.js or plotly.js
```

### 3. Display Format Options
- **Single Crop View:** Dropdown to select one crop to analyze deeply
- **Multi-Crop Comparison:** Show all crops on same graph
- **Tabbed View:** Separate tabs for each crop
- **Time Range Selector:** Last 30 days, 90 days, 1 year

### 4. Add Interactive Features
- Hover to see exact price values
- Toggle between different crops
- Export prediction data
- Share predictions with other buyers
- Set price alerts (notify when predicted price reaches certain threshold)

## Technical Notes

- **Crop Type Matching:** `cropName` field in Crop model matches `cropType` in PricePrediction
- **Status Filter:** Only show crops with `status="Available"` or `status="Reserved"`
- **Date Format:** Ensure consistent date formatting for graph display
- **Price Units:** All prices in same currency (₹/kg assumed)
- **Prediction Frequency:** Updates as configured in model (default: every 7 days)

## Success Criteria

✅ Graph displays real crops uploaded by farmers
✅ Historical price data visible for past trends
✅ Future predictions shown with confidence intervals
✅ Farmers can use to decide sell timing
✅ Buyers can use to plan procurement
✅ Multiple crops can be compared
