package com.example.tsh.web.Controller;

import com.example.tsh.web.Entity.Employee;
import com.example.tsh.web.Entity.TimeLog;
import com.example.tsh.web.Repository.EmployeeRepo;
import com.example.tsh.web.Service.JwtService;
import com.example.tsh.web.Service.TimeLogService;
import com.example.tsh.web.Service.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/time-logs")
@CrossOrigin(origins = "http://localhost:5173")
public class TimeLogController {

    @Autowired
    private TimeLogService timeLogService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private EmployeeRepo employeeRepo; // Or similar service that can find Employee by username



    // Get time log by ID
    @GetMapping("/{id}")
    public ResponseEntity<TimeLog> getTimeLogById(@PathVariable Long id, Authentication authentication) {
        String username = authentication.getName();
        Employee employee = employeeRepo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Employee not found"));

        TimeLog timeLog = timeLogService.findTimeLogById(id).orElse(null);

        if (timeLog == null) {
            return ResponseEntity.notFound().build();
        }

        if (timeLog.getEmployee().getEmployeeId() != employee.getEmployeeId()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(timeLog);
    }


    // Get today's logs for the authenticated employee
    @GetMapping("/today")
    public ResponseEntity<?> getTodayLogs(Authentication authentication) {
        String username = authentication.getName();
        Employee employee = employeeRepo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Employee not found"));

        List<TimeLog> logs = timeLogService.findTodayLogsByEmployee(employee);
        return ResponseEntity.ok(logs);
    }

    // Get logs by date for the authenticated employee
    @GetMapping("/date")
    public ResponseEntity<?> getLogsByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime date,
            Authentication authentication) {
        String username = authentication.getName();
        Employee employee = employeeRepo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Employee not found"));

        List<TimeLog> logs = timeLogService.findLogsByEmployeeAndDate(employee, date);
        return ResponseEntity.ok(logs);
    }


    // Time In endpoint
    @PostMapping("/time-in")
    public ResponseEntity<?> timeIn(Authentication authentication) {
        try {
            String username = authentication.getName();
            Employee employee = employeeRepo.findByUsername(username)
                    .orElseThrow(() -> new UsernameNotFoundException("Employee not found"));
            System.out.println("Start timeIn: " + System.currentTimeMillis());
            TimeLog timeLog = timeLogService.timeIn(employee);
            System.out.println("End timeIn: " + System.currentTimeMillis());
            return ResponseEntity.ok(timeLog);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to record time in: " + e.getMessage()));
        }
    }


    // Time Out endpoint
    @PostMapping("/time-out")
    public ResponseEntity<?> timeOut(Authentication authentication) {
        try {
            String username = authentication.getName();
            Employee employee = employeeRepo.findByUsername(username)
                    .orElseThrow(() -> new UsernameNotFoundException("Employee not found"));

            TimeLog timeLog = timeLogService.timeOut(employee);
            return ResponseEntity.ok(timeLog);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to record time out: " + e.getMessage()));
        }
    }


    // Get current status (whether timed in or not)
    @GetMapping("/status")
    public ResponseEntity<?> getCurrentStatus(Authentication authentication) {
        String username = authentication.getName(); // should return the username from JWT

        Employee employee = employeeRepo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Employee not found"));

        TimeLog activeLog = timeLogService.getCurrentStatus(employee);
        Map<String, Object> response = new HashMap<>();

        if (activeLog != null) {
            response.put("isTimedIn", true);
            response.put("timeIn", activeLog.getTimeIn());
            response.put("timeOut", activeLog.getTimeOut());
            response.put("id", activeLog.getTimeLogId());
        } else {
            response.put("isTimedIn", false);
            response.put("timeIn", null);
            response.put("timeOut", null);
        }

        return ResponseEntity.ok(response);
    }
    @GetMapping("/test")
    public ResponseEntity<?> testAccess(Principal principal) {
        return ResponseEntity.ok("Hello " + principal.getName());
    }
}
