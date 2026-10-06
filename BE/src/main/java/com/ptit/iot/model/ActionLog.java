package com.ptit.iot.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * Bảng action_log: ghi lại lịch sử các thao tác điều khiển thiết bị.
 * - Quan hệ N-1 với User  : nhiều log -> một người dùng thực hiện.
 * - Quan hệ N-1 với Device: nhiều log -> một thiết bị bị điều khiển.
 */
@Entity
@Table(name = "action_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * FK tới bảng users — người dùng thực hiện hành động.
     * Quan hệ N-1: nhiều action_log -> một User.
     * nullable=true: cho phép null khi hành động do hệ thống/MQTT tự động.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User user;

    /**
     * FK tới bảng devices — thiết bị bị điều khiển.
     * Quan hệ N-1: nhiều action_log -> một Device.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = true)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Device device;

    /** Hành động: "ON", "OFF" */
    @Column(nullable = false, length = 20)
    private String action;

    /** Trạng thái: "loading", "success", "failed" */
    @Column(nullable = false, length = 20)
    private String status;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) timestamp = LocalDateTime.now();
    }
}