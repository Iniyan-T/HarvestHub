# Storage Monitoring Feature

## Overview
Real-time storage monitoring system with Firebase integration for tracking temperature, humidity, and gas levels to prevent crop spoilage.

## Features Implemented

### 1. Real-time Data Monitoring
- Firebase Realtime Database integration
- Live temperature and humidity tracking
- Gas level monitoring (CO₂, Ethylene, Ammonia, O₂)
- Automatic status updates

### 2. Interactive Charts
- Temperature chart with 24-hour history
- Humidity chart with 24-hour history
- Color-coded threshold zones
- Real-time data updates
- Tooltips with exact values

### 3. Gas Level Cards
- Individual monitoring for each gas type
- Visual progress bars
- Color-coded status indicators (🟢 Normal, ⚠️ Warning, 🔴 Critical)
- Threshold comparison

### 4. Alert System
- Real-time critical and warning alerts
- Dismissible notifications
- Alert categorization by severity
- Storage unit identification

### 5. Statistics Dashboard
- Active storage units count
- Critical alerts counter
- Warning alerts counter
- Average risk assessment

### 6. Spoilage Risk Assessment
- Multi-factor risk calculation
- Risk levels: Low, Medium, High, Critical
- AI-based recommendations
- Visual risk indicators

## File Structure

```
Farmer/src/app/
├── components/
│   ├── Storage.tsx                      # Main storage component
│   └── storage/
│       ├── TemperatureChart.tsx         # Temperature visualization
│       ├── HumidityChart.tsx            # Humidity visualization
│       ├── GasLevelCard.tsx             # Gas level display
│       ├── AlertPanel.tsx               # Alert notifications
│       └── StorageStats.tsx             # Summary statistics
└── services/
    └── firebase.service.ts              # Firebase integration
```

## Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Realtime Database
4. Copy your configuration

### 2. Configure Environment Variables
Create a `.env` file in the `Farmer` directory:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Database Structure

```json
{
  "storageData": {
    "farmerId": {
      "storage_unit_1": {
        "timestamp": 1706745600000,
        "temperature": {
          "value": 18,
          "status": "normal",
          "unit": "°C"
        },
        "humidity": {
          "value": 65,
          "status": "normal",
          "unit": "%"
        },
        "gases": {
          "co2": {
            "value": 450,
            "status": "normal",
            "threshold": 1000
          },
          "ethylene": {
            "value": 12,
            "status": "warning",
            "threshold": 10
          },
          "ammonia": {
            "value": 5,
            "status": "normal",
            "threshold": 25
          },
          "oxygen": {
            "value": 21,
            "status": "normal",
            "threshold": 19
          }
        },
        "spoilageRisk": "medium",
        "recommendations": [
          "Reduce ethylene levels by improving ventilation",
          "Monitor temperature - approaching upper limit"
        ],
        "storageUnit": "Rice Storage A"
      }
    }
  },
  "historicalData": {
    "farmerId": {
      "storage_unit_1": {
        "1706745600000": {
          "timestamp": 1706745600000,
          "temperature": 18.5,
          "humidity": 65.2
        }
      }
    }
  }
}
```

## Threshold Configuration

### Temperature
- **Normal**: 15-25°C
- **Warning**: 10-15°C or 25-30°C
- **Critical**: <10°C or >30°C

### Humidity
- **Normal**: 50-70%
- **Warning**: 40-50% or 70-80%
- **Critical**: <40% or >80%

### Gas Thresholds (Default)
- **CO₂**: 1000 ppm
- **Ethylene**: 10 ppm
- **Ammonia**: 25 ppm
- **Oxygen**: Minimum 19%

## Usage

### Testing with Mock Data
The feature includes mock data for testing. Toggle between mock and live data using the button in the header.

```tsx
// In Storage.tsx
const [useMockData, setUseMockData] = useState(true);
```

### Connecting to Real Sensors
1. Configure your Firebase Realtime Database
2. Update sensor data to Firebase from your hardware
3. Set `useMockData` to `false` in Storage.tsx
4. Data will automatically sync in real-time

### Arduino/ESP32 Integration Example

```cpp
#include <FirebaseESP32.h>

void sendSensorData() {
  FirebaseJson json;
  json.set("timestamp", millis());
  json.set("temperature/value", readTemperature());
  json.set("temperature/status", calculateStatus());
  json.set("humidity/value", readHumidity());
  // ... add other sensor readings
  
  Firebase.setJSON(firebaseData, 
    "/storageData/farmerId/storage_unit_1", json);
}
```

## Color Coding

### Status Colors
- 🟢 **Green (Normal)**: All parameters within optimal range
- ⚠️ **Yellow (Warning)**: Parameters approaching limits
- 🔴 **Red (Critical)**: Parameters exceeded safe limits

### Risk Levels
- **Low**: Minimal spoilage risk
- **Medium**: Monitor closely
- **High**: Immediate attention needed
- **Critical**: Emergency intervention required

## Features to Add (Future)

1. **Export Historical Data**
   - CSV export functionality
   - Date range selection
   - Multi-unit export

2. **Advanced Analytics**
   - Trend predictions
   - Spoilage likelihood forecasting
   - Energy consumption tracking

3. **Notifications**
   - Email alerts
   - SMS notifications
   - Push notifications

4. **Multi-User Support**
   - Role-based access
   - Team collaboration
   - Audit logs

5. **Integration with AI Assistant**
   - Gemini AI recommendations
   - Automated control suggestions
   - Pattern recognition

## Technologies Used

- **React**: UI framework
- **TypeScript**: Type safety
- **Firebase Realtime Database**: Real-time data sync
- **Recharts**: Data visualization
- **Tailwind CSS**: Styling
- **Lucide React**: Icons
- **date-fns**: Date formatting

## Dependencies

```json
{
  "firebase": "^10.13.0",
  "recharts": "^2.15.2",
  "date-fns": "^3.6.0",
  "lucide-react": "^0.487.0"
}
```

## Running the Application

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Troubleshooting

### Firebase Connection Issues
- Verify Firebase credentials in `.env`
- Check database rules in Firebase Console
- Ensure database URL is correct

### Chart Not Displaying
- Check if data exists in Firebase
- Verify data structure matches expected format
- Enable mock data for testing

### Real-time Updates Not Working
- Check Firebase connection
- Verify subscriptions are active
- Check browser console for errors

## Support

For issues or questions, refer to:
- Firebase Documentation: https://firebase.google.com/docs
- Recharts Documentation: https://recharts.org/
- React Documentation: https://react.dev/

## License

Part of HarvestHub Agricultural Management System
