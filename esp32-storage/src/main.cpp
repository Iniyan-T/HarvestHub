#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

/* WiFi */
const char* ssid = "gypsa";
const char* password = "iniyan07";

/* Firebase */
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

void setup() {
  Serial.begin(115200);
  dht.begin();

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) delay(500);
}

void loop() {

  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  int adc = analogRead(MQ135_PIN);

  float voltage = adc * (3.3 / 4095.0);
  float Rs = ((3.3 - voltage) / voltage) * RL;
  float ratio = Rs / R0;

  /* Scaled gas values */
  float co2 = getPPM(ratio,116.6,-2.77) * SCALE;
  float ammonia = getPPM(ratio,102.2,-2.473) * SCALE;
  float methane = getPPM(ratio,50.0,-2.3) * SCALE;
  float ethylene = getPPM(ratio,70.0,-2.5) * SCALE;
  float h2s = getPPM(ratio,40.0,-2.1) * SCALE;

  Serial.println("Gas Values:");
  Serial.println(co2);
  Serial.println(ammonia);
  Serial.println(methane);

  HTTPClient http;

  String url = String(firebaseHost) + "/sensor.json?auth=" + firebaseAuth;
  http.begin(url);
  http.addHeader("Content-Type","application/json");

  String json = "{";
  json += "\"temperature\":" + String(temperature) + ",";
  json += "\"humidity\":" + String(humidity) + ",";
  json += "\"CO2\":" + String(co2) + ",";
  json += "\"ammonia\":" + String(ammonia) + ",";
  json += "\"methane\":" + String(methane) + ",";
  json += "\"ethylene\":" + String(ethylene) + ",";
  json += "\"H2S\":" + String(h2s) + ",";
  json += "\"lastUpdate\":" + String(millis());
  json += "}";

  int httpCode = http.PUT(json);
  http.end();
  
  if (httpCode > 0) {
    Serial.println("✓ Data sent to Firebase");
  }

  delay(5000);
}
