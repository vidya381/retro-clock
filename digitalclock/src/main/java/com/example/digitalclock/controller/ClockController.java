package com.example.digitalclock.controller;

import com.example.digitalclock.service.ClockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;
import java.util.TimeZone;

@Controller
public class ClockController {

    @Autowired
    private ClockService clockService;

    @GetMapping("/")
    public String index(Model model) {
        List<String> availableTimezones = clockService.getAvailableTimezones();
        model.addAttribute("timezones", availableTimezones);
        return "index";
    }
}