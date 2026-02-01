# Quick Reference Card - ESP32 Storage Monitor

## 🔌 Hardware Connections

```
DHT11:  VCC→3.3V  |  DATA→GPIO4  |  GND→GND
MQ135:  VCC→5V    |  A0→GPIO34   |  GND→GND
```

## ⚙️ Must Change Before Upload

1. **WiFi Settings** (`main.cpp` lines 34-35)
   ```cpp
   const char* WIFI_SSID = "YOUR_WIFI";
   const char* WIFI_PASSWORD = "YOUR_PASSWORD";
   ```

2. **Firebase URL** (`main.cpp` line 38)
   ```cpp
   const char* FIREBASE_HOST = "your-project.firebaseio.com";
   ```

3. **COM Port** (`platformio.ini` lines 9-10)
   ```ini
   monitor_port = COM3  ; Your COM port
   upload_port = COM3
   ```

## 🚀 Quick Commands

| Action | Shortcut | Button |
|--------|----------|--------|
| Build | `Ctrl+Alt+B` | ✓ |
| Upload | `Ctrl+Alt+U` | → |
| Serial Monitor | `Ctrl+Alt+S` | 🔌 |

## 📊 Serial Monitor Baud Rate
```
115200
```

## ⚡ Upload Not Working?

1. **Hold BOOT button** on ESP32
2. Click Upload (→)
3. Release BOOT when "Connecting..." changes
4. If still fails: Change upload_speed to `115200`

## 🔍 Quick Diagnostics

### WiFi Not Connecting?
- ✅ Check SSID/password spelling
- ✅ Use 2.4GHz WiFi (not 5GHz)
- ✅ ESP32 in range of router

### Sensor Reading Failed?
- ✅ Check wiring connections
- ✅ Verify pin numbers in code match your wiring
- ✅ Wait 2 seconds after power-on (DHT11)

### Firebase Not Working?
- ✅ Check Firebase URL (no `https://` prefix)
- ✅ Firebase database rules allow writes
- ✅ Internet connection working

## 📈 Expected Serial Output

```
✅ WiFi connected!
📍 IP Address: 192.168.x.x
🌡️  Temperature: 25.0°C
💧 Humidity:    60.0%
✅ Data uploaded successfully!
```

## 🎯 Firebase Database Rules (Testing Only)

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

**⚠️ Warning: Insecure for production! Use authentication.**

## 🔄 Reading Interval

Default: **10 seconds** (10000 ms)

Change in `main.cpp` line 48:
```cpp
#define READING_INTERVAL 10000
```

## 📍 Pin Reference

| Component | Pin | GPIO |
|-----------|-----|------|
| DHT11 DATA | D4 | GPIO 4 |
| MQ135 A0 | D34 | GPIO 34 |

## 💾 Storage Location

Project: `C:\Users\iniya\Downloads\HarvestHub\esp32-storage`

## 📚 Important Files

- `src/main.cpp` - Main code (edit this!)
- `platformio.ini` - Configuration
- `README.md` - Full documentation

## 🔗 View Data

After upload, check:
1. Serial Monitor (🔌) - See live readings
2. Firebase Console - Verify data uploaded
3. HarvestHub Dashboard - View graphs

## 🆘 Emergency Reset

1. Press **EN** button on ESP32
2. Or unplug and replug USB
3. Or re-upload code

## ✅ Pre-Upload Checklist

- [ ] WiFi credentials updated
- [ ] Firebase URL correct
- [ ] COM port set correctly
- [ ] ESP32 connected via USB
- [ ] Sensors wired correctly
- [ ] Serial Monitor closed (if using COM port)

---

**Keep this card handy for quick reference!**
