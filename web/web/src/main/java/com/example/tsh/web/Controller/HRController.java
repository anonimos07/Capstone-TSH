package com.example.tsh.web.Controller;

import com.example.tsh.web.Entity.Admin;
import com.example.tsh.web.Entity.Employee;
import com.example.tsh.web.Entity.HR;
import com.example.tsh.web.Service.EmployeeService;
import com.example.tsh.web.Service.HRService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<Map<String, Object>> loginHR(
            @RequestBody Map<String, String> credentials) {

        try {
            HR hr = hrService.authenticateHR(
                    credentials.get("user"),
                    credentials.get("password")
            );

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("hrId", hr.getHrId());
            response.put("user", hr.getUser());
            response.put("role", hr.getRole().name());

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", e.getMessage());

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(errorResponse);
        }
    }


    @PostMapping("/create-hr")
    public ResponseEntity<String> createHr(@RequestBody HR hr) {
        hrService.saveHr(hr);
        return ResponseEntity.ok("HR created successfully by HR");
    }


    @GetMapping("/all-hr")
    public List<HR> getAll(){
        return hrService.getAllHr();
    }


    @PostMapping("/create-employee")
    public ResponseEntity<String> createEmployee(@RequestBody Employee employee) {
        employeeService.saveEmployee(employee);
        return ResponseEntity.ok("Employee created successfully by HR");
    }
}
