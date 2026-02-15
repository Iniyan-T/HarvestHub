# ESP32 Quick Start Guide - HarvestHub Storage Monitor

## 🚀 Quick Setup (5 Minutes)

### ✅ All Services Currently Running:
- ✅ Backend API: http://localhost:5000
- ✅ Buyer Portal: http://localhost:3000
- ✅ Farmer Portal: http://localhost:5173

### 📡 Network Configuration:
- **Your PC IP:** 10.88.168.184
- **WiFi Network:** gypsa
- **ESP32 Status:** Ready to connect

---

## 🔌 Hardware Setup

### Wiring Guide:
```
DHT11 Sensor:
├─ VCC  → ESP32 3.3V
├─ GND  → ESP32 GND
└─ DATA → ESP32 GPIO 4

MQ135 Gas Sensor:
├─ VCC  → ESP32 5V
├─ GND  → ESP32 GND
└─ A0   → ESP32 GPIO 34
```

### Visual Layout:
```
         ESP32
    ┌──────────────┐
    │              │
    │  GPIO 4  ●───┼──► DHT11 Data
    │  GPIO 34 ●───┼──► MQ135 A0
    │  3.3V    ●───┼──► DHT11 VCC
    │  5V      ●───┼──► MQ135 VCC
    │  GND     ●───┼──► All GND
    │              │
    │  USB     ●───┼──► Connect to PC
    └──────────────┘
```

---

## 💻 Software Setup

### Step 1: Open Project in VS Code
1. Open VS Code
2. Go to: File → Open Folder
3. Select: `C:\Users\iniya\Downloads\HarvestHub\Farm\esp32-storage`
4. PlatformIO will auto-detect the project

### Step 2: Check COM Port
1. Connect ESP32 via USB
2. Open Device Manager (Windows Key + X → Device Manager)
3. Expand "Ports (COM & LPT)"
4. Note your COM port (e.g., COM13)

### Step 3: Update COM Port (if needed)
Open `platformio.ini` and verify:
```ini
monitor_port = COM13
upload_port = COM13
```

### Step 4: Verify Configuration
The ESP32 code is already configured with:
- ✅ WiFi: gypsa
- ✅ Backend IP: 10.88.168.184
- ✅ Backend Port: 5000
- ✅ Farmer ID: 507f1f77bcf86cd799439011

---

## 🔨 Build & Upload

### Option 1: Using PlatformIO Icons (Bottom Bar)
1. **Build:** Click ✓ (checkmark icon)
2. **Upload:** Click → (right arrow icon)
3. **Monitor:** Click 🔌 (plug icon)

### Option 2: Using Terminal
```powershell
cd "c:\Users\iniya\Downloads\HarvestHub\Farm\esp32-storage"
pio run --target upload
pio device monitor
```

### Option 3: All-in-One Command
```powershell
cd "c:\Users\iniya\Downloads\HarvestHub\Farm\esp32-storage"
pio run --target upload && pio device monitor
```

---

## 📊 Monitor Real-Time Data

### Serial Monitor Output (You'll see):
```
🌾 ESP32 Storage Monitor Starting...
📡 Connecting to WiFi: gypsa
✅ WiFi Connected!
📍 IP Address: 10.88.168.XXX

📊 Sensor Readings:
🌡️  Temperature: 25.4°C
💧 Humidity: 62.3%
💨 CO2: 412.5 ppm
💨 Ammonia: 15.2 ppm
💨 Methane: 8.7 ppm
💨 Ethylene: 3.1 ppm

📤 Sending to Backend: http://10.88.168.184:5000/api/storage/readings
✅ Backend response: 200
📥 Response: {"success":true,"message":"Sensor data received"}
```

---

## 🎯 Testing the Complete Flow

### 1. Upload to ESP32:
```powershell
cd "c:\Users\iniya\Downloads\HarvestHub\Farm\esp32-storage"
pio run -t upload
```

### 2. Monitor Serial Output:
```powershell
pio device monitor
```

### 3. Check Backend API:
Open in browser: http://localhost:5000/api/storage/readings/507f1f77bcf86cd799439011

### 4. View on Farmer Portal:
Open: http://localhost:5173 → Navigate to Storage Monitor

---

## 🔍 Troubleshooting

### ❌ ESP32 Won't Connect to WiFi
**Solution:**
```cpp
// In main.cpp, verify:
const char* ssid = "gypsa";           // ✓ Correct
const char* password = "iniyan07";    // ✓ Correct
```

### ❌ Can't Find COM Port
**Solution:**
1. Install CH340/CP2102 USB drivers
2. Try different USB cable (data cable, not charge-only)
3. Try different USB port

### ❌ Backend Not Receiving Data
**Solution:**
1. Check PC IP hasn't changed: `ipconfig | findstr IPv4`
2. Update in main.cpp if needed:
   ```cpp
   const char* backendHost = "YOUR_NEW_IP";
   ```
3. Make sure PC and ESP32 are on same WiFi network
4. Disable Windows Firewall temporarily to test

### ❌ Upload Failed
**Solution:**
1. Press and hold BOOT button on ESP32
2. Click Upload
3. Release BOOT when "Connecting..." appears

---

## 📈 Data Flow Diagram

```
ESP32 Sensors
    │
    ├─► DHT11 → Temperature & Humidity
    ├─► MQ135 → CO2, Ammonia, Methane, Ethylene, H2S
    │
    ↓
WiFi Connection (gypsa)
    │
    ↓
Backend API (10.88.168.184:5000)
    │
    ├─► /api/storage/readings → Save to MongoDB
    ├─► Check thresholds → Create alerts if needed
    │
    ↓
Database (MongoDB Atlas)
    │
    ↓
Farmer Portal (localhost:5173)
    │
    └─► Display real-time storage conditions
```

---

## 🎉 Success Indicators

Your setup is working when you see:
- ✅ ESP32 serial monitor shows "✅ Backend response: 200"
- ✅ Backend terminal shows "📡 Received ESP32 data"
- ✅ API returns sensor data: http://localhost:5000/api/storage/readings/507f1f77bcf86cd799439011
- ✅ Farmer portal displays storage metrics

---

## 📝 Quick Commands Reference

```powershell
# Build only
pio run

# Upload to ESP32
pio run -t upload

# Monitor serial output
pio device monitor

# Build + Upload + Monitor
pio run -t upload && pio device monitor

# List connected devices
pio device list

# Clean build
pio run -t clean
```

---

## 🔐 Security Note

The current configuration is for local development. For production:
1. Use HTTPS for backend communication
2. Add authentication tokens
3. Secure Firebase credentials
4. Use environment variables for sensitive data

---

## 📞 Need Help?

**Check Logs:**
- ESP32: Serial Monitor (Ctrl+Shift+M in VS Code)
- Backend: Terminal running `npm start`
- Check API: http://localhost:5000/health

**Common Issues:**
- WiFi not connecting? Check SSID/password
- Backend not receiving? Verify IP address and firewall
- Upload failing? Try pressing BOOT button

---

## ✨ Next Steps

Once ESP32 is running:
1. ✅ Data flows to backend automatically
2. ✅ View in Farmer Portal → Storage section
3. ✅ Alerts created for critical conditions
4. ✅ Historical data stored in database
5. ✅ Monitor from anywhere on same network

Happy Monitoring! 🌾📊
