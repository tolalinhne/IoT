package com.ptit.iot.controller;

import com.ptit.iot.dto.ActionLogDTO;
import com.ptit.iot.dto.ApiResponse;
import com.ptit.iot.service.DeviceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
public class HistoryController {

    private final DeviceService deviceService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHistory(
            @RequestParam(required = false) String deviceKey,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        Page<ActionLogDTO> result = deviceService.getHistory(deviceKey, action, status, from, to, pageable);

        Map<String, Object> response = Map.of(
                "content",       result.getContent(),
                "totalElements", result.getTotalElements(),
                "totalPages",    result.getTotalPages(),
                "currentPage",   result.getNumber(),
                "size",          result.getSize()
        );
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}