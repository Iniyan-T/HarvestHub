# 🚀 Complete ESP32 + VS Code Setup Guide for HarvestHub Storage Monitoring

## 📋 Prerequisites
- Windows 10/11
- USB cable (micro-USB or USB-C depending on your ESP32 board)
- ESP32 Dev Module
- DHT11 Temperature & Humidity Sensor
- MQ135 Gas Sensor
- Internet connection

---

## 🎯 Step 1: Install Visual Studio Code

1. **Download VS Code**
   - Go to: https://code.visualstudio.com/
   - Click "Download for Windows"
   - Run the installer (VSCodeSetup.exe)

2. **Install VS Code**
   - Accept the license agreement
   - ✅ Check "Add to PATH" (important!)
   - ✅ Check "Create a desktop icon"
   - Click "Install"
   - Click "Finish"

---

## 🔌 Step 2: Install USB Drivers for ESP32

**Most ESP32 boards use CP210x or CH340 USB-to-Serial chips.**

### Option A: CP210x Driver (Most Common)
1. Download from: https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers
2. Extract and run "CP210xVCPInstaller_x64.exe"
3. Follow installation prompts

### Option B: CH340 Driver
1. Download from: https://sparks.gogo.co.nz/ch340.html
2. Extract and run "CH341SER.EXE"
3. Click "INSTALL"

### Verify Driver Installation
1. Connect ESP32 to PC via USB
2. Open Device Manager (Win + X → Device Manager)
3. Look under "Ports (COM & LPT)"
4. You should see "Silicon Labs CP210x USB to UART Bridge (COM3)" or similar
5. **Note down the COM port number (e.g., COM3)**

---

## 🔧 Step 3: Install PlatformIO in VS Code

**PlatformIO is the BEST way to develop ESP32 projects in VS Code!**

1. **Open VS Code**

2. **Install PlatformIO Extension**
   - Click the Extensions icon (or press `Ctrl+Shift+X`)
   - Search for: **"PlatformIO IDE"**
   - Click "Install" on the official PlatformIO extension
   - Wait for installation (2-5 minutes) - it downloads tools automatically
   - **Restart VS Code** when prompted

3. **Verify Installation**
   - You should see a new PlatformIO icon (alien head) on the left sidebar
   - Click it to see PlatformIO Home

---

## 🏗️ Step 4: Create ESP32 Project in VS Code

### Method 1: Using PlatformIO Home (Recommended for Beginners)

1. **Open PlatformIO Home**
   - Click the PlatformIO icon (alien head) on the left sidebar
   - Click "Home" button at the bottom

2. **Create New Project**
   - Click "New Project" button
   - Fill in details:
     - **Name**: `HarvestHub_Storage_Monitor`
     - **Board**: Type "ESP32" and select **"Espressif ESP32 Dev Module"**
     - **Framework**: Select **"Arduino"**
     - **Location**: Browse to `C:\Users\iniya\Downloads\HarvestHub\esp32-storage`
   - Click "Finish"
   - Wait for project initialization (downloads ESP32 toolchain - may take 5-10 minutes first time)

3. **Project Structure Created**
   ```
   HarvestHub_Storage_Monitor/
   ├── .pio/              (PlatformIO cache - auto-generated)
   ├── include/           (header files)
   ├── lib/               (custom libraries)
   ├── src/               (your code goes here)
   │   └── main.cpp       (main Arduino sketch)
   ├── test/              (unit tests)
   ├── platformio.ini     (configuration file)
   └── .gitignore
   ```

---

## ⚙️ Step 5: Configure platformio.ini

Open `platformio.ini` and replace content with:

```ini
[env:esp32dev]
platform = espressif32
board = esp32dev
framework = arduino

; Serial Monitor Settings
monitor_speed = 115200
monitor_port = COM3  ; Change to your COM port
upload_port = COM3   ; Change to your COM port

; Build flags
build_flags = 
    -DCORE_DEBUG_LEVEL=3
    -DBOARD_HAS_PSRAM
    
; Library dependencies
lib_deps = 
    adafruit/DHT sensor library @ ^1.4.6
    adafruit/Adafruit Unified Sensor @ ^1.1.14
    bblanchon/ArduinoJson @ ^7.0.4

; Upload settings
upload_speed = 921600
```

**Important: Change COM3 to YOUR actual COM port!**

---

## 📚 Step 6: Install Required Libraries

**Good news: Libraries are auto-installed via platformio.ini!**

The libraries listed in `lib_deps` will be automatically downloaded when you build.

### Libraries Included:
- ✅ **WiFi** - Built-in with ESP32 Arduino framework
- ✅ **HTTPClient** - Built-in with ESP32 Arduino framework
- ✅ **DHT sensor library** - Adafruit's DHT library
- ✅ **Adafruit Unified Sensor** - Required by DHT library
- ✅ **ArduinoJson** - For parsing Firebase responses

---

## 💻 Step 7: Write Your ESP32 Code

### Create Main Code File

Open `src/main.cpp` and you'll see Arduino-style code structure:

**The complete working code is provided in the next step.**

---

## 🔨 Step 8: Build the Project

1. **Build (Compile)**
   - Click PlatformIO icon on left sidebar
   - Click "Build" under "Project Tasks" → "esp32dev" → "General"
   - **OR** press `Ctrl+Alt+B`
   - **OR** click checkmark (✓) icon on bottom toolbar

2. **Check for Errors**
   - Build output appears in Terminal at bottom
   - Look for "SUCCESS" or "FAILED"
   - First build takes longer (downloads libraries)

---

## 📤 Step 9: Upload to ESP32

1. **Connect ESP32**
   - Plug ESP32 into USB port
   - Verify COM port in Device Manager

2. **Upload**
   - Click "Upload" under Project Tasks
   - **OR** press `Ctrl+Alt+U`
   - **OR** click arrow (→) icon on bottom toolbar

3. **ESP32 Upload Process**
   ```
   Connecting........_____.....
   Chip is ESP32-D0WDQ6 (revision 1)
   Features: WiFi, BT, Dual Core
   Crystal is 40MHz
   Writing at 0x00001000... (100%)
   Hash of data verified.
   
   Leaving...
   Hard resetting via RTS pin...
   ```

4. **If Upload Fails**
   - **Hold BOOT button** on ESP32 during "Connecting...." message
   - Release when upload starts
   - Some ESP32 boards auto-reset, some don't

---

## 📊 Step 10: Open Serial Monitor

**PlatformIO has built-in Serial Monitor!**

### Method 1: PlatformIO Toolbar
1. Click plug icon (🔌) on bottom toolbar
2. Serial Monitor opens in terminal

### Method 2: Project Tasks
1. Click PlatformIO icon
2. Navigate to: Project Tasks → esp32dev → Platform → Monitor
3. Click "Monitor"

### Method 3: Keyboard Shortcut
- Press `Ctrl+Alt+S` (if configured)

### Serial Monitor Controls
- **Stop**: Click trash icon or `Ctrl+C`
- **Clear**: Click trash can icon
- **Change Baud Rate**: Edit `monitor_speed` in platformio.ini

---

## 🐛 Step 11: Common Errors and Fixes

### ❌ Error: "COM port not found"
**Fix:**
```ini
; In platformio.ini, find your COM port
monitor_port = COM3  ; Change to your actual port
upload_port = COM3
```
Check Device Manager for correct COM port.

---

### ❌ Error: "A fatal error occurred: Failed to connect"
**Fix:**
1. Hold **BOOT button** on ESP32 during upload
2. Press **EN (Reset) button** once
3. Check USB cable (use data cable, not charge-only cable)
4. Try different USB port
5. Lower upload speed:
   ```ini
   upload_speed = 115200  ; Slower but more reliable
   ```

---

### ❌ Error: "Brownout detector was triggered"
**Fix:**
- Power issue - use powered USB hub
- Or use external 5V power supply
- Bad USB cable

---

### ❌ Error: "WiFi connection failed"
**Fix:**
```cpp
// Check your WiFi credentials
const char* ssid = "YourWiFiName";      // Correct?
const char* password = "YourPassword";   // Correct?
```
- ESP32 only supports **2.4GHz WiFi** (not 5GHz!)
- Check if WiFi is on and in range

---

### ❌ Error: "Firebase upload failed"
**Fix:**
```cpp
// Check Firebase URL format
String firebaseUrl = "https://your-project.firebaseio.com/storageData/farmerId/storage_unit_1.json";
//                   ^^^^^^^^ Must start with https://
//                                                     Must end with .json for REST API
```
- Verify Firebase URL is correct
- Check Firebase database rules (must allow writes)

---

### ❌ Error: "DHT sensor read failed"
**Fix:**
```cpp
#define DHTPIN 4  // GPIO4 - verify this is your actual pin
```
- Check wiring:
  - DHT11 VCC → 3.3V or 5V
  - DHT11 GND → GND
  - DHT11 DATA → GPIO4 (or your chosen pin)
- Add 10kΩ pull-up resistor between DATA and VCC (optional but recommended)

---

### ❌ Error: "Library not found"
**Fix:**
1. Check `lib_deps` in platformio.ini
2. Force re-download:
   - Delete `.pio` folder
   - Click "Clean" in Project Tasks
   - Rebuild project

---

### ❌ Error: "Compilation error: stray '\302'"
**Fix:**
- Hidden Unicode characters in code
- Re-type the problematic line manually
- Don't copy-paste from PDF/Word (use plain text)

---

## 🔍 Step 12: Verify Everything Works

### Test Checklist:
1. ✅ Upload succeeds
2. ✅ Serial Monitor shows:
   ```
   Connecting to WiFi...
   WiFi connected!
   IP: 192.168.x.x
   DHT11 initialized
   Reading sensors...
   Temperature: 25.0°C
   Humidity: 60.0%
   Sending to Firebase...
   Firebase response: 200 OK
   ```
3. ✅ Check Firebase Console - data should appear
4. ✅ Check HarvestHub Storage page - data should update

---

## 🎯 Step 13: Project Structure Best Practices

### Recommended Folder Structure:
```
esp32-storage/
├── src/
│   ├── main.cpp           # Main Arduino code
│   ├── config.h           # WiFi & Firebase credentials
│   ├── sensors.h          # Sensor reading functions
│   └── firebase.h         # Firebase communication
├── lib/
│   └── (custom libraries if needed)
├── include/
│   └── (custom headers)
├── platformio.ini         # Project configuration
└── README.md              # Project documentation
```

---

## ⚡ Quick Command Reference

| Action | Shortcut | Button |
|--------|----------|--------|
| **Build** | `Ctrl+Alt+B` | ✓ (checkmark) |
| **Upload** | `Ctrl+Alt+U` | → (arrow) |
| **Serial Monitor** | `Ctrl+Alt+S` | 🔌 (plug) |
| **Clean** | - | 🗑️ (trash) |
| **PlatformIO Home** | - | 🏠 (house) |

---

## 📱 PlatformIO Bottom Toolbar Icons

```
🏠 ✓ → 🗑️ 🔨 🔍 🔌 ⚙️
│  │ │  │   │   │  │  └─ Settings
│  │ │  │   │   │  └──── Serial Monitor
│  │ │  │   │   └─────── Search
│  │ │  │   └─────────── Build FS Image
│  │ │  └─────────────── Clean
│  │ └────────────────── Upload
│  └─────────────────── Build
└────────────────────── PlatformIO Home
```

---

## 🌟 Advantages of PlatformIO over Arduino IDE

✅ **Better Code Editor**
- IntelliSense (autocomplete)
- Syntax highlighting
- Error detection
- Multiple files easily

✅ **Library Management**
- Auto-installs libraries
- Version control
- No manual downloads

✅ **Build System**
- Faster compilation
- Better error messages
- Multiple boards support

✅ **Integrated Tools**
- Serial Monitor built-in
- Debugger support
- Unit testing

✅ **Version Control**
- Git integration
- Professional development

---

## 🔄 Migrating from Arduino IDE

If you have existing `.ino` files:

1. **Create PlatformIO project** (as shown above)
2. **Copy your .ino code** to `src/main.cpp`
3. **Add these lines at top:**
   ```cpp
   #include <Arduino.h>  // Required for PlatformIO
   ```
4. **Update any library includes** if needed
5. **Build and upload** - done!

---

## 🎓 Learning Resources

### PlatformIO Docs
- https://docs.platformio.org/

### ESP32 Arduino Core
- https://docs.espressif.com/projects/arduino-esp32/

### Firebase REST API
- https://firebase.google.com/docs/database/rest/start

### DHT Sensor Guide
- https://learn.adafruit.com/dht

---

## ✅ Final Checklist

Before starting your project, make sure:

- [x] VS Code installed
- [x] USB drivers installed
- [x] PlatformIO extension installed
- [x] ESP32 board package downloaded
- [x] COM port identified
- [x] platformio.ini configured
- [x] WiFi credentials ready
- [x] Firebase URL ready
- [x] Sensors wired correctly
- [x] Sample code tested
- [x] Serial Monitor working

---

## 🆘 Still Having Issues?

1. **Check Serial Monitor output** - errors are usually descriptive
2. **Verify wiring** - most issues are hardware-related
3. **Test WiFi separately** - upload WiFi-only test code first
4. **Test sensors separately** - upload sensor-only test code first
5. **Check Firebase rules** - make sure database allows writes
6. **Try example code** - verify setup with simple blink example first

---

## 📞 Next Steps

1. ✅ Complete this setup
2. ✅ Upload the sample code provided
3. ✅ Verify data in Firebase
4. ✅ Check HarvestHub Storage Dashboard
5. ✅ Calibrate sensors if needed
6. ✅ Add more storage units
7. ✅ Deploy in production!

---

**You're now ready to develop ESP32 IoT projects like a pro! 🚀**
