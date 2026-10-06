# IoT Dashboard Backend - Spring Boot

## Yeu cau
- Java 17+
- Maven 3.8+
- MySQL 8.0+
- Mosquitto MQTT Broker (port 1884)

## Cau hinh MySQL
```sql
CREATE DATABASE iot_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Password: Linh123@ (da cau hinh trong application.properties)

## Chay ung dung

```bash
# Buoc 1: Dam bao MySQL dang chay
# Buoc 2: Dam bao Mosquitto MQTT Broker dang chay (port 1884)
# Buoc 3:
cd BE
mvn spring-boot:run
```

Hoac build JAR:
```bash
mvn clean package
java -jar target/iot-1.0.0.jar
```

## API Endpoints

- POST   /api/auth/login              - Dang nhap
- GET    /api/sensor/latest           - Gia tri sensor moi nhat
- GET    /api/sensor/chart?hours=1   - Du lieu bieu do
- GET    /api/sensor?page=0&size=10  - Danh sach sensor co phan trang
- GET    /api/devices                 - Danh sach thiet bi
- POST   /api/devices/control         - Gui lenh bat/tat
- GET    /api/history?page=0&size=10 - Lich su hoat dong

## WebSocket (STOMP)
- Endpoint: ws://localhost:8080/ws
- Subscribe /topic/sensor         - Nhan du lieu sensor realtime
- Subscribe /topic/device-status  - Nhan trang thai thiet bi
- Subscribe /topic/action-log     - Nhan log hanh dong moi

## Tai khoan mac dinh
- Username: admin
- Password: admin123
