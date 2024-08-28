package com.example.digitalclock.controller;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.example.digitalclock.model.ClockData;
import com.example.digitalclock.service.ClockService;

@Controller
public class ClockController {

    @Autowired
    private ClockService clockService;

    @GetMapping("/")
    public String index(Model model, @RequestParam(defaultValue = "UTC,America/New_York,Asia/Tokyo") String timeZones) {
        List<String> zoneList = Arrays.asList(timeZones.split(","));
        List<ClockData> clockDataList = clockService.getCurrentTimes(zoneList);
        model.addAttribute("clockDataList", clockDataList);
        return "index";
    }
}