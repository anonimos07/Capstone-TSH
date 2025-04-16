package com.example.tsh.web.Controller;

import com.example.tsh.web.Entity.Employee;
import com.example.tsh.web.Entity.Role;
import com.example.tsh.web.Repository.EmployeeRepo;
import com.example.tsh.web.Service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.Serializable;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/employee")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class EmployeeController {

    private final EmployeeService employeeService;

    private final EmployeeRepo employeeRepo;

@PostMapping("/login")
public ResponseEntity<Map<String, String>> login(@RequestBody Employee employee) {
    String result = employeeService.verify(employee, Role.EMPLOYEE);

    if (result.equals("failed")) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Collections.singletonMap("error", result));
    }

    if (employee.getRole() != Role.EMPLOYEE) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Collections.singletonMap("error", "Access denied: Not an employee."));
    }
    //added to extract role
    Map<String, String> response = new HashMap<>();
    response.put("token", result);               // JWT token
    response.put("role", employee.getRole().name());
    response.put("username",employee.getUsername());


//    return ResponseEntity.ok(Collections.singletonMap("token", result));
    return ResponseEntity.ok(response);
}

    @GetMapping("/me")
    @CrossOrigin(origins = "http://localhost:5173")
    public ResponseEntity<Map<String, Serializable>> getCurrentUserProfile(Authentication authentication) {
        try {
            // Get username from Spring Security context
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Not authenticated"));
            }

            String username = authentication.getName();

            // Find employee by username
            Optional<Employee> employeeOptional = employeeRepo.findByUsername(username);

            if (employeeOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "User not found."));
            }

            Employee employee = employeeOptional.get();
            return ResponseEntity.ok(Map.of(
                    "username", employee.getUsername(),
                    "firstName", employee.getFirstName(),
                    "lastName", employee.getLastName(),
                    "email", employee.getEmail(),
                    "role", employee.getRole()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Server error: " + e.getMessage()));
        }
    }
    }
