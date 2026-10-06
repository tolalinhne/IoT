package com.ptit.iot.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SensorPayload {
    private Double temperature;
    private Double humidity;
    private Integer light;
    private String timestamp;
}