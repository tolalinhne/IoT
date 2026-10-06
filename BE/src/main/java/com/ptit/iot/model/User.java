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
 * Bảng users: tài khoản người dùng trong hệ thống.
 * Quan hệ 1-N với ActionLog: một người dùng có nhiều bản ghi hành động điều khiển.
 */
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = "actionLogs")  // tránh vòng lặp trong equals/hashCode
@ToString(exclude = "actionLogs")           // tránh StackOverflow khi toString
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    private String fullName;
    private String email;
    private String studentId;
    private String classRoom;
    private String githubUrl;
    private String figmaUrl;
    private String postmanUrl;
    private String reportUrl;
    private String avatarUrl;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    /**
     * Quan hệ 1-N với ActionLog.
     * mappedBy = "user" tham chiếu đến field `user` trong ActionLog.
     * JsonIgnore để tránh circular reference khi serialize JSON (và tránh lộ password).
     */
    @JsonIgnore
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<ActionLog> actionLogs;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}