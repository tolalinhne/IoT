package com.ptit.iot.repository;

import com.ptit.iot.model.DataSensor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DataSensorRepository extends JpaRepository<DataSensor, Long> {

    Optional<DataSensor> findTopByOrderByTimestampDesc();

    /** Dùng trong migration để tìm bản ghi cũ chưa có status */
    List<DataSensor> findByTempStatusIsNull();

    /** Dùng trong migration để tìm bản ghi cũ chưa gán sensor FK */
    List<DataSensor> findBySensorIsNull();

    @Query("SELECT d FROM DataSensor d " +
           "LEFT JOIN FETCH d.sensor s " +
           "WHERE (:from IS NULL OR d.timestamp >= :from) AND " +
           "(:to IS NULL OR d.timestamp <= :to) AND " +
           "(:minTemp IS NULL OR d.temperature >= :minTemp) AND " +
           "(:maxTemp IS NULL OR d.temperature <= :maxTemp) AND " +
           "(:minHumid IS NULL OR d.humidity >= :minHumid) AND " +
           "(:maxHumid IS NULL OR d.humidity <= :maxHumid) AND " +
           "(:minLight IS NULL OR d.light >= :minLight) AND " +
           "(:maxLight IS NULL OR d.light <= :maxLight) " +
           "ORDER BY d.timestamp DESC")
    Page<DataSensor> findWithFilters(
            @Param("from")      LocalDateTime from,
            @Param("to")        LocalDateTime to,
            @Param("minTemp")   Double minTemp,
            @Param("maxTemp")   Double maxTemp,
            @Param("minHumid")  Double minHumid,
            @Param("maxHumid")  Double maxHumid,
            @Param("minLight")  Integer minLight,
            @Param("maxLight")  Integer maxLight,
            Pageable pageable
    );

    @Query("SELECT d FROM DataSensor d LEFT JOIN FETCH d.sensor " +
           "WHERE d.timestamp >= :from ORDER BY d.timestamp ASC")
    List<DataSensor> findChartData(@Param("from") LocalDateTime from);
}