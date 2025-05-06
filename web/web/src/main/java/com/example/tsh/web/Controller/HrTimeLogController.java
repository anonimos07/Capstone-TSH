package com.example.tsh.web.Controller;

import com.example.tsh.web.Entity.Employee;
import com.example.tsh.web.Entity.HR;
import com.example.tsh.web.Entity.TimeLog;
import com.example.tsh.web.Repository.EmployeeRepo;
import com.example.tsh.web.Repository.HRRepo;
import com.example.tsh.web.Service.TimeLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
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

}
