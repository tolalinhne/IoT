package com.ptit.iot.config;

import com.ptit.iot.model.Device;
import com.ptit.iot.model.Sensor;
import com.ptit.iot.model.User;
import com.ptit.iot.repository.DataSensorRepository;
import com.ptit.iot.repository.DeviceRepository;
import com.ptit.iot.repository.SensorRepository;
import com.ptit.iot.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.LocalDateTime;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    private final DeviceRepository deviceRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final DataSensorRepository dataSensorRepository;
    private final SensorRepository sensorRepository;

    @Bean
    public ApplicationRunner initData() {
        return args -> {
            // 1. Khởi tạo thiết bị LED
            initDevice("LED1", "LED 01", "light", "Phong Khach");
            initDevice("LED2", "LED 02", "light", "Bep");
            initDevice("LED3", "LED 03", "light", "Phong Ngu");

            // 2. Khởi tạo cảm biến mặc định
            initSensor("DHT11_LDR", "Cảm biến DHT11 + LDR", "temperature_humidity_light", "Phòng IoT");

            // 3. Khởi tạo tài khoản admin
            if (userRepository.findByUsername("admin").isEmpty()) {
                User user = new User();
                user.setUsername("admin");
                user.setPassword(passwordEncoder.encode("admin123"));
                user.setFullName("Pham Mai Linh");
                user.setEmail("B23DCCN488@ptit.edu.vn");
                user.setStudentId("B23DCCN488");
                user.setClassRoom("D23CQCN02-B");
                user.setCreatedAt(LocalDateTime.now());
                userRepository.save(user);
                log.info("Default user 'admin' created");
            }

            // 4. Migration: Cập nhật status cho các bản ghi sensor cũ bị thiếu status
            var oldRecords = dataSensorRepository.findByTempStatusIsNull();
            if (!oldRecords.isEmpty()) {
                log.info("Migration: Updating statuses for {} old sensor records", oldRecords.size());
                Sensor defaultSensor = sensorRepository.findBySensorKey("DHT11_LDR").orElse(null);
                for (var record : oldRecords) {
                    record.setTempStatus(calculateTempStatus(record.getTemperature()));
                    record.setHumidStatus(calculateHumidStatus(record.getHumidity()));
                    record.setLightStatus(calculateLightStatus(record.getLight()));
                    if (record.getSensor() == null && defaultSensor != null) {
                        record.setSensor(defaultSensor);
                    }
                }
                dataSensorRepository.saveAll(oldRecords);
                log.info("Migration completed.");
            }

            // 5. Migration: Gán sensor mặc định cho bản ghi cũ chưa có FK sensor
            var noSensorRecords = dataSensorRepository.findBySensorIsNull();
            if (!noSensorRecords.isEmpty()) {
                log.info("Migration: Assigning default sensor to {} records without sensor FK", noSensorRecords.size());
                Sensor defaultSensor = sensorRepository.findBySensorKey("DHT11_LDR").orElse(null);
                if (defaultSensor != null) {
                    noSensorRecords.forEach(r -> r.setSensor(defaultSensor));
                    dataSensorRepository.saveAll(noSensorRecords);
                    log.info("Migration: sensor FK assigned.");
                }
            }
        };
    }

    private void initDevice(String key, String name, String type, String location) {
        if (deviceRepository.findByDeviceKey(key).isEmpty()) {
            Device d = new Device();
            d.setDeviceKey(key);
            d.setName(name);
            d.setType(type);
            d.setStatus(false);
            d.setOnline(true);
            d.setLocation(location);
            d.setLastChanged(LocalDateTime.now());
            deviceRepository.save(d);
            log.info("Device '{}' initialized", key);
        }
    }

    private void initSensor(String key, String name, String type, String location) {
        if (sensorRepository.findBySensorKey(key).isEmpty()) {
            Sensor s = new Sensor();
            s.setSensorKey(key);
            s.setName(name);
            s.setType(type);
            s.setLocation(location);
            s.setActive(true);
            sensorRepository.save(s);
            log.info("Sensor '{}' initialized", key);
        }
    }

    private String calculateTempStatus(Double temp) {
        if (temp == null) return "Bình thường";
        if (temp < 18)   return "Cảnh báo thấp";
        if (temp > 30)   return "Cảnh báo cao";
        return "Bình thường";
    }

    private String calculateHumidStatus(Double humid) {
        if (humid == null) return "Bình thường";
        if (humid < 40)   return "Cảnh báo thấp";
        if (humid > 70)   return "Cảnh báo cao";
        return "Bình thường";
    }

    private String calculateLightStatus(Integer light) {
        if (light == null) return "Bình thường";
        if (light < 100)   return "Cảnh báo thấp";
        if (light > 1000)  return "Cảnh báo cao";
        return "Bình thường";
    }
}