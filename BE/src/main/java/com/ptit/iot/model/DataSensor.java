package com.ptit.iot.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * Bảng datasensor: lưu các bản ghi dữ liệu đo từ cảm biến.
 * Có quan hệ N-1 với Sensor (nhiều bản ghi dữ liệu thuộc về một loại cảm biến).
 */
@Entity
@Table(name = "datasensor")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DataSensor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * FK tới bảng sensor — xác định bản ghi này do cảm biến nào sinh ra.
     * Quan hệ N-1: nhiều bản ghi datasensor -> một Sensor.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sensor_id", nullable = true)
    @JsonIgnoreProperties({"dataList", "hibernateLazyInitializer", "handler"})
    private Sensor sensor;

    @Column(nullable = false)
    private Double temperature;

    @Column(nullable = false)
    private Double humidity;

    @Column(nullable = false)
    private Integer light;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "temp_status")
    private String tempStatus;

    @Column(name = "humid_status")
    private String humidStatus;

    @Column(name = "light_status")
    private String lightStatus;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
        this.tempStatus  = calculateTempStatus(this.temperature);
        this.humidStatus = calculateHumidStatus(this.humidity);
        this.lightStatus = calculateLightStatus(this.light);
    }

    private String calculateTempStatus(Double temp) {
        if (temp == null) return "Bình thường";
        if (temp < 18)   return "Cảnh báo thấp";
        if (temp > 30)   return "Cảnh báo cao";
        return "Bình thường";
    }

    private String calculateHumidStatus(Double humid) {
        if (humid == null) return "Bình thường";
        if (humid < 40)    return "Cảnh báo thấp";
        if (humid > 70)    return "Cảnh báo cao";
        return "Bình thường";
    }

    private String calculateLightStatus(Integer light) {
        if (light == null) return "Bình thường";
        if (light < 100)   return "Cảnh báo thấp";
        if (light > 1000)  return "Cảnh báo cao";
        return "Bình thường";
    }
}