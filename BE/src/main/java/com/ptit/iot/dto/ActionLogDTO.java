package com.ptit.iot.dto;

import com.ptit.iot.model.ActionLog;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * DTO trả về cho client khi query ActionLog.
 * Flatten thông tin User và Device thành các trường đơn giản
 * để tránh vòng lặp JSON khi serialize quan hệ bidirectional.
 */
@Data
public class ActionLogDTO {

    private Long id;

    // Thông tin thiết bị (flatten từ Device)
    private String deviceKey;
    private String deviceName;
    private String deviceType;

    // Thông tin người dùng (flatten từ User)
    private String username;
    private String userFullName;

    // Thông tin hành động
    private String action;
    private String status;
    private LocalDateTime timestamp;

    /** Factory method: chuyển đổi từ Entity sang DTO */
    public static ActionLogDTO from(ActionLog log) {
        ActionLogDTO dto = new ActionLogDTO();
        dto.setId(log.getId());

        if (log.getDevice() != null) {
            dto.setDeviceKey(log.getDevice().getDeviceKey());
            dto.setDeviceName(log.getDevice().getName());
            dto.setDeviceType(log.getDevice().getType());
        }

        if (log.getUser() != null) {
            dto.setUsername(log.getUser().getUsername());
            dto.setUserFullName(log.getUser().getFullName());
        } else {
            dto.setUsername("system");
            dto.setUserFullName("Hệ thống");
        }

        dto.setAction(log.getAction());
        dto.setStatus(log.getStatus());
        dto.setTimestamp(log.getTimestamp());
        return dto;
    }
}
