# ESP32 Storage Monitoring System

## 📋 Project Overview
Real-time storage monitoring system using ESP32, DHT11 temperature/humidity sensor, and MQ135 gas sensor. Data is sent to Firebase Realtime Database and displayed on the HarvestHub web dashboard.

## 🔧 Hardware Requirements
- ESP32 Dev Module (ESP32-DevKitC or similar)
- DHT11 Temperature & Humidity Sensor
- MQ135 Gas Sensor
- Jumper wires
- Breadboard (optional)
- Micro-USB cable
- 5V power supply (or powered USB hub)

## 📐 Wiring Diagram

### DHT11 Connection
```
DHT11          ESP32
------         -----
VCC    ───►    3.3V
GND    ───►    GND
DATA   ───►    GPIO 4
```

### MQ135 Connection
```
MQ135          ESP32
------         -----
VCC    ───►    5V (or 3.3V)
GND    ───►    GND
A0     ───►    GPIO 34 (ADC1_6)
```

### Complete Circuit
```
                    ESP32 Dev Module
                  ┌──────────────────┐
                  │                  │
DHT11 VCC ───────►│ 3.3V             │
DHT11 GND ───────►│ GND              │
DHT11 DATA ──────►│ GPIO 4           │
                  │                  │
MQ135 VCC ───────►│ 5V               │
MQ135 GND ───────►│ GND              │
MQ135 A0 ────────►│ GPIO 34 (ADC1_6) │
                  │                  │
USB Cable ───────►│ Micro-USB        │
                  └──────────────────┘
```

## ⚙️ Configuration

### 1. Update WiFi Credentials
Edit `src/main.cpp`:
```cpp
const char* WIFI_SSID = "YourWiFiName";        // Your WiFi SSID
const char* WIFI_PASSWORD = "YourWiFiPassword"; // Your WiFi password
```

### 2. Update Firebase Configuration
```cpp
const char* FIREBASE_HOST = "your-project.firebaseio.com";  // Without https://
const String FARMER_ID = "507f1f77bcf86cd799439011";        // Your farmer ID
const String STORAGE_UNIT_ID = "storage_unit_1";            // Storage unit ID
```

### 3. Update COM Port
Edit `platformio.ini`:
```ini
monitor_port = COM3  ; Change to your actual COM port
upload_port = COM3   ; Change to your actual COM port
```

## 🚀 Getting Started

### Step 1: Install VS Code & PlatformIO
Follow the complete guide in `ESP32_SETUP_GUIDE.md`

### Step 2: Open Project
1. Open VS Code
2. Click "Open Folder"
3. Select the `esp32-storage` folder
4. PlatformIO will detect the project automatically

### Step 3: Install Dependencies
Dependencies are auto-installed on first build:
- DHT sensor library (Adafruit)
- Adafruit Unified Sensor
- ArduinoJson

### Step 4: Configure Settings
1. Update WiFi credentials in `src/main.cpp`
2. Update Firebase URL in `src/main.cpp`
3. Update COM port in `platformio.ini`

### Step 5: Build
- Click the checkmark (✓) icon on the bottom toolbar
- Or press `Ctrl+Alt+B`

### Step 6: Upload
1. Connect ESP32 via USB
2. Click the arrow (→) icon on the bottom toolbar
3. Or press `Ctrl+Alt+U`
4. Hold BOOT button if upload fails

### Step 7: Monitor Serial Output
- Click the plug (🔌) icon on the bottom toolbar
- Or press `Ctrl+Alt+S`

## 📊 Expected Output

```
╔════════════════════════════════════════╗
║  HarvestHub Storage Monitoring System  ║
║  ESP32 + DHT11 + MQ135 + Firebase     ║
╚════════════════════════════════════════╝

🌡️ Initializing DHT11 sensor...
✅ DHT11 initialized
💨 Initializing MQ135 sensor...
✅ MQ135 initialized

🧪 Testing sensors...
  Temperature: 25.0°C
  Humidity: 60.0%
  Gas (raw): 1024

🌐 Connecting to WiFi...
SSID: YourWiFiName
.....
✅ WiFi connected!
📍 IP Address: 192.168.1.100
📶 Signal Strength: -45 dBm

🎯 System ready! Starting measurements...
═══════════════════════════════════════

📊 Reading #1
⏰ Time: 10s
┌─────────────────────────────────────┐
│         SENSOR READINGS             │
├─────────────────────────────────────┤
│ 🌡️  Temperature: 25.0°C
│ 💧 Humidity:    60.0%
│ 💨 Gas (raw):   1024
│ 💨 CO2 (est):   450.0 ppm
│ 💨 C2H4 (est):  22.5 ppm
└─────────────────────────────────────┘

📤 Uploading to Firebase...
📡 Sending to Firebase: https://...
📦 Payload: {"timestamp":10000,"storageUnit":"Rice Storage A",...}
✅ Firebase response code: 200
📥 Response: {"name":"..."}
✅ Data uploaded successfully!
═══════════════════════════════════════

⏱️  Next reading in 10 seconds...
```

## 🔍 Troubleshooting

### WiFi Connection Issues
```
❌ WiFi connection failed!
```
**Solutions:**
- Check SSID and password
- ESP32 only supports 2.4GHz WiFi (not 5GHz)
- Move closer to router
- Restart ESP32

### DHT11 Reading Failed
```
❌ Failed to read temperature from DHT11!
```
**Solutions:**
- Check wiring: VCC→3.3V, DATA→GPIO4, GND→GND
- Add 10kΩ pull-up resistor between DATA and VCC
- Wait 2 seconds after power-on
- Try different GPIO pin

### Firebase Upload Failed
```
❌ Firebase error: -1
```
**Solutions:**
- Check Firebase URL format (no `https://`)
- Verify Firebase database rules allow writes
- Check internet connection
- Verify WiFi is connected

### Upload Failed
```
A fatal error occurred: Failed to connect to ESP32
```
**Solutions:**
- Hold BOOT button during upload
- Check USB cable (must be data cable)
- Try different USB port
- Lower upload speed to 115200 in platformio.ini
- Install/update USB drivers

## 📈 Data Format

### Firebase Structure
```json
{
  "storageData": {
    "507f1f77bcf86cd799439011": {
      "storage_unit_1": {
        "timestamp": 1706745600000,
        "storageUnit": "Rice Storage A",
        "temperature": {
          "value": 25.0,
          "status": "normal",
          "unit": "°C"
        },
        "humidity": {
          "value": 60.0,
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
          }
        },
        "spoilageRisk": "low",
        "recommendations": []
      }
    }
  }
}
```

## 🎯 Sensor Specifications

### DHT11
- Temperature Range: 0-50°C
- Temperature Accuracy: ±2°C
- Humidity Range: 20-90% RH
- Humidity Accuracy: ±5% RH
- Sampling Rate: 1Hz (once per second)

### MQ135
- Detection: CO2, Ammonia, Alcohol, Benzene, Smoke
- Detection Range: 10-1000ppm
- Heating Time: 24-48 hours for stability
- Operating Voltage: 5V
- Load Resistance: 20kΩ

## 🔧 Customization

### Change Reading Interval
```cpp
#define READING_INTERVAL 10000  // Change to 5000 for 5 seconds
```

### Change Sensor Pins
```cpp
#define DHTPIN 4      // Change to your GPIO pin
#define MQ135PIN 34   // Change to your ADC pin
```

### Add More Storage Units
1. Copy the project folder
2. Update `STORAGE_UNIT_ID` and `STORAGE_UNIT_NAME`
3. Upload to different ESP32 boards

### Calibrate MQ135
```cpp
// Measure sensor in clean air
int cleanAirValue = analogRead(MQ135PIN);
// Adjust conversion formula
float ppm = (analogValue - cleanAirValue) * calibrationFactor;
```

## 📚 Resources

### Documentation
- ESP32 Arduino Core: https://docs.espressif.com/projects/arduino-esp32/
- DHT Library: https://github.com/adafruit/DHT-sensor-library
- Firebase REST API: https://firebase.google.com/docs/database/rest/start
- PlatformIO: https://docs.platformio.org/

### Datasheets
- ESP32: https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf
- DHT11: https://www.mouser.com/datasheet/2/758/DHT11-Technical-Data-Sheet-Translated-Version-1143054.pdf
- MQ135: https://www.winsen-sensor.com/d/files/PDF/Semiconductor%20Gas%20Sensor/MQ135%20(Ver1.4)%20-%20Manual.pdf

## 🔐 Security Notes

### For Production:
1. **Enable Firebase Authentication**
   ```cpp
   const char* FIREBASE_AUTH = "your-secret-token";
   ```

2. **Update Firebase Rules**
   ```json
   {
     "rules": {
       "storageData": {
         "$farmerId": {
           ".write": "auth != null && auth.uid == $farmerId",
           ".read": "auth != null && auth.uid == $farmerId"
         }
       }
     }
   }
   ```

3. **Use HTTPS** (already implemented)

4. **Store credentials securely**
   - Don't commit WiFi passwords to Git
   - Use environment-specific config files

## 📝 Development Tips

### Serial Debugging
```cpp
Serial.println("Debug message");
Serial.print("Value: ");
Serial.println(value);
```

### Check WiFi Status
```cpp
if (WiFi.status() == WL_CONNECTED) {
  // WiFi is connected
}
```

### Check Sensor Values
```cpp
if (isnan(temperature)) {
  // Invalid reading
}
```

### Monitor Memory
```cpp
Serial.print("Free heap: ");
Serial.println(ESP.getFreeHeap());
```

## 🎓 Next Steps

1. ✅ Test with mock sensor data
2. ✅ Verify Firebase uploads
3. ✅ Check HarvestHub dashboard
4. ✅ Calibrate MQ135 sensor (24-48 hours pre-heating)
5. ✅ Add error handling
6. ✅ Implement OTA updates
7. ✅ Add deep sleep for battery operation
8. ✅ Deploy multiple units

## 📞 Support

For issues:
1. Check Serial Monitor output
2. Verify wiring connections
3. Test WiFi separately
4. Check Firebase console
5. Review troubleshooting section

## 📄 License

Part of HarvestHub Agricultural Management System
