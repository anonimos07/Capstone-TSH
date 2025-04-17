package com.example.tsh.web.Controller;

import com.example.tsh.web.Entity.*;
import com.example.tsh.web.Service.EmployeeService;
import com.example.tsh.web.Service.HRService;
import com.example.tsh.web.Service.TimeLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/hr")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class HRController {
    private final HRService hrService;
    private final EmployeeService employeeService;

    @Autowired
    private TimeLogService timeLogService;


    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody HR hr) {
        String result = hrService.verify(hr, Role.HR);
        if (result.equals("failed")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Collections.singletonMap("error", result));
        }

        if (hr.getRole() != Role.HR) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Collections.singletonMap("error", "Access denied: Not an hr."));
        }
        //added to extract role
        Map<String, String> response = new HashMap<>();
        response.put("token", result);               // JWT token
        response.put("role", hr.getRole().name());
        response.put("username",hr.getUsername());

//        return ResponseEntity.ok(Collections.singletonMap("token", result));
        return ResponseEntity.ok(response);
    }

    @CrossOrigin(origins = "http://localhost:5173")
    @PostMapping("/create-hr")
    public ResponseEntity<String> createHr(@RequestBody HR hr) {
        hrService.saveHr(hr);
        return ResponseEntity.ok("HR created successfully by HR");
    }

    @CrossOrigin(origins = "http://localhost:5173")
    @GetMapping("/all-hr")
    public List<HR> getAllHr(){
        return hrService.getAllHr();
    }

    @CrossOrigin(origins = "http://localhost:5173")
    @PostMapping("/create-employee")
    public ResponseEntity<String> createEmployee(@RequestBody Employee employee) {
        employeeService.saveEmployee(employee);
        return ResponseEntity.ok("Employee created successfully by HR");
    }

    @GetMapping("/all-employee")
    public List<Employee> getAllEmployee(){
        return employeeService.getAllEmployee();
    }

    //get all timelog
    // Get all time logs (admin only)
    @GetMapping("/get-all")
    public ResponseEntity<List<TimeLog>> getAllTimeLogs(@RequestHeader("Authorization") String token) {
        try {
            // Here you would check if the employee has admin privileges
            return ResponseEntity.ok(timeLogService.findAllTimeLogs());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
    
}
