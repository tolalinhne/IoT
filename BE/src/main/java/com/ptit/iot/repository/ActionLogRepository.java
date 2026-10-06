package com.ptit.iot.repository;

import com.ptit.iot.model.ActionLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface ActionLogRepository extends JpaRepository<ActionLog, Long> {

    /**
     * Tìm bản ghi ActionLog mới nhất đang ở trạng thái 'loading' cho một thiết bị cụ thể.
     * Dùng để cập nhật trạng thái sau khi phần cứng xác nhận.
     */
    @Query("SELECT a FROM ActionLog a WHERE a.device.deviceKey = :deviceKey " +
           "AND a.status = :status ORDER BY a.timestamp DESC LIMIT 1")
    Optional<ActionLog> findTopByDeviceKeyAndStatusOrderByTimestampDesc(
            @Param("deviceKey") String deviceKey,
            @Param("status") String status);

    /**
     * Lọc lịch sử với nhiều điều kiện tùy chọn.
     * - deviceKey : lọc theo thiết bị (so sánh với device.deviceKey)
     * - action    : lọc theo hành động (ON/OFF)
     * - status    : lọc theo trạng thái (loading/success/failed)
     * - from/to   : lọc theo khoảng thời gian
     */
    @Query("SELECT a FROM ActionLog a " +
           "LEFT JOIN FETCH a.device d " +
           "LEFT JOIN FETCH a.user u " +
           "WHERE (:deviceKey IS NULL OR :deviceKey = '' OR d.deviceKey = :deviceKey) AND " +
           "(:action IS NULL OR :action = '' OR a.action = :action) AND " +
           "(:status IS NULL OR :status = '' OR a.status = :status) AND " +
           "(:from IS NULL OR a.timestamp >= :from) AND " +
           "(:to IS NULL OR a.timestamp <= :to) " +
           "ORDER BY a.timestamp DESC")
    Page<ActionLog> findWithFilters(
            @Param("deviceKey") String deviceKey,
            @Param("action")    String action,
            @Param("status")    String status,
            @Param("from")      LocalDateTime from,
            @Param("to")        LocalDateTime to,
            Pageable pageable);
}