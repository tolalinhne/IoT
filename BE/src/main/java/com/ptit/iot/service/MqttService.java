package com.ptit.iot.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ptit.iot.dto.ActionLogDTO;
import com.ptit.iot.dto.DeviceStatusPayload;
import com.ptit.iot.dto.SensorPayload;
import com.ptit.iot.model.ActionLog;
import com.ptit.iot.model.DataSensor;
import com.ptit.iot.model.Device;
import com.ptit.iot.model.Sensor;
import com.ptit.iot.repository.ActionLogRepository;
import com.ptit.iot.repository.DataSensorRepository;
import com.ptit.iot.repository.DeviceRepository;
import com.ptit.iot.repository.SensorRepository;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.paho.client.mqttv3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class MqttService {

    @Value("${mqtt.broker.url}")
    private String brokerUrl;

    @Value("${mqtt.broker.username}")
    private String mqttUsername;

    @Value("${mqtt.broker.password}")
    private String mqttPassword;

    @Value("${mqtt.client.id}")
    private String clientId;

    @Value("${mqtt.topic.sensor}")
    private String sensorTopic;

    @Value("${mqtt.topic.control}")
    private String controlTopic;

    @Value("${mqtt.topic.status}")
    private String statusTopic;

    private final DataSensorRepository sensorDataRepository;
    private final SensorRepository sensorRepository;
    private final DeviceRepository deviceRepository;
    private final ActionLogRepository actionLogRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    private MqttClient mqttClient;

    /** SensorKey mặc định: toàn bộ dữ liệu từ MQTT đến từ node DHT11+LDR */
    private static final String DEFAULT_SENSOR_KEY = "DHT11_LDR";

    @PostConstruct
    public void connect() {
        try {
            mqttClient = new MqttClient(brokerUrl, clientId + "_" + System.currentTimeMillis());
            MqttConnectOptions options = new MqttConnectOptions();
            options.setUserName(mqttUsername);
            options.setPassword(mqttPassword.toCharArray());
            options.setAutomaticReconnect(true);
            options.setCleanSession(true);
            options.setConnectionTimeout(10);

            mqttClient.setCallback(new MqttCallback() {
                @Override
                public void connectionLost(Throwable cause) {
                    log.warn("MQTT connection lost: {}", cause.getMessage());
                }

                @Override
                public void messageArrived(String topic, MqttMessage message) {
                    handleMessage(topic, new String(message.getPayload()));
                }

                @Override
                public void deliveryComplete(IMqttDeliveryToken token) {}
            });

            mqttClient.connect(options);
            mqttClient.subscribe(sensorTopic, 1);
            mqttClient.subscribe(statusTopic, 1);
            log.info("MQTT connected to {} | subscribed: {} and {}", brokerUrl, sensorTopic, statusTopic);
        } catch (MqttException e) {
            log.error("Failed to connect to MQTT broker: {}", e.getMessage());
        }
    }

    private void handleMessage(String topic, String payload) {
        log.debug("MQTT [{}]: {}", topic, payload);
        try {
            if (topic.equals(sensorTopic)) {
                handleSensorData(payload);
            } else if (topic.equals(statusTopic)) {
                handleDeviceStatus(payload);
            }
        } catch (Exception e) {
            log.error("Error processing MQTT message: {}", e.getMessage());
        }
    }

    /**
     * Xử lý dữ liệu cảm biến từ MQTT.
     * Lưu DataSensor với FK tới Sensor (DEFAULT_SENSOR_KEY).
     */
    private void handleSensorData(String payload) throws Exception {
        SensorPayload data = objectMapper.readValue(payload, SensorPayload.class);

        // Lấy Sensor entity theo sensorKey mặc định
        Sensor sensor = sensorRepository.findBySensorKey(DEFAULT_SENSOR_KEY)
                .orElseGet(() -> {
                    // Tự động tạo nếu chưa có (fallback an toàn)
                    Sensor s = new Sensor();
                    s.setSensorKey(DEFAULT_SENSOR_KEY);
                    s.setName("Cảm biến DHT11 + LDR");
                    s.setType("temperature_humidity_light");
                    s.setLocation("Phòng IoT");
                    s.setActive(true);
                    return sensorRepository.save(s);
                });

        DataSensor sensorRecord = new DataSensor();
        sensorRecord.setSensor(sensor);                     // FK tới Sensor
        sensorRecord.setTemperature(data.getTemperature());
        sensorRecord.setHumidity(data.getHumidity());
        sensorRecord.setLight(data.getLight());
        sensorRecord.setTimestamp(LocalDateTime.now());

        DataSensor saved = sensorDataRepository.save(sensorRecord);
        messagingTemplate.convertAndSend("/topic/sensor", saved);
        log.debug("Sensor saved & broadcast: temp={} humid={} light={}",
                data.getTemperature(), data.getHumidity(), data.getLight());
    }

    /**
     * Xử lý phản hồi trạng thái thiết bị từ hardware.
     * Cập nhật Device và ActionLog (chuyển 'loading' -> 'success').
     */
    private void handleDeviceStatus(String payload) throws Exception {
        DeviceStatusPayload status = objectMapper.readValue(payload, DeviceStatusPayload.class);
        String deviceKey = status.getDevice();
        boolean isOn = "ON".equalsIgnoreCase(status.getStatus());

        // Cập nhật trạng thái Device
        Optional<Device> deviceOpt = deviceRepository.findByDeviceKey(deviceKey);
        if (deviceOpt.isPresent()) {
            Device device = deviceOpt.get();
            device.setStatus(isOn);
            device.setLastChanged(LocalDateTime.now());
            deviceRepository.save(device);
            messagingTemplate.convertAndSend("/topic/device-status", device);
            log.info("Device {} -> {}", deviceKey, status.getStatus());
        }

        // Cập nhật ActionLog 'loading' -> 'success' sau khi hardware xác nhận
        actionLogRepository
                .findTopByDeviceKeyAndStatusOrderByTimestampDesc(deviceKey, "loading")
                .ifPresent(logEntry -> {
                    logEntry.setStatus("success");
                    ActionLog updated = actionLogRepository.save(logEntry);
                    // Broadcast DTO để tránh lazy loading exception
                    messagingTemplate.convertAndSend("/topic/action-log", ActionLogDTO.from(updated));
                    log.info("ActionLog #{} updated to success for device {}", updated.getId(), deviceKey);
                });
    }

    public void publishControl(String command) {
        try {
            if (mqttClient != null && mqttClient.isConnected()) {
                MqttMessage message = new MqttMessage(command.getBytes());
                message.setQos(1);
                mqttClient.publish(controlTopic, message);
                log.info("Published to {}: {}", controlTopic, command);
            } else {
                log.warn("MQTT not connected, cannot publish: {}", command);
            }
        } catch (MqttException e) {
            log.error("Failed to publish MQTT message: {}", e.getMessage());
        }
    }

    public boolean isConnected() {
        return mqttClient != null && mqttClient.isConnected();
    }

    @PreDestroy
    public void disconnect() {
        try {
            if (mqttClient != null && mqttClient.isConnected()) {
                mqttClient.disconnect();
                log.info("MQTT disconnected");
            }
        } catch (MqttException e) {
            log.error("Error disconnecting MQTT: {}", e.getMessage());
        }
    }
}