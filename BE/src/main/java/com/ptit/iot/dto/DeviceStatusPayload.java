package com.ptit.iot.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeviceStatusPayload {
    private String device;
    private String status;
    private String timestamp;
}