package com.example.digitalclock.controller;

import com.example.digitalclock.model.ClockData;
import com.example.digitalclock.service.ClockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class ClockController {

    @Autowired
    private ClockService clockService;

    @GetMapping("/")
    public String index(Model model, @RequestParam(defaultValue = "UTC") String timeZone) {
        ClockData clockData = clockService.getCurrentTime(timeZone);
        model.addAttribute("clockData", clockData);
        return "index";
    }
}