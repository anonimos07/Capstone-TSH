package com.example.tsh.web.Controller;

import com.example.tsh.web.Entity.Employee;
import com.example.tsh.web.Service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/employee")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginEmployee(
            @RequestBody Map<String, String> credentials) {

        try {
            Employee employee = employeeService.authenticateEmployee(
                    credentials.get("user"),
                    credentials.get("password")
            );

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("employeeId", employee.getEmployeeId());
            response.put("user", employee.getUser());
            response.put("role", employee.getRole().name());

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", e.getMessage());

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(errorResponse);
        }
    }
    }
