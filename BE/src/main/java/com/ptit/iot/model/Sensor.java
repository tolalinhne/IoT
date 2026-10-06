package com.ptit.iot.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

/**
 * Bảng sensor: định nghĩa các loại cảm biến trong hệ thống.
 * Ví dụ: DHT11 (đo nhiệt độ + độ ẩm), LDR (đo ánh sáng),...
 * Có quan hệ 1-N với DataSensor (một sensor sinh ra nhiều bản ghi dữ liệu).
 */
@Entity
@Table(name = "sensor")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Sensor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Tên định danh kỹ thuật, ví dụ: "DHT11", "LDR" */
    @Column(nullable = false, unique = true, length = 50)
    private String sensorKey;

    /** Tên hiển thị, ví dụ: "Cảm biến nhiệt độ & độ ẩm" */
    @Column(nullable = false, length = 100)
    private String name;

    /** Loại cảm biến: "temperature_humidity", "light",... */
    @Column(nullable = false, length = 50)
    private String type;

    /** Vị trí đặt cảm biến */
    @Column(length = 100)
    private String location;

    /** Trạng thái hoạt động */
    @Column(nullable = false)
    private Boolean active = true;

    /** Quan hệ 1-N: Một sensor sinh ra nhiều bản ghi DataSensor */
    @JsonIgnore
    @OneToMany(mappedBy = "sensor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DataSensor> dataList;
}
