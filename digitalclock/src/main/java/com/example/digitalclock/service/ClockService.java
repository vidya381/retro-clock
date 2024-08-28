package com.example.digitalclock.service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.digitalclock.model.ClockData;

@Service
public class ClockService {

    public List<ClockData> getCurrentTimes(List<String> timeZones) {
        return timeZones.stream()
                .map(zone -> new ClockData(LocalDateTime.now(ZoneId.of(zone)), ZoneId.of(zone)))
                .collect(Collectors.toList());
    }
}