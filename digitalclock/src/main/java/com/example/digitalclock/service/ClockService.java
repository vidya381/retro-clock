package com.example.digitalclock.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.TimeZone;

import org.springframework.stereotype.Service;

@Service
public class ClockService {

    public List<String> getAvailableTimezones() {
        String[] availableIDs = TimeZone.getAvailableIDs();
        List<String> timezones = new ArrayList<>();
        for (String id : availableIDs) {
            timezones.add(id);
        }
        Collections.sort(timezones);
        return timezones;
    }
}