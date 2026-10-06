package com.ptit.iot.controller;

import com.ptit.iot.dto.ApiResponse;
import com.ptit.iot.dto.DeviceControlRequest;
import com.ptit.iot.model.Device;
import com.ptit.iot.service.DeviceService;
import com.ptit.iot.service.MqttService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/devices")
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceService deviceService;
    private final MqttService mqttService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Device>>> getAllDevices() {
        return ResponseEntity.ok(ApiResponse.ok(deviceService.getAllDevices()));
    }

    @GetMapping("/mqtt-status")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> getMqttStatus() {
        return ResponseEntity.ok(ApiResponse.ok(Map.of("connected", mqttService.isConnected())));
    }

    @PostMapping("/control")
    public ResponseEntity<ApiResponse<String>> controlDevice(@RequestBody DeviceControlRequest request,
                                                              HttpServletRequest httpReq) {
        try {
            // Ưu tiên user từ request body, fallback sang session
            String username = request.getUser();
            if (username == null || username.isBlank()) {
                jakarta.servlet.http.HttpSession session = httpReq.getSession(false);
                username = (session != null) ? (String) session.getAttribute("username") : null;
            }
            deviceService.sendControl(request.getCommand(), username);
            return ResponseEntity.ok(ApiResponse.ok("Lenh da duoc gui: " + request.getCommand(), null));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Loi gui lenh: " + e.getMessage()));
        }
    }
}