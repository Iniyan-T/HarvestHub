# ESP32 Wiring Guide with Visual Diagrams

## 📐 Complete Wiring Schematic

### Pin Mapping Table

| Sensor | Sensor Pin | ESP32 Pin | Function |
|--------|------------|-----------|----------|
| DHT11 | VCC | 3.3V | Power supply |
| DHT11 | GND | GND | Ground |
| DHT11 | DATA | GPIO 4 (D4) | Digital data |
| MQ135 | VCC | 5V | Power supply |
| MQ135 | GND | GND | Ground |
| MQ135 | A0 | GPIO 34 (D34) | Analog output |

---

## 🔌 Detailed Connection Diagrams

### DHT11 Temperature & Humidity Sensor

```
DHT11 Sensor (Front View)
┌─────────────────┐
│                 │
│   [|||] DHT11   │
│                 │
└─┬───┬───┬───┬───┘
  │   │   │   │
  1   2   3   4
  
Pin 1: VCC  (3.3V or 5V)
Pin 2: DATA (GPIO 4)
Pin 3: NC   (Not Connected)
Pin 4: GND  (Ground)

Connections:
DHT11 Pin 1 (VCC)  ──► ESP32 3.3V
DHT11 Pin 2 (DATA) ──► ESP32 GPIO 4
DHT11 Pin 3 (NC)   ──  Not connected
DHT11 Pin 4 (GND)  ──► ESP32 GND
```

**Optional but Recommended:**
```
        10kΩ Resistor
           ┌──┐
VCC ───────┤  ├───┬─── GPIO 4
           └──┘   │
                  └─── DHT11 DATA pin
```

---

### MQ135 Gas Sensor

```
MQ135 Sensor Module (Top View)
┌─────────────────────┐
│  ┌───┐       LED    │
│  │ o │       ●      │
│  └───┘              │
│  Sensor  [Pot]      │
│                     │
└──┬───┬───┬───┬──────┘
   │   │   │   │
   VCC GND D0  A0

Connections (Analog Mode):
MQ135 VCC ──► ESP32 5V    (Needs 5V for proper heating)
MQ135 GND ──► ESP32 GND
MQ135 A0  ──► ESP32 GPIO 34 (ADC1_6)
MQ135 D0  ──  Not used (we use analog output)
```

**Important Notes:**
- MQ135 requires 5V for optimal operation
- A0 gives analog reading (0-4095 on ESP32)
- Allow 24-48 hours pre-heating time for stable readings
- Sensor gets HOT during operation (normal)

---

## 🖥️ ESP32 Dev Module Pinout Reference

```
                         ESP32 DevKit v1
                    ┌──────────────────────┐
                    │                      │
           3.3V ────┤ 3V3            GND  ├──── GND
             EN ────┤ EN             D23  ├──── GPIO 23
          SVP/36────┤ SVP            D22  ├──── GPIO 22
          SVN/39────┤ SVN            TXD0 ├──── GPIO 1
      DHT11 DATA────┤ D34/GPIO34     RXD0 ├──── GPIO 3
          GPIO 35───┤ D35            D21  ├──── GPIO 21
          GPIO 32───┤ D32            D19  ├──── GPIO 19
          GPIO 33───┤ D33            D18  ├──── GPIO 18
          GPIO 25───┤ D25            D5   ├──── GPIO 5
          GPIO 26───┤ D26            D17  ├──── GPIO 17
          GPIO 27───┤ D27            D16  ├──── GPIO 16
          GPIO 14───┤ D14            D4   ├──── GPIO 4
          GPIO 12───┤ D12            D0   ├──── GPIO 0
            GND ────┤ GND            D2   ├──── GPIO 2
          GPIO 13───┤ D13            D15  ├──── GPIO 15
           SD2/9────┤ SD2            SD1/8├──── SD1
          SD3/10────┤ SD3            SD0/7├──── SD0
          CMD/11────┤ CMD            CLK/6├──── CLK
             5V ────┤ 5V             GND  ├──── GND
                    │       [USB]          │
                    └──────────────────────┘
                           │
                           └──── Micro-USB Port
```

**Key Pins Used:**
- **GPIO 4** → DHT11 DATA
- **GPIO 34** → MQ135 A0 (ADC1_6)
- **3.3V** → DHT11 VCC
- **5V** → MQ135 VCC
- **GND** → Common ground

---

## 🔧 Breadboard Layout

```
           ESP32 Dev Module
    ┌────────────────────────────┐
    │  [EN]              [BOOT]  │
    │                            │
    │          ESP32             │
    │                            │
    └─┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬─┘
      │││││││││││││││││││││││││
      
Breadboard connections:
Row 1:  3.3V ──────────► DHT11 VCC (Pin 1)
Row 2:  GND  ──────┬────► DHT11 GND (Pin 4)
                   └────► MQ135 GND
Row 3:  GPIO 4 ────────► DHT11 DATA (Pin 2)
Row 4:  GPIO 34 ───────► MQ135 A0
Row 5:  5V ────────────► MQ135 VCC
```

---

## 🔋 Power Requirements

### ESP32
- Operating Voltage: 3.3V (regulated internally)
- Input Voltage: 5V via USB or VIN
- Current Draw: 80-240mA (depending on WiFi usage)

### DHT11
- Operating Voltage: 3.3V - 5V
- Current Draw: 0.5-2.5mA (measuring)
- Can use 3.3V output from ESP32

### MQ135
- Operating Voltage: 5V (recommended)
- Current Draw: 150mA (heating element)
- **Must use 5V** for proper operation

**Power Budget:**
- ESP32: ~150mA (with WiFi)
- DHT11: ~2mA
- MQ135: ~150mA
- **Total: ~300mA**

**Power Sources:**
1. **USB Port:** Most USB 2.0 ports provide 500mA (sufficient)
2. **Powered USB Hub:** Recommended for stability
3. **External 5V Supply:** For production deployment

---

## ⚠️ Important Safety Notes

### Do's ✅
- Double-check connections before powering on
- Use proper gauge wires (22-26 AWG)
- Ensure good connections (no loose wires)
- Keep sensors away from direct water/moisture
- Allow MQ135 to pre-heat (24-48 hours)

### Don'ts ❌
- Don't reverse polarity (VCC/GND)
- Don't connect 5V to ESP32 GPIO pins directly
- Don't power MQ135 from 3.3V (insufficient)
- Don't touch MQ135 sensor element (gets hot)
- Don't use undersized power supply

---

## 🧪 Testing Individual Components

### Test 1: ESP32 Basic
```cpp
void setup() {
  Serial.begin(115200);
  Serial.println("ESP32 Working!");
}
void loop() {
  Serial.println("Blink test");
  delay(1000);
}
```

### Test 2: DHT11 Only
```cpp
#include <DHT.h>
#define DHTPIN 4
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
}
void loop() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();
  Serial.print("Temp: "); Serial.print(t);
  Serial.print(" Humidity: "); Serial.println(h);
  delay(2000);
}
```

### Test 3: MQ135 Only
```cpp
#define MQ135PIN 34

void setup() {
  Serial.begin(115200);
  pinMode(MQ135PIN, INPUT);
}
void loop() {
  int gas = analogRead(MQ135PIN);
  Serial.print("Gas reading: ");
  Serial.println(gas);
  delay(1000);
}
```

---

## 🔍 Troubleshooting Wiring Issues

### DHT11 Not Working

**Symptom:** NaN readings or all zeros

**Check:**
1. ✅ VCC to 3.3V (not 5V, not GND)
2. ✅ GND to GND
3. ✅ DATA to GPIO 4 (not GPIO 34)
4. ✅ Pin 3 is NOT connected
5. ✅ Wait 2 seconds after power-on

**Try:**
- Add 10kΩ pull-up resistor
- Use 5V instead of 3.3V
- Try different GPIO pin

---

### MQ135 Not Responding

**Symptom:** Always reads 0 or 4095

**Check:**
1. ✅ VCC to 5V (not 3.3V!)
2. ✅ A0 to GPIO 34 (ADC pin)
3. ✅ Don't use D0 (digital output)
4. ✅ Sensor is pre-heated (warm to touch)

**Try:**
- Wait 24-48 hours for stabilization
- Check if heating element LED is on
- Adjust potentiometer on module
- Verify 5V power supply is working

---

### Short Circuit Detection

**Signs of short circuit:**
- ESP32 won't power on
- ESP32 gets very hot
- Computer USB port shuts down
- Burning smell

**Immediate actions:**
1. 🔴 Disconnect power immediately
2. 🔍 Check all connections
3. 🔍 Look for crossed wires
4. 🔍 Verify no VCC-GND shorts
5. ⚡ Use multimeter to test continuity

---

## 🎓 Best Practices

### Wiring Tips
1. Use color-coded wires:
   - Red → VCC/Power
   - Black → GND
   - Yellow/Green → Signal
   
2. Keep wires short and neat
3. Use wire labels
4. Take photos before disconnecting

### Mechanical Mounting
1. Secure ESP32 to breadboard or PCB
2. Mount sensors away from heat sources
3. Protect from moisture
4. Ensure good ventilation for MQ135

### Long-term Deployment
1. Solder connections (no breadboard)
2. Use terminal blocks
3. Add status LEDs
4. Include reset button
5. Weatherproof enclosure

---

## 📷 Photo Checklist

Before asking for help, take photos of:
1. ✅ Top view of all connections
2. ✅ Close-up of ESP32 pins
3. ✅ Close-up of DHT11 connections
4. ✅ Close-up of MQ135 connections
5. ✅ Serial Monitor output
6. ✅ Power supply setup

---

## 🆘 Emergency Reference

### Quick Pin Check
```
ESP32 3.3V ──► DHT11 VCC
ESP32 GPIO4 ──► DHT11 DATA
ESP32 GND ────► DHT11 GND, MQ135 GND
ESP32 5V ─────► MQ135 VCC
ESP32 GPIO34 ─► MQ135 A0
```

### Multimeter Testing
- **Voltage:** Red probe to VCC, Black to GND
  - Should read 3.3V (DHT11) or 5V (MQ135)
- **Continuity:** Test GND connections
  - Should beep for good connection

---

**Always double-check connections before powering on!**
**When in doubt, disconnect and verify!**
