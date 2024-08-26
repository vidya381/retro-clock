package com.example.digitalclock.service;

import com.example.digitalclock.model.ClockData;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Service
public class ClockService {
    public ClockData getCurrentTime(String timeZone) {
        ZoneId zoneId = ZoneId.of(timeZone);
        LocalDateTime now = LocalDateTime.now(zoneId);
        return new ClockData(now, zoneId);
    }
}