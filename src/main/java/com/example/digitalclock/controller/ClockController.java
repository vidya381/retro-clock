package com.example.digitalclock.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.example.digitalclock.service.ClockService;

@Controller
public class ClockController {

    @Autowired
    private ClockService clockService;

    @GetMapping("/")
    public String index(Model model) {
        List<String> timezones = clockService.getAvailableTimezones();
        model.addAttribute("timezones", timezones);
        return "index";
    }
}