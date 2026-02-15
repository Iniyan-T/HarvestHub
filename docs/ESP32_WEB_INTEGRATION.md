# ESP32 to Web App Integration Guide

## Overview
This guide explains how the ESP32 sensor data flows from your hardware to the web application's Storage dashboard.

## Architecture

```
ESP32 (DHT11 + MQ135)
         ↓
    WiFi Network
         ↓
Firebase Realtime Database
         ↓
  Web Application (React)
         ↓
    Storage Dashboard
```

## ESP32 Configuration

### WiFi Credentials
```cpp
const char* ssid = "rpi";
const char* password = "rpi12345678";
```

### Firebase Configuration
```cpp
const char* firebaseHost = "https://agri-48613-default-rtdb.firebaseio.com";
const char* firebaseAuth = "FRpJ90gTLsqtbynawN7dI9Wx5upRXmypwAB3xZ1T";
```

### Data Upload Path
The ESP32 uploads sensor data to: `/sensor.json`

### Data Structure
```json
{
  "temperature": 25.5,
  "humidity": 65.2,
  "CO2": 450.0,
  "ammonia": 5.3,
  "methane": 45.0,
  "ethylene": 8.2,
  "H2S": 3.1
}
```

## Web Application Configuration

### Firebase Setup (.env)
Create `Farmer/.env` file with:
```env
VITE_FIREBASE_API_KEY=AIzaSyDEaLKnPxkqL8VXJk1JvZqY3h3Z7L0N4Qo
VITE_FIREBASE_AUTH_DOMAIN=agri-48613.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://agri-48613-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=agri-48613
VITE_FIREBASE_STORAGE_BUCKET=agri-48613.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

### Key Components

#### 1. Firebase Service (`firebase.service.ts`)
**Purpose**: Handles real-time data subscription from Firebase

**Key Functions**:
- `subscribeToESP32Data()`: Listens to `/sensor` path for real-time updates
- `transformESP32Data()`: Converts raw sensor data to app format
- `subscribeToESP32HistoricalData()`: Builds historical data for charts

**Data Transformation**:
```typescript
// Raw ESP32 Data
{
  temperature: 25.5,
  humidity: 65.2,
  CO2: 450,
  ammonia: 5.3,
  // ...
}

// Transformed to
{
  timestamp: 1738425600000,
  temperature: { value: 25.5, status: 'normal', unit: '°C' },
  humidity: { value: 65.2, status: 'normal', unit: '%' },
  gases: {
    co2: { value: 450, status: 'normal', threshold: 1000 },
    // ...
  },
  spoilageRisk: 'low',
  recommendations: ['All parameters within normal range'],
  storageUnit: 'Main Storage'
}
```

#### 2. Storage Component (`Storage.tsx`)
**Purpose**: Main dashboard displaying sensor data

**Features**:
- Real-time connection status (Connecting/Connected/Error)
- Temperature and humidity charts
- Gas level monitoring (5 gases)
- Automated alerts based on thresholds
- Spoilage risk assessment
- Actionable recommendations

#### 3. Chart Components
- `TemperatureChart.tsx`: 24-hour temperature trend
- `HumidityChart.tsx`: 24-hour humidity trend
- Uses Recharts library for visualization

#### 4. Alert System (`AlertPanel.tsx`)
Automatically generates alerts when:
- Temperature outside 15-25°C range
- Humidity outside 50-70% range
- Gas levels exceed thresholds
- Spoilage risk is high/critical

## Sensor Thresholds

### Temperature
- **Normal**: 15-25°C (optimal storage)
- **Warning**: 10-30°C (approaching limits)
- **Critical**: <10°C or >30°C (immediate action needed)

### Humidity
- **Normal**: 50-70% (prevents mold and drying)
- **Warning**: 40-80% (monitor closely)
- **Critical**: <40% or >80% (spoilage risk)

### Gas Levels (PPM)

| Gas | Normal | Warning | Critical | Notes |
|-----|--------|---------|----------|-------|
| **CO₂** | 0-1000 | 1000-1500 | >1500 | High levels reduce oxygen |
| **Ammonia (NH₃)** | 0-25 | 25-50 | >50 | Indicates decomposition |
| **Methane (CH₄)** | 0-100 | 100-200 | >200 | Fermentation byproduct |
| **Ethylene (C₂H₄)** | 0-10 | 10-20 | >20 | Accelerates ripening |
| **H₂S** | 0-10 | 10-20 | >20 | Sulfur-producing bacteria |

## Spoilage Risk Calculation

The system calculates overall spoilage risk based on:

1. **Critical Parameters**: Any 2+ critical = Critical Risk
2. **Warning Parameters**: Any 1 critical OR 3+ warnings = High Risk
3. **Mixed Status**: 1+ warning = Medium Risk
4. **All Normal**: Low Risk

## Real-Time Updates

### Update Frequency
- ESP32 sends data every **5 seconds** (configurable)
- Firebase triggers instant updates to connected clients
- No polling required - true real-time

### Data Flow Timeline
```
0ms     ESP32 reads sensors
50ms    Calculates gas PPM values
100ms   HTTP PUT to Firebase
150ms   Firebase stores data
200ms   Web app receives onValue() callback
250ms   UI updates with new data
```

## Running the Application

### 1. Start ESP32
```bash
# Upload code to ESP32 via PlatformIO
pio run --target upload
pio device monitor
```

### 2. Start Web Application
```bash
cd Farmer
npm install
npm run dev
```

### 3. Access Dashboard
Navigate to: `http://localhost:5173/storage`

## Troubleshooting

### No Data Appearing

**Check ESP32**:
1. Open Serial Monitor (115200 baud)
2. Verify "WiFi Connected" message
3. Check for "Upload OK" messages
4. Verify sensor readings are not `nan`

**Check Firebase**:
1. Go to Firebase Console
2. Navigate to Realtime Database
3. Look for `/sensor` node
4. Verify data is updating

**Check Web App**:
1. Open browser DevTools Console
2. Look for "Subscribing to ESP32 sensor data..."
3. Check for "Received sensor data:" messages
4. Verify no Firebase authentication errors

### Connection Status Shows "No Connection"

**Possible causes**:
1. Firebase credentials mismatch
2. Database rules not set to public
3. No data at `/sensor` path yet
4. Network connectivity issues

**Solution**:
```javascript
// Firebase Database Rules (set to public for testing)
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### Sensors Reading NaN

**DHT11 Issues**:
- Check 3.3V power connection
- Verify data pin (GPIO 4)
- Add 10kΩ pull-up resistor
- Wait 2 seconds after boot

**MQ135 Issues**:
- Warm-up time: 24-48 hours for accurate readings
- Check analog pin (GPIO 34)
- Verify 5V power supply
- Calibrate R0 value in fresh air

## Data Visualization Features

### Charts
- **Time Range**: Last 24 hours
- **Update Interval**: Real-time (every 5 seconds)
- **Data Points**: Stored in browser memory
- **Persistence**: Reloads from last session

### Status Indicators
- **🟢 Green**: All parameters normal
- **🟡 Yellow**: Warning - monitoring required
- **🟠 Orange**: High risk - action recommended
- **🔴 Red**: Critical - immediate action needed

### Recommendations Engine
Automatically suggests actions:
- Temperature adjustments
- Ventilation improvements
- Humidity control
- Product separation
- Inspection requirements

## Future Enhancements

### Planned Features
1. **Historical Data Storage**: Save data to Firebase for long-term analysis
2. **SMS/Email Alerts**: Notifications for critical conditions
3. **Multiple Storage Units**: Support for multiple ESP32 devices
4. **Data Export**: CSV/Excel export for reports
5. **AI Predictions**: Machine learning for spoilage prediction
6. **Mobile App**: React Native companion app

### Optimization Opportunities
1. **Calibration Interface**: Web-based sensor calibration
2. **Custom Thresholds**: User-defined alert levels
3. **Data Aggregation**: Hourly/daily averages
4. **Offline Mode**: Local data caching
5. **Power Management**: Deep sleep between readings

## Security Considerations

### Current Setup (Development)
- Firebase rules set to public read/write
- API key exposed in frontend code
- No user authentication

### Production Recommendations
1. **Firebase Security Rules**:
   ```json
   {
     "rules": {
       "sensor": {
         ".read": "auth != null",
         ".write": "auth.token.admin === true"
       }
     }
   }
   ```

2. **ESP32 Authentication**:
   - Use Firebase Service Account
   - Rotate auth tokens regularly
   - Implement HTTPS certificates

3. **Web App Security**:
   - Enable Firebase Authentication
   - Use environment variables
   - Implement CORS policies
   - Add rate limiting

## Hardware Specifications

### ESP32 Dev Module
- **Chip**: ESP32-WROOM-32
- **Flash**: 4MB
- **WiFi**: 2.4 GHz 802.11 b/g/n
- **Analog Pins**: 18 (12-bit ADC)
- **Digital Pins**: 34 (6 input-only)

### DHT11 Sensor
- **Temperature Range**: 0-50°C (±2°C)
- **Humidity Range**: 20-80% RH (±5%)
- **Sampling Rate**: 1 Hz (1 reading/second)
- **Power**: 3.3V-5V (5-20mA)

### MQ135 Sensor
- **Detects**: CO₂, NH₃, benzene, alcohol, smoke
- **Warm-up**: 24-48 hours for accuracy
- **Power**: 5V (150mA)
- **Output**: Analog voltage (0-5V)

## Cost Breakdown

| Component | Price (USD) | Quantity |
|-----------|-------------|----------|
| ESP32 Dev Module | $8 | 1 |
| DHT11 Sensor | $2 | 1 |
| MQ135 Gas Sensor | $5 | 1 |
| Breadboard | $3 | 1 |
| Jumper Wires | $2 | 1 set |
| USB Cable | $3 | 1 |
| **Total** | **$23** | |

## Support Resources

- **ESP32 Documentation**: https://docs.espressif.com/
- **Firebase Docs**: https://firebase.google.com/docs
- **DHT Library**: https://github.com/adafruit/DHT-sensor-library
- **MQ135 Guide**: https://www.instructables.com/MQ135-Gas-Sensor/
- **React Documentation**: https://react.dev/

## Credits

- **Hardware**: ESP32 by Espressif Systems
- **Sensors**: DHT11 by Aosong, MQ135 by Hanwei Electronics
- **Cloud**: Firebase by Google
- **Frontend**: React + Vite + Tailwind CSS
- **Charts**: Recharts library

---

**Version**: 1.0.0  
**Last Updated**: February 1, 2026  
**Author**: HarvestHub Team
