package com.example.tsh.web.Controller;

import com.example.tsh.web.Entity.Admin;
import com.example.tsh.web.Entity.Employee;
import com.example.tsh.web.Entity.HR;
import com.example.tsh.web.Entity.Role;
import com.example.tsh.web.Service.EmployeeService;
import com.example.tsh.web.Service.HRService;
import lombok.RequiredArgsConstructor;
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

//        return ResponseEntity.ok(Collections.singletonMap("token", result));
        return ResponseEntity.ok(response);
    }


    @PostMapping("/create-hr")
    public ResponseEntity<String> createHr(@RequestBody HR hr) {
        hrService.saveHr(hr);
        return ResponseEntity.ok("HR created successfully by HR");
    }


    @GetMapping("/all-hr")
    public List<HR> getAllHr(){
        return hrService.getAllHr();
    }


    @PostMapping("/create-employee")
    public ResponseEntity<String> createEmployee(@RequestBody Employee employee) {
        employeeService.saveEmployee(employee);
        return ResponseEntity.ok("Employee created successfully by HR");
    }

    @GetMapping("/all-employee")
    public List<Employee> getAllEmployee(){
        return employeeService.getAllEmployee();
    }
    
}
