package com.example.tsh.web.Controller;

import com.example.tsh.web.Entity.Employee;
import com.example.tsh.web.Entity.HR;
import com.example.tsh.web.Entity.TimeLog;
import com.example.tsh.web.Repository.EmployeeRepo;
import com.example.tsh.web.Repository.HRRepo;
import com.example.tsh.web.Repository.TimeLogRepo;
import com.example.tsh.web.Service.TimeLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.sql.Time;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hr/time-logs")
@CrossOrigin(origins = "http://localhost:5173")
public class HrTimeLogController {

    @Autowired
    private TimeLogService timeLogService;

    @Autowired
    private EmployeeRepo employeeRepo;

    @Autowired
    private HRRepo hrRepository;

    @Autowired
    private TimeLogRepo timeLogRepo;

    @PutMapping("/adjust")
    public ResponseEntity<?> adjustTimeLog(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {

        // Authenticate HR
        String hrUsername = authentication.getName();
        HR hr = hrRepository.findByUsername(hrUsername)
                .orElseThrow(() -> new RuntimeException("Unauthorized: HR not found"));

        Long employeeId = Long.valueOf(request.get("employeeId").toString());
        Long timeLogId = Long.valueOf(request.get("timeLogId").toString());

        // Parse timeIn and timeOut
        LocalDateTime timeIn = request.get("timeIn") != null
                ? LocalDateTime.parse(request.get("timeIn").toString().replace(" ", "T"))
                : null;

        LocalDateTime timeOut = request.get("timeOut") != null
                ? LocalDateTime.parse(request.get("timeOut").toString().replace(" ", "T"))
                : null;

        // Find employee
        Employee employee = employeeRepo.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Adjust log
        TimeLog updatedLog = timeLogService.adjustTimeLog(timeLogId, employee, timeIn, timeOut);
        return ResponseEntity.ok(updatedLog);
    }



    @GetMapping("/all")
    public ResponseEntity<List<TimeLog>> getAllTimeLogs(Authentication authentication) {
        // Confirm HR access
        String username = authentication.getName();
        HR hr = hrRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Unauthorized: HR not found"));

        List<TimeLog> logs = timeLogService.findAllTimeLogs();
        return ResponseEntity.ok(logs);
    }

    // In HrTimeLogController.java
    @GetMapping("/assigned-logs")
    public ResponseEntity<List<TimeLog>> getAssignedTimeLogs(Authentication authentication) {
        String username = authentication.getName();
        HR hr = hrRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Unauthorized: HR not found"));

        List<TimeLog> logs = timeLogRepo.findByAssignedHr(hr);
        return ResponseEntity.ok(logs);
    }
}
