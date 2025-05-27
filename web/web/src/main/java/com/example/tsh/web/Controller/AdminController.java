package com.example.tsh.web.Controller;


import com.example.tsh.web.Entity.Admin;
import com.example.tsh.web.Entity.Employee;
import com.example.tsh.web.Entity.HR;

import com.example.tsh.web.Entity.Role;
import com.example.tsh.web.Service.HRService;
import com.example.tsh.web.Service.AdminService;
import com.example.tsh.web.Service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {
    private final AdminService adminService;
    private final HRService hrService;  // final + private is better
    private final EmployeeService employeeService;


    //get tanan admin
    @GetMapping("/all")
    public List<Admin> getAll(){
        return adminService.getAllAdmins();
    }



    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Admin admin) {
        String result = adminService.verify(admin);
        if (result.equals("failed")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Collections.singletonMap("error", result));
        }

        if (admin.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Collections.singletonMap("error", "Access denied: Not an admin."));
        }

        Map<String, String> response = new HashMap<>();
        response.put("token", result);               // JWT token
        response.put("role", admin.getRole().name());
        response.put("username",admin.getUsername());
        return ResponseEntity.ok(response);
    }


    @PostMapping("/add")
    public ResponseEntity<String> addAdmin(@RequestBody Admin admin) {
        adminService.saveAdmin(admin);
        return ResponseEntity.ok("Admin added successfully!");
    }


    @PostMapping("/create-hr")
    public ResponseEntity<String> createHr(@RequestBody HR hr) {
        try {
            hrService.saveHr(hr);
            return ResponseEntity.ok("HR created successfully by Admin");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    //create employee via admn
    @PostMapping("/create-employee")
    public ResponseEntity<String> createEmployee(@RequestBody Employee employee) {
        employeeService.saveEmployee(employee);
        return ResponseEntity.ok("Employee created successfully by admin");
    }

    @GetMapping("/{id}")
    public ResponseEntity<Admin> getAdminById(@PathVariable Long Id) {
        Optional<Admin> admin = adminService.getAdminById(Id);
        return admin.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    //delete adm
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAdmin(@PathVariable Long Id) {
        adminService.deleteAdmin(Id);
        return ResponseEntity.ok("Admin deleted successfully!");
    }

    //get employee via admin
    @GetMapping("/all-employee")
    public List<Employee> getAllEmployee(){
        return employeeService.getAllEmployee();
    }

    //get hr via admin
    @GetMapping("/all-hr")
    public List<HR> getAllHrs(){
        return hrService.getAllHr();
    }

}
