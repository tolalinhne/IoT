#include <WiFi.h>              
#include <PubSubClient.h>      
#include <DHT.h>               
#include "time.h"              

const char* ssid = "tolaLinhhne";         
const char* pass = "tolaLinhhne";         

const char* mqttServer = "172.20.10.4"; 
const int mqttPort = 1884;               
const char* mqttUser = "PhamMaiLinh";       
const char* mqttPass = "B23DCCN488";       

const char* ntpServer = "pool.ntp.org";  
const long gmtOffset_sec = 7 * 3600;     
const int daylightOffset_sec = 0;       

// CHÂN GPIO 
#define DHT_PIN 4      
#define DHT_TYPE DHT11 
#define LDR_PIN 34     

#define LED1_PIN 5     
#define LED2_PIN 18    
#define LED3_PIN 19   

//MQTT TOPIC 
const char* sensorTopic = "iot/data_sensor";   
const char* controlTopic = "iot/devices_control"; 
const char* statusTopic = "iot/devices_status";   


WiFiClient espClient;           
PubSubClient client(espClient); 
DHT dht(DHT_PIN, DHT_TYPE);    


String getDateTimeString() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    return "N/A"; 
  }
  char timeStringBuff[30];
 
  strftime(timeStringBuff, sizeof(timeStringBuff), "%Y-%m-%d %H:%M:%S", &timeinfo);
  return String(timeStringBuff);
}

// KẾT NỐI WI-FI VÀ ĐỒNG BỘ GIỜ NTP
void setupWiFi() { 
  Serial.print("Dang ket noi WiFi: "); 
  Serial.println(ssid);
  WiFi.begin(ssid, pass); 

  // Vòng lặp chờ kết nối Wi-Fi thành công
  while (WiFi.status() != WL_CONNECTED) { 
    delay(500); 
    Serial.print("."); 
  } 
  Serial.println(); 
  Serial.println("-> WiFi da ket noi thanh cong!"); 
  Serial.print("Dia chi IP cua ESP32: "); 
  Serial.println(WiFi.localIP()); 

  // Kích hoạt lấy giờ NTP
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);

  // CHỜ ĐỒNG BỘ GIỜ CHUẨN MỚI CHO CHẠY TIẾP (Tránh bị N/A ở các gói đầu)
  Serial.print("Dang dong bo thoi gian NTP");
  struct tm timeinfo;
  while (!getLocalTime(&timeinfo)) {
    Serial.print(".");
    delay(500);
  }
  Serial.println("\n-> Dong bo thoi gian thanh cong!");
}

/// Hàm gửi trạng thái thiết bị lên MQTT statusTopic
void sendStatusResponse(String device, String status) {
  String datetime = getDateTimeString();

  String statusData = "{";
  statusData += "\"device\":\"";
  statusData += device;
  statusData += "\",\"status\":\"";
  statusData += status;
  statusData += "\",\"timestamp\":\"";
  statusData += datetime;
  statusData += "\"}";

  // Publish lên topic trạng thái
  client.publish(statusTopic, statusData.c_str());

  Serial.print("Phan hoi trang thai: ");
  Serial.println(statusData);
}

// Hàm nhận và xử lý lệnh
void callback(char* topic, byte* payload, unsigned int length) {
  String msg = "";
  for (int i = 0; i < length; i++) {
    msg += (char)payload[i];
  }

  Serial.print("-> Nhan lenh tu Broker [");
  Serial.print(topic);
  Serial.print("]: ");
  Serial.println(msg);


  if (msg == "ALL_ON") {
    digitalWrite(LED1_PIN, HIGH);
    digitalWrite(LED2_PIN, HIGH);
    digitalWrite(LED3_PIN, HIGH);

    sendStatusResponse("LED1", "ON");
    sendStatusResponse("LED2", "ON");
    sendStatusResponse("LED3", "ON");
  }

  else if (msg == "ALL_OFF") {
    digitalWrite(LED1_PIN, LOW);
    digitalWrite(LED2_PIN, LOW);
    digitalWrite(LED3_PIN, LOW);

    sendStatusResponse("LED1", "OFF");
    sendStatusResponse("LED2", "OFF");
    sendStatusResponse("LED3", "OFF");
  }

  else if (msg == "LED1_ON") {
    digitalWrite(LED1_PIN, HIGH);
    sendStatusResponse("LED1", "ON");
  }
  else if (msg == "LED1_OFF") {
    digitalWrite(LED1_PIN, LOW);
    sendStatusResponse("LED1", "OFF");
  }
  else if (msg == "LED2_ON") {
    digitalWrite(LED2_PIN, HIGH);
    sendStatusResponse("LED2", "ON");
  }
  else if (msg == "LED2_OFF") {
    digitalWrite(LED2_PIN, LOW);
    sendStatusResponse("LED2", "OFF");
  }
  else if (msg == "LED3_ON") {
    digitalWrite(LED3_PIN, HIGH);
    sendStatusResponse("LED3", "ON");
  }
  else if (msg == "LED3_OFF") {
    digitalWrite(LED3_PIN, LOW);
    sendStatusResponse("LED3", "OFF");
  }
}

void reconnectMQTT() { 
  // Vòng lặp liên tục thử kết nối lại nếu bị mất kết nối MQTT
  while (!client.connected()) { 
    Serial.print("Dang ket noi MQTT Broker... "); 

    
    if (client.connect("ESP32_IOT", mqttUser, mqttPass)) { 
      Serial.println("OK (Thanh cong!)"); 
      
      client.subscribe(controlTopic); // dki lang nghe lệnh
      Serial.print("Da Subscribe topic: "); 
      Serial.println(controlTopic); 
    } 
    else { 
      Serial.print("Loi ket noi, rc="); 
      Serial.print(client.state()); 
      Serial.println(" -> Thuc hien lai sau 2 giay"); 
      delay(2000); 
    } 
  } 
} 

//  HÀM Setup cấu hình 
void setup() { 
  //  Serial Monitor với tốc độ 115200 baud
  Serial.begin(115200); 

  // Cấu hình các chân điều khiển Relay làm Output
  pinMode(LED1_PIN, OUTPUT); 
  pinMode(LED2_PIN, OUTPUT); 
  pinMode(LED3_PIN, OUTPUT); 

 
  digitalWrite(LED1_PIN, LOW); 
  digitalWrite(LED2_PIN, LOW); 
  digitalWrite(LED3_PIN, LOW); 

  dht.begin(); 

  setupWiFi(); 

  client.setServer(mqttServer, mqttPort); 
  
  // Gán hàm callback xử lý dữ liệu khi có message gửi tới
  client.setCallback(callback); 

  Serial.println("ESP32 da san sang hoat dong!"); 
} 

// HÀM pub dữ liệu lên
void loop() { 
  if (!client.connected()) { 
    reconnectMQTT(); 
  } 

  client.loop(); // lắng nghe hướng dữ liệu broker đẩy xuống call back

  // ĐỌC CẢM BIẾN 
  float temperature = dht.readTemperature(); 
  float humidity = dht.readHumidity();       
  int light = analogRead(LDR_PIN);           

  if (isnan(temperature) || isnan(humidity)) { 
    Serial.println("Loi: Khong doc duoc du lieu tu cam bien DHT11!"); 
    delay(2000); 
    return; 
  } 

  String datetime = getDateTimeString();


  String data = "{"; 
  data += "\"timestamp\":\""; 
  data += datetime; 
  data += "\",\"temperature\":"; 
  data += temperature; 
  data += ",\"humidity\":"; 
  data += humidity; 
  data += ",\"light\":"; 
  data += light; 
  data += "}"; 

  // BẮN DỮ LIỆU LÊN BROKER 
  client.publish(sensorTopic, data.c_str()); 

  Serial.println("Gui du lieu cam bien:"); 
  Serial.println(data); 

  delay(2000); 
}