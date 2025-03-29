package com.example.tsh.web.Controller;


import com.example.tsh.web.Entity.Admin;
import com.example.tsh.web.Entity.Employee;
import com.example.tsh.web.Entity.HR;

import com.example.tsh.web.Service.HRService;
import com.example.tsh.web.Service.AdminService;
import com.example.tsh.web.Service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {
    private final AdminService adminService;
    private final HRService hrService;  // final + private is better
    private final EmployeeService employeeService;


    //get all
    @GetMapping("/all")
    public List<Admin> getAll(){
        return adminService.getAllAdmins();
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginEmployee(
            @RequestBody Map<String, String> credentials) {

        try {
            Admin admin = adminService.authenticateAdmin(
                    credentials.get("user"),
                    credentials.get("password")
            );

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("employeeId", admin.getAdminId());
            response.put("user", admin.getUser());
            response.put("role", admin.getRole().name());

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", e.getMessage());

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(errorResponse);
        }
    }



    //create admin
//    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    @PostMapping("/add")
    public ResponseEntity<String> addAdmin(@RequestBody Admin admin) {
        adminService.saveAdmin(admin);
        return ResponseEntity.ok("Admin added successfully!");
    }

    // Admin can create HR accounts
//    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    @PostMapping("/create-hr")
    public ResponseEntity<String> createHr(@RequestBody HR hr) {
        hrService.saveHr(hr);
        return ResponseEntity.ok("HR created successfully by admin");
    }

    // Admin can create Employee accounts
//    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    @PostMapping("/create-employee")
    public ResponseEntity<String> createEmployee(@RequestBody Employee employee) {
        employeeService.saveEmployee(employee);
        return ResponseEntity.ok("Employee created successfully by admin");
    }

    //get specific admin
    @GetMapping("/{id}")
    public ResponseEntity<Admin> getAdminById(@PathVariable Long Id) {
        Optional<Admin> admin = adminService.getAdminById(Id);
        return admin.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    //delete specific admin
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAdmin(@PathVariable Long Id) {
        adminService.deleteAdmin(Id);
        return ResponseEntity.ok("Admin deleted successfully!");
    }

}
