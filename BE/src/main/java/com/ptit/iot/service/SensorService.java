package com.ptit.iot.service;

import com.ptit.iot.model.DataSensor;
import com.ptit.iot.repository.DataSensorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SensorService {

    private final DataSensorRepository sensorRepository;

    public Optional<DataSensor> getLatest() {
        return sensorRepository.findTopByOrderByTimestampDesc();
    }

    public Page<DataSensor> getSensorData(LocalDateTime from, LocalDateTime to,
                                           Double minTemp, Double maxTemp,
                                           Double minHumid, Double maxHumid,
                                           Integer minLight, Integer maxLight,
                                           Pageable pageable) {
        return sensorRepository.findWithFilters(from, to, minTemp, maxTemp,
                minHumid, maxHumid, minLight, maxLight, pageable);
    }

    public List<DataSensor> getChartData(int hours) {
        LocalDateTime from = LocalDateTime.now().minusHours(hours);
        return sensorRepository.findChartData(from);
    }
}