package com.example.tsh.web.Controller;

import com.example.tsh.web.Entity.TimeLog;
import com.example.tsh.web.Service.TimeLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/time-logs")
public class TimeLogController {

    private final TimeLogService timeLogService;

    @Autowired
    public TimeLogController(TimeLogService timeLogService) {
        this.timeLogService = timeLogService;
    }

    @PostMapping("/time-in/{employeeId}")
    public ResponseEntity<?> timeIn(@PathVariable Long employeeId) {
        try {
            TimeLog timeLog = timeLogService.timeIn(employeeId);
            return ResponseEntity.ok(timeLog);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/time-out/{employeeId}")
    public ResponseEntity<?> timeOut(@PathVariable Long employeeId) {
        try {
            TimeLog timeLog = timeLogService.timeOut(employeeId);
            return ResponseEntity.ok(timeLog);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/status/{employeeId}")
    public ResponseEntity<Map<String, Boolean>> checkTimeLogStatus(@PathVariable Long employeeId) {
        Map<String, Boolean> status = new HashMap<>();
        status.put("hasActiveLog", timeLogService.hasActiveTimeLog(employeeId));
        return ResponseEntity.ok(status);
    }

    @GetMapping("/today/{employeeId}")
    public ResponseEntity<List<TimeLog>> getTodayTimeLogs(@PathVariable Long employeeId) {
        return ResponseEntity.ok(timeLogService.getTodayTimeLogs(employeeId));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<TimeLog>> getAllEmployeeTimeLogs(@PathVariable Long employeeId) {
        return ResponseEntity.ok(timeLogService.getAllEmployeeTimeLogs(employeeId));
    }

    @GetMapping("/employee/{employeeId}/date-range")
    public ResponseEntity<List<TimeLog>> getTimeLogsByDateRange(
            @PathVariable Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(timeLogService.getTimeLogsByDateRange(employeeId, startDate, endDate));
    }
}
