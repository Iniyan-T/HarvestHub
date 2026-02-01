/*
 * HarvestHub Storage Monitoring System
 * ESP32 + DHT11 + MQ135 → Firebase Realtime Database
 * 
 * Hardware Connections:
 * - DHT11 DATA → GPIO 4
 * - DHT11 VCC  → 3.3V
 * - DHT11 GND  → GND
 * 
 * - MQ135 A0   → GPIO 34 (ADC1_6)
 * - MQ135 VCC  → 5V
 * - MQ135 GND  → GND
 * 
 * Author: HarvestHub Team
 * Date: February 2026
 */

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

// ========================================
// 🔧 CONFIGURATION - CHANGE THESE VALUES
// ========================================

// WiFi Credentials
const char* WIFI_SSID = "YourWiFiName";        // ⚠️ CHANGE THIS
const char* WIFI_PASSWORD = "YourWiFiPassword"; // ⚠️ CHANGE THIS

// Firebase Configuration
const char* FIREBASE_HOST = "your-project.firebaseio.com";  // ⚠️ CHANGE THIS (without https://)
const char* FIREBASE_AUTH = "";  // Optional: Add Firebase secret/token if needed

// Firebase Path
const String FARMER_ID = "507f1f77bcf86cd799439011";  // Your farmer ID
const String STORAGE_UNIT_ID = "storage_unit_1";      // Storage unit identifier
const String STORAGE_UNIT_NAME = "Rice Storage A";    // Display name

// Pin Definitions
#define DHTPIN 4          // DHT11 data pin (GPIO 4)
#define DHTTYPE DHT11     // DHT sensor type
#define MQ135PIN 34       // MQ135 analog pin (ADC1_6)

// Sensor Reading Interval
#define READING_INTERVAL 10000  // 10 seconds (10000 ms)

// ========================================
// 📊 SENSOR OBJECTS
// ========================================
DHT dht(DHTPIN, DHTTYPE);

// ========================================
// 📡 GLOBAL VARIABLES
// ========================================
unsigned long lastReadingTime = 0;
int uploadCount = 0;

// ========================================
// 🌡️ SENSOR READING FUNCTIONS
// ========================================

/**
 * Read temperature from DHT11
 */
float readTemperature() {
  float temp = dht.readTemperature();
  if (isnan(temp)) {
    Serial.println("❌ Failed to read temperature from DHT11!");
    return 0.0;
  }
  return temp;
}

/**
 * Read humidity from DHT11
 */
float readHumidity() {
  float humidity = dht.readHumidity();
  if (isnan(humidity)) {
    Serial.println("❌ Failed to read humidity from DHT11!");
    return 0.0;
  }
  return humidity;
}

/**
 * Read gas level from MQ135 (analog reading)
 * Returns: 0-4095 (12-bit ADC on ESP32)
 */
int readGasLevel() {
  int gasValue = analogRead(MQ135PIN);
  return gasValue;
}

/**
 * Convert gas analog reading to PPM (simplified)
 * Note: Proper calibration required for accurate readings
 */
float convertGasToPPM(int analogValue) {
  // Simplified conversion - calibrate for your specific sensor
  // This is a placeholder formula
  float voltage = analogValue * (3.3 / 4095.0);
  float ppm = voltage * 100;  // Simplified - needs calibration
  return ppm;
}

/**
 * Calculate status based on value and thresholds
 */
String calculateStatus(float value, float normalMin, float normalMax, float warningMin, float warningMax) {
  if (value >= normalMin && value <= normalMax) {
    return "normal";
  } else if (value >= warningMin && value <= warningMax) {
    return "warning";
  } else {
    return "critical";
  }
}

/**
 * Calculate gas status
 */
String calculateGasStatus(float value, float threshold) {
  if (value < threshold * 0.8) {
    return "normal";
  } else if (value < threshold) {
    return "warning";
  } else {
    return "critical";
  }
}

/**
 * Calculate spoilage risk based on all parameters
 */
String calculateSpoilageRisk(String tempStatus, String humidityStatus, String gasStatus) {
  int criticalCount = 0;
  int warningCount = 0;
  
  if (tempStatus == "critical") criticalCount++;
  else if (tempStatus == "warning") warningCount++;
  
  if (humidityStatus == "critical") criticalCount++;
  else if (humidityStatus == "warning") warningCount++;
  
  if (gasStatus == "critical") criticalCount++;
  else if (gasStatus == "warning") warningCount++;
  
  if (criticalCount > 0) return "high";
  if (warningCount >= 2) return "medium";
  return "low";
}

// ========================================
// 📤 FIREBASE FUNCTIONS
// ========================================

/**
 * Send sensor data to Firebase Realtime Database
 */
bool sendToFirebase(float temperature, float humidity, float co2, float ethylene) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi not connected!");
    return false;
  }

  HTTPClient http;
  
  // Build Firebase URL
  String firebaseUrl = "https://" + String(FIREBASE_HOST) + 
                       "/storageData/" + FARMER_ID + "/" + STORAGE_UNIT_ID + ".json";
  
  if (strlen(FIREBASE_AUTH) > 0) {
    firebaseUrl += "?auth=" + String(FIREBASE_AUTH);
  }
  
  Serial.println("📡 Sending to Firebase: " + firebaseUrl);
  
  // Calculate statuses
  String tempStatus = calculateStatus(temperature, 15.0, 25.0, 10.0, 30.0);
  String humidityStatus = calculateStatus(humidity, 50.0, 70.0, 40.0, 80.0);
  String co2Status = calculateGasStatus(co2, 1000.0);
  String ethyleneStatus = calculateGasStatus(ethylene, 10.0);
  String spoilageRisk = calculateSpoilageRisk(tempStatus, humidityStatus, co2Status);
  
  // Create JSON payload
  JsonDocument doc;
  
  doc["timestamp"] = millis();
  doc["storageUnit"] = STORAGE_UNIT_NAME;
  
  // Temperature
  doc["temperature"]["value"] = temperature;
  doc["temperature"]["status"] = tempStatus;
  doc["temperature"]["unit"] = "°C";
  
  // Humidity
  doc["humidity"]["value"] = humidity;
  doc["humidity"]["status"] = humidityStatus;
  doc["humidity"]["unit"] = "%";
  
  // Gases
  doc["gases"]["co2"]["value"] = co2;
  doc["gases"]["co2"]["status"] = co2Status;
  doc["gases"]["co2"]["threshold"] = 1000;
  
  doc["gases"]["ethylene"]["value"] = ethylene;
  doc["gases"]["ethylene"]["status"] = ethyleneStatus;
  doc["gases"]["ethylene"]["threshold"] = 10;
  
  doc["gases"]["ammonia"]["value"] = 5.0;  // Placeholder
  doc["gases"]["ammonia"]["status"] = "normal";
  doc["gases"]["ammonia"]["threshold"] = 25;
  
  doc["gases"]["oxygen"]["value"] = 21.0;  // Placeholder
  doc["gases"]["oxygen"]["status"] = "normal";
  doc["gases"]["oxygen"]["threshold"] = 19;
  
  // Spoilage risk
  doc["spoilageRisk"] = spoilageRisk;
  
  // Recommendations
  JsonArray recommendations = doc["recommendations"].to<JsonArray>();
  if (tempStatus != "normal") {
    recommendations.add("Temperature out of range - check cooling system");
  }
  if (humidityStatus != "normal") {
    recommendations.add("Humidity needs adjustment - check ventilation");
  }
  if (co2Status != "normal") {
    recommendations.add("CO2 levels elevated - improve air circulation");
  }
  
  // Serialize JSON
  String jsonPayload;
  serializeJson(doc, jsonPayload);
  
  Serial.println("📦 Payload: " + jsonPayload);
  
  // Send HTTP PUT request
  http.begin(firebaseUrl);
  http.addHeader("Content-Type", "application/json");
  
  int httpResponseCode = http.PUT(jsonPayload);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("✅ Firebase response code: " + String(httpResponseCode));
    Serial.println("📥 Response: " + response);
    http.end();
    return true;
  } else {
    Serial.println("❌ Firebase error: " + String(httpResponseCode));
    Serial.println("❌ Error: " + http.errorToString(httpResponseCode));
    http.end();
    return false;
  }
}

/**
 * Send historical data point for charts
 */
void sendHistoricalData(float temperature, float humidity) {
  if (WiFi.status() != WL_CONNECTED) return;
  
  HTTPClient http;
  
  // Build Firebase URL for historical data
  String firebaseUrl = "https://" + String(FIREBASE_HOST) + 
                       "/historicalData/" + FARMER_ID + "/" + STORAGE_UNIT_ID + 
                       "/" + String(millis()) + ".json";
  
  if (strlen(FIREBASE_AUTH) > 0) {
    firebaseUrl += "?auth=" + String(FIREBASE_AUTH);
  }
  
  // Create JSON payload
  JsonDocument doc;
  doc["timestamp"] = millis();
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  
  String jsonPayload;
  serializeJson(doc, jsonPayload);
  
  // Send HTTP PUT request
  http.begin(firebaseUrl);
  http.addHeader("Content-Type", "application/json");
  http.PUT(jsonPayload);
  http.end();
}

// ========================================
// 🌐 WIFI FUNCTIONS
// ========================================

/**
 * Connect to WiFi
 */
void connectToWiFi() {
  Serial.println();
  Serial.println("🌐 Connecting to WiFi...");
  Serial.print("SSID: ");
  Serial.println(WIFI_SSID);
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("✅ WiFi connected!");
    Serial.print("📍 IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("📶 Signal Strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    Serial.println();
    Serial.println("❌ WiFi connection failed!");
    Serial.println("⚠️ Check your WiFi credentials");
    Serial.println("⚠️ Make sure you're using 2.4GHz WiFi (ESP32 doesn't support 5GHz)");
  }
}

// ========================================
// 🚀 SETUP FUNCTION
// ========================================

void setup() {
  // Initialize Serial Monitor
  Serial.begin(115200);
  delay(1000);
  
  Serial.println();
  Serial.println("╔════════════════════════════════════════╗");
  Serial.println("║  HarvestHub Storage Monitoring System  ║");
  Serial.println("║  ESP32 + DHT11 + MQ135 + Firebase     ║");
  Serial.println("╚════════════════════════════════════════╝");
  Serial.println();
  
  // Initialize DHT sensor
  Serial.println("🌡️ Initializing DHT11 sensor...");
  dht.begin();
  delay(2000);  // DHT11 needs time to stabilize
  Serial.println("✅ DHT11 initialized");
  
  // Configure MQ135 pin
  Serial.println("💨 Initializing MQ135 sensor...");
  pinMode(MQ135PIN, INPUT);
  Serial.println("✅ MQ135 initialized");
  
  // Test sensor readings
  Serial.println();
  Serial.println("🧪 Testing sensors...");
  float testTemp = readTemperature();
  float testHumidity = readHumidity();
  int testGas = readGasLevel();
  
  Serial.print("  Temperature: ");
  Serial.print(testTemp);
  Serial.println("°C");
  Serial.print("  Humidity: ");
  Serial.print(testHumidity);
  Serial.println("%");
  Serial.print("  Gas (raw): ");
  Serial.println(testGas);
  
  // Connect to WiFi
  connectToWiFi();
  
  Serial.println();
  Serial.println("🎯 System ready! Starting measurements...");
  Serial.println("═══════════════════════════════════════");
  Serial.println();
}

// ========================================
// 🔄 LOOP FUNCTION
// ========================================

void loop() {
  unsigned long currentTime = millis();
  
  // Check if it's time to read sensors
  if (currentTime - lastReadingTime >= READING_INTERVAL) {
    lastReadingTime = currentTime;
    uploadCount++;
    
    Serial.println("📊 Reading #" + String(uploadCount));
    Serial.println("⏰ Time: " + String(currentTime / 1000) + "s");
    
    // Check WiFi connection
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("⚠️ WiFi disconnected! Reconnecting...");
      connectToWiFi();
    }
    
    // Read sensors
    float temperature = readTemperature();
    float humidity = readHumidity();
    int gasRaw = readGasLevel();
    float co2 = convertGasToPPM(gasRaw);
    float ethylene = co2 * 0.05;  // Simulated - MQ135 can detect multiple gases
    
    // Display readings
    Serial.println("┌─────────────────────────────────────┐");
    Serial.println("│         SENSOR READINGS             │");
    Serial.println("├─────────────────────────────────────┤");
    Serial.print("│ 🌡️  Temperature: ");
    Serial.print(temperature, 1);
    Serial.println("°C");
    Serial.print("│ 💧 Humidity:    ");
    Serial.print(humidity, 1);
    Serial.println("%");
    Serial.print("│ 💨 Gas (raw):   ");
    Serial.println(gasRaw);
    Serial.print("│ 💨 CO2 (est):   ");
    Serial.print(co2, 1);
    Serial.println(" ppm");
    Serial.print("│ 💨 C2H4 (est):  ");
    Serial.print(ethylene, 1);
    Serial.println(" ppm");
    Serial.println("└─────────────────────────────────────┘");
    
    // Send to Firebase
    Serial.println();
    Serial.println("📤 Uploading to Firebase...");
    bool success = sendToFirebase(temperature, humidity, co2, ethylene);
    
    if (success) {
      Serial.println("✅ Data uploaded successfully!");
      
      // Also send historical data for charts
      sendHistoricalData(temperature, humidity);
    } else {
      Serial.println("❌ Upload failed!");
    }
    
    Serial.println("═══════════════════════════════════════");
    Serial.println();
    
    // Print next reading time
    Serial.print("⏱️  Next reading in ");
    Serial.print(READING_INTERVAL / 1000);
    Serial.println(" seconds...");
    Serial.println();
  }
  
  // Small delay to prevent watchdog timer reset
  delay(100);
}

// ========================================
// 🎓 NOTES FOR BEGINNERS
// ========================================

/*
 * TROUBLESHOOTING TIPS:
 * 
 * 1. WiFi Not Connecting:
 *    - Check SSID and password
 *    - Make sure using 2.4GHz WiFi (not 5GHz)
 *    - Check if WiFi is on and in range
 * 
 * 2. Sensor Reading NaN or 0:
 *    - Check wiring connections
 *    - DHT11: VCC to 3.3V, DATA to GPIO 4, GND to GND
 *    - Wait 2 seconds after power-on for DHT11 to stabilize
 * 
 * 3. Firebase Upload Fails:
 *    - Check Firebase URL format (no https:// in FIREBASE_HOST)
 *    - Verify Firebase database rules allow writes
 *    - Check internet connection
 * 
 * 4. Serial Monitor Shows Garbage:
 *    - Check baud rate is set to 115200
 *    - Press EN/Reset button on ESP32
 * 
 * 5. ESP32 Keeps Restarting:
 *    - Power issue - use external 5V supply or powered USB hub
 *    - Check for short circuits in wiring
 * 
 * CALIBRATION NOTES:
 * 
 * - MQ135 sensor needs 24-48 hours of pre-heating for accurate readings
 * - Calibrate gas sensor in clean air (outdoor/well-ventilated area)
 * - Temperature accuracy: ±2°C (DHT11)
 * - Humidity accuracy: ±5% (DHT11)
 * 
 * FIREBASE DATABASE RULES:
 * 
 * For testing, use these rules (WARNING: Not secure for production):
 * {
 *   "rules": {
 *     ".read": true,
 *     ".write": true
 *   }
 * }
 * 
 * For production, implement proper authentication!
 */
