package com.ptit.iot.controller;

import com.ptit.iot.dto.ApiResponse;
import com.ptit.iot.model.DataSensor;
import com.ptit.iot.service.SensorService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sensor")
@RequiredArgsConstructor
public class SensorController {

    private final SensorService sensorService;

    @GetMapping("/latest")
    public ResponseEntity<ApiResponse<DataSensor>> getLatest() {
        return sensorService.getLatest()
                .map(s -> ResponseEntity.ok(ApiResponse.ok(s)))
                .orElse(ResponseEntity.ok(ApiResponse.ok(null)));
    }

    @GetMapping("/chart")
    public ResponseEntity<ApiResponse<List<DataSensor>>> getChart(
            @RequestParam(defaultValue = "1") int hours) {
        return ResponseEntity.ok(ApiResponse.ok(sensorService.getChartData(hours)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSensorData(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(required = false) Double minTemp,
            @RequestParam(required = false) Double maxTemp,
            @RequestParam(required = false) Double minHumid,
            @RequestParam(required = false) Double maxHumid,
            @RequestParam(required = false) Integer minLight,
            @RequestParam(required = false) Integer maxLight,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        Page<DataSensor> result = sensorService.getSensorData(from, to, minTemp, maxTemp,
                minHumid, maxHumid, minLight, maxLight, pageable);

        Map<String, Object> response = Map.of(
                "content", result.getContent(),
                "totalElements", result.getTotalElements(),
                "totalPages", result.getTotalPages(),
                "currentPage", result.getNumber(),
                "size", result.getSize()
        );
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}