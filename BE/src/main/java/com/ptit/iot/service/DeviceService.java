package com.ptit.iot.service;

import com.ptit.iot.dto.ActionLogDTO;
import com.ptit.iot.model.ActionLog;
import com.ptit.iot.model.Device;
import com.ptit.iot.model.User;
import com.ptit.iot.repository.ActionLogRepository;
import com.ptit.iot.repository.DeviceRepository;
import com.ptit.iot.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeviceService {

    private final DeviceRepository deviceRepository;
    private final ActionLogRepository actionLogRepository;
    private final UserRepository userRepository;
    private final MqttService mqttService;
    private final SimpMessagingTemplate messagingTemplate;

    public List<Device> getAllDevices() {
        return deviceRepository.findAllByOrderByIdAsc();
    }

    public Optional<Device> getDevice(Long id) {
        return deviceRepository.findById(id);
    }

    /**
     * Gửi lệnh điều khiển và ghi vào action_log với FK tới User và Device.
     *
     * @param command  Lệnh điều khiển (ví dụ: "LED1_ON", "ALL_OFF")
     * @param username Tên đăng nhập của người thực hiện (nullable)
     */
    @Transactional
    public ActionLogDTO sendControl(String command, String username) {
        // Lấy đối tượng User từ DB nếu có
        User user = (username != null && !username.isBlank())
                ? userRepository.findByUsername(username).orElse(null)
                : null;

        if ("ALL_ON".equals(command)) {
            publishAndLog("LED1", "ON", user);
            publishAndLog("LED2", "ON", user);
            publishAndLog("LED3", "ON", user);
            mqttService.publishControl(command);
            return null;
        } else if ("ALL_OFF".equals(command)) {
            publishAndLog("LED1", "OFF", user);
            publishAndLog("LED2", "OFF", user);
            publishAndLog("LED3", "OFF", user);
            mqttService.publishControl(command);
            return null;
        }

        if (command.contains("_")) {
            String[] parts = command.split("_", 2);
            if (parts.length == 2) {
                String deviceKey = parts[0];
                String action    = parts[1];
                ActionLog saved  = publishAndLog(deviceKey, action, user);
                mqttService.publishControl(command);
                return saved != null ? ActionLogDTO.from(saved) : null;
            }
        }

        log.warn("Unknown command format: {}", command);
        return null;
    }

    /**
     * Tạo ActionLog với FK thực sự tới Device và User, lưu DB và broadcast WebSocket.
     * Chạy trong transaction của sendControl (caller), nên session Hibernate vẫn mở.
     */
    private ActionLog publishAndLog(String deviceKey, String action, User user) {
        Optional<Device> deviceOpt = deviceRepository.findByDeviceKey(deviceKey);
        if (deviceOpt.isEmpty()) {
            log.warn("Device not found for key: {}", deviceKey);
            return null;
        }

        Device device = deviceOpt.get();
        ActionLog entry = new ActionLog();
        entry.setDevice(device);       // FK tới Device
        entry.setUser(user);           // FK tới User (nullable)
        entry.setAction(action);
        entry.setStatus("loading");
        entry.setTimestamp(LocalDateTime.now());

        ActionLog saved = actionLogRepository.save(entry);

        // Build DTO trực tiếp từ object đã có trong memory (không dùng lazy loading)
        ActionLogDTO dto = new ActionLogDTO();
        dto.setId(saved.getId());
        dto.setDeviceKey(device.getDeviceKey());
        dto.setDeviceName(device.getName());
        dto.setDeviceType(device.getType());
        dto.setUsername(user != null ? user.getUsername() : "system");
        dto.setUserFullName(user != null ? user.getFullName() : "Hệ thống");
        dto.setAction(saved.getAction());
        dto.setStatus(saved.getStatus());
        dto.setTimestamp(saved.getTimestamp());
        messagingTemplate.convertAndSend("/topic/action-log", dto);
        return saved;
    }

    /**
     * Lọc lịch sử action_log theo các điều kiện tùy chọn, trả về DTO.
     */
    public Page<ActionLogDTO> getHistory(String deviceKey, String action, String status,
                                         LocalDateTime from, LocalDateTime to, Pageable pageable) {
        return actionLogRepository
                .findWithFilters(deviceKey, action, status, from, to, pageable)
                .map(ActionLogDTO::from);
    }

    /** Overload backward compat (không có username) */
    public ActionLogDTO sendControl(String command) {
        return sendControl(command, null);
    }
}