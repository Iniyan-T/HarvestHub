#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

/* WiFi */
const char* ssid = "gypsa";
const char* password = "iniyan07";

/* Backend API */
const char* backendHost = "10.88.168.184";  // Your PC's IP address on the same WiFi network
const int backendPort = 5000;
const char* farmerId = "507f1f77bcf86cd799439011";  // Farmer ID
const char* deviceId = "ESP32_001";

/* Firebase (Optional - for backup) */
const char* firebaseHost = "https://agri-48613-default-rtdb.firebaseio.com";
const char* firebaseAuth = "FRpJ90gTLsqtbynawN7dI9Wx5upRXmypwAB3xZ1T";

/* Sensors */
#define DHTPIN 4
#define DHTTYPE DHT11
#define MQ135_PIN 34

DHT dht(DHTPIN, DHTTYPE);

/* MQ135 constants */
float RL = 10.0;
float R0 = 29.0;

/* Scaling factor */
float SCALE = 100.0;

/* Gas formula */
float getPPM(float ratio, float a, float b) {
  return a * pow(ratio, b);
}

/* Function declarations */
void sendToBackend(float temp, float hum, float co2, float ammonia, float methane, float ethylene, float h2s);
void sendToFirebase(float temp, float hum, float co2, float ammonia, float methane, float ethylene, float h2s);

void setup() {
  Serial.begin(115200);
  Serial.println("🌾 ESP32 Storage Monitor Starting...");
  
  dht.begin();

  // Connect to WiFi
  Serial.print("📡 Connecting to WiFi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi Connected!");
    Serial.print("📍 IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ WiFi Connection Failed!");
  }
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️ WiFi disconnected, reconnecting...");
    WiFi.begin(ssid, password);
    delay(5000);
    return;
  }

  // Read sensors
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  // Check if DHT reading failed
  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("❌ Failed to read from DHT sensor!");
    delay(2000);
    return;
  }

  int adc = analogRead(MQ135_PIN);
  float voltage = adc * (3.3 / 4095.0);
  float Rs = ((3.3 - voltage) / voltage) * RL;
  float ratio = Rs / R0;

  /* Scaled gas values */
  float co2 = getPPM(ratio, 116.6, -2.77) * SCALE;
  float ammonia = getPPM(ratio, 102.2, -2.473) * SCALE;
  float methane = getPPM(ratio, 50.0, -2.3) * SCALE;
  float ethylene = getPPM(ratio, 70.0, -2.5) * SCALE;
  float h2s = getPPM(ratio, 40.0, -2.1) * SCALE;

  // Display readings
  Serial.println("\n📊 Sensor Readings:");
  Serial.printf("🌡️  Temperature: %.1f°C\n", temperature);
  Serial.printf("💧 Humidity: %.1f%%\n", humidity);
  Serial.printf("💨 CO2: %.1f ppm\n", co2);
  Serial.printf("💨 Ammonia: %.1f ppm\n", ammonia);
  Serial.printf("💨 Methane: %.1f ppm\n", methane);
  Serial.printf("💨 Ethylene: %.1f ppm\n", ethylene);
  Serial.printf("💨 H2S: %.1f ppm\n", h2s);

  // Send to Local Backend (HarvestHub)
  sendToBackend(temperature, humidity, co2, ammonia, methane, ethylene, h2s);
  
  // Send to Firebase (Optional backup)
  sendToFirebase(temperature, humidity, co2, ammonia, methane, ethylene, h2s);

  delay(5000);  // Read every 5 seconds
}

void sendToBackend(float temp, float hum, float co2, float ammonia, float methane, float ethylene, float h2s) {
  HTTPClient http;
  
  String url = "http://" + String(backendHost) + ":" + String(backendPort) + "/api/storage/readings";
  
  Serial.println("\n📤 Sending to Backend: " + url);
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  // Create JSON payload
  JsonDocument doc;
  doc["farmerId"] = farmerId;
  doc["deviceId"] = deviceId;
  doc["temperature"] = temp;
  doc["humidity"] = hum;
  doc["CO2"] = co2;
  doc["ammonia"] = ammonia;
  doc["methane"] = methane;
  doc["ethylene"] = ethylene;
  doc["H2S"] = h2s;

  String json;
  serializeJson(doc, json);
  
  Serial.println("📋 JSON: " + json);

  int httpCode = http.POST(json);
  
  if (httpCode > 0) {
    Serial.printf("✅ Backend response: %d\n", httpCode);
    if (httpCode == 200) {
      String response = http.getString();
      Serial.println("📥 Response: " + response);
    }
  } else {
    Serial.printf("❌ Backend error: %s\n", http.errorToString(httpCode).c_str());
  }
  
  http.end();
}

void sendToFirebase(float temp, float hum, float co2, float ammonia, float methane, float ethylene, float h2s) {
  HTTPClient http;

  String url = String(firebaseHost) + "/sensor.json?auth=" + firebaseAuth;
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  String json = "{";
  json += "\"temperature\":" + String(temp) + ",";
  json += "\"humidity\":" + String(hum) + ",";
  json += "\"CO2\":" + String(co2) + ",";
  json += "\"ammonia\":" + String(ammonia) + ",";
  json += "\"methane\":" + String(methane) + ",";
  json += "\"ethylene\":" + String(ethylene) + ",";
  json += "\"H2S\":" + String(h2s) + ",";
  json += "\"lastUpdate\":" + String(millis());
  json += "}";

  int httpCode = http.PUT(json);
  
  if (httpCode > 0) {
    Serial.println("✅ Firebase updated");
  }
  
  http.end();
}
