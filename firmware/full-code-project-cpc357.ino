#include <WiFi.h>
#include <HTTPClient.h>
#include <LiquidCrystal.h>
#include "HX711.h"

// ==========================================
// --- USER CONFIGURATION ---
// ==========================================
const char* ssid = "Galaxy S23 Ultra";       
const char* password = "jannah03"; 
const char* serverUrl = "https://smart-bin-http-frfux5cgdq-as.a.run.app/api/bins/data";

// --- SENSOR CALIBRATION ---
float calibration_factor = 77780.0; // Your specific factor
const int BIN_HEIGHT_CM = 18;       // Total height of the bin

// --- THRESHOLDS ---
const int FULL_DISTANCE_CM = 3;   // Distance threshold
const float FULL_WEIGHT_KG = 12.0; // Max weight capacity
const float MIN_WEIGHT_CHECK = 1.0; // Min weight to confirm bin is actually fill

// ==========================================
// --- PIN DEFINITIONS ---
// ==========================================

// LCD Pins (Parallel Interface)
const int rs = 14, en = 21, d4 = 47, d5 = 48, d6 = 38, d7 = 39;
LiquidCrystal lcd(rs, en, d4, d5, d6, d7);

// Ultrasonic Pins
#define TRIG_PIN 10
#define ECHO_PIN 7

// Load Cell Pins
#define LOADCELL_DOUT_PIN 6
#define LOADCELL_SCK_PIN 5

// ==========================================
// --- GLOBAL VARIABLES ---
// ==========================================
HX711 scale;
unsigned long lastCloudSendTime = 0;
const long cloudInterval = 5000; // Send to cloud every 5 seconds

void setup() {
  Serial.begin(115200);

  // 1. Setup LCD
  lcd.begin(16, 2);
  lcd.print("Loading...");
  delay(1000);

  // 2. Setup WiFi
  lcd.clear();
  lcd.print("Connecting WiFi");
  WiFi.begin(ssid, password);
  
  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 20) {
    delay(500);
    Serial.print(".");
    retries++;
  }
  
  lcd.clear();
  if(WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Connected Successfully!");
    lcd.print("WiFi is Stable!");
  } else {
    Serial.println("\nWiFi Failed (Proceeding offline)");
    lcd.print("Offline Mode");
  }
  delay(1000);

  // 3. Setup Ultrasonic
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  // 4. Setup Load Cell
  lcd.clear();
  lcd.print("Calculating...");
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  scale.set_scale(calibration_factor);
  scale.tare(); // Reset scale to 0
  
  lcd.clear();
}

void loop() {
  // -------------------------------------------------
  // 1. READ SENSORS
  // -------------------------------------------------
  
  // --- Ultrasonic Read ---
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long duration = pulseIn(ECHO_PIN, HIGH);
  int distanceRaw = duration * 0.034 / 2;
  
  // Sanity check
  int distance = (distanceRaw > BIN_HEIGHT_CM) ? BIN_HEIGHT_CM : distanceRaw;

  // --- Load Cell Read ---
  float weight = scale.get_units(3); 
  if (weight < 0) weight = 0.00;      

  // -------------------------------------------------
  // 2. LOGIC & DISPLAY
  // -------------------------------------------------
  
  String cloudStatus = "OK"; // Default status for Cloud
  lcd.clear();

  // Bin is FULL if:
  // 1. (Distance is low AND Weight is significant) -> Real trash full
  // 2. OR (Weight is exceeding max capacity) -> Heavy trash full
  
  bool isFullByVolume = (distance <= FULL_DISTANCE_CM && weight >= MIN_WEIGHT_CHECK);
  bool isFullByWeight = (weight >= FULL_WEIGHT_KG);

  if (isFullByVolume || isFullByWeight) {
    // --- CASE A: BIN IS FULL ---
    cloudStatus = "FULL";

    lcd.setCursor(0, 0);
    lcd.print("!! STOP !!"); 
    
    lcd.setCursor(0, 1);
    lcd.print("Bin is FULL T_T");

  } else {
    // --- CASE B: BIN IS AVAILABLE ---
    cloudStatus = "OK";

    lcd.setCursor(0, 0);
    lcd.print("Dispose your"); 

    lcd.setCursor(0, 1);
    lcd.print("waste here ><");
  }

  // Debug to Serial Monitor
  Serial.print("Dist: "); Serial.print(distance);
  Serial.print("cm | Wgt: "); Serial.print(weight);
  Serial.print("kg | Status: "); Serial.println(cloudStatus);

  // -------------------------------------------------
  // 3. SEND TO CLOUD
  // -------------------------------------------------
  if (millis() - lastCloudSendTime > cloudInterval) {
    if (WiFi.status() == WL_CONNECTED) {
      // Send the clean status ("FULL" or "OK"), not the long text
      sendDataToCloud(distance, weight, cloudStatus);
    }
    lastCloudSendTime = millis();
  }

  delay(500); 
}

// Function to send JSON data to Cloud Run
void sendDataToCloud(int dist, float wgt, String status) {
  HTTPClient http;
  
  // Start connection
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");

  // Create JSON Payload
  String jsonPayload = "{";
  jsonPayload += "\"distance\":" + String(dist) + ",";
  jsonPayload += "\"weight\":" + String(wgt) + ",";
  jsonPayload += "\"status\":\"" + status + "\",";
  jsonPayload += "\"device_id\":\"maker_feather_01\"";
  jsonPayload += "}";

  // Send POST Request
  int httpResponseCode = http.POST(jsonPayload);
  if (httpResponseCode <= 0) {
    Serial.print("Error sending POST: ");
    Serial.println(httpResponseCode);
  }

  http.end(); 
}