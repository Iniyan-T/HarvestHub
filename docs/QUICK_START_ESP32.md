# Quick Start: ESP32 to Dashboard

## 5-Minute Setup

### Step 1: Upload ESP32 Code (2 minutes)

1. Open your ESP32 code (provided earlier)
2. Update WiFi credentials:
   ```cpp
   const char* ssid = "your_wifi_name";
   const char* password = "your_wifi_password";
   ```
3. Upload to ESP32
4. Open Serial Monitor (115200 baud)
5. Wait for "WiFi Connected" and "Upload OK"

### Step 2: Configure Web App (2 minutes)

1. Create `.env` file in `Farmer/` folder:
   ```env
   VITE_FIREBASE_DATABASE_URL=https://agri-48613-default-rtdb.firebaseio.com
   ```

2. Install dependencies:
   ```bash
   cd Farmer
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

### Step 3: View Dashboard (1 minute)

1. Open browser: `http://localhost:5173`
2. Click "Storage" in navigation
3. Watch real-time data appear!

## Expected Results

### ESP32 Serial Output
```
WiFi Connected
Sending Data...
Upload OK
{"temperature":25.5,"humidity":65.2,"CO2":450...}
```

### Web Dashboard
- ✅ **ESP32 Connected** badge (green)
- 📊 Real-time temperature chart
- 📊 Real-time humidity chart
- 💨 Gas level cards (5 gases)
- ⚠️ Alerts (if thresholds exceeded)
- 💡 Recommendations

## Test Without Hardware

Want to see the UI without ESP32?

1. Push test data to Firebase manually:
   ```bash
   curl -X PUT https://agri-48613-default-rtdb.firebaseio.com/sensor.json \
   -d '{"temperature":22,"humidity":60,"CO2":400,"ammonia":5,"methane":45,"ethylene":8,"H2S":3}'
   ```

2. Dashboard will update instantly!

## Troubleshooting

### "No Connection" Badge
- Check ESP32 Serial Monitor for errors
- Verify Firebase URL in ESP32 code
- Check WiFi signal strength

### "No sensor data available"
- Wait 5-10 seconds after ESP32 boots
- Verify data appears in Firebase Console
- Check browser DevTools Console for errors

### Sensors showing NaN
- DHT11: Check wiring on GPIO 4
- MQ135: Allow 24-48 hour warm-up
- Reset ESP32 and try again

## Next Steps

1. ✅ Verify real-time updates (every 5 seconds)
2. 📈 Watch historical charts populate
3. 🔔 Test alerts by changing sensor conditions
4. 📝 Review recommendations
5. 💾 Export data for analysis

## Need Help?

Check the full integration guide: `ESP32_WEB_INTEGRATION.md`

---

**Tip**: Keep Serial Monitor open to debug sensor readings!
