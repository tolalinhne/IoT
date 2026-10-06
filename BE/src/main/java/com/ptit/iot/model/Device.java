package com.ptit.iot.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.ToString;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Bảng devices: quản lý các thiết bị IoT trong hệ thống.
 * Quan hệ 1-N với ActionLog: một thiết bị có nhiều bản ghi lịch sử điều khiển.
 */
@Entity
@Table(name = "devices")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = "actionLogs")  // tránh vòng lặp trong equals/hashCode
@ToString(exclude = "actionLogs")           // tránh StackOverflow khi toString
public class Device {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String deviceKey;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private Boolean status;

    @Column(nullable = false)
    private Boolean online;

    private String location;

    private LocalDateTime lastChanged;

    /**
     * Quan hệ 1-N với ActionLog.
     * mappedBy = "device" tham chiếu đến field `device` trong ActionLog.
     * JsonIgnore để tránh circular reference khi serialize JSON.
     */
    @JsonIgnore
    @OneToMany(mappedBy = "device", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ActionLog> actionLogs;

    @PrePersist
    protected void onCreate() {
        if (lastChanged == null) lastChanged = LocalDateTime.now();
        if (status == null) status = false;
        if (online == null) online = true;
    }
}