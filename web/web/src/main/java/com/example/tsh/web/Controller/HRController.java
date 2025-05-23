package com.example.tsh.web.Controller;

import com.example.tsh.web.DTO.AttendanceRecord;
import com.example.tsh.web.Entity.*;
import com.example.tsh.web.Repository.EmployeeRepo;
import com.example.tsh.web.Repository.HRRepo;
import com.example.tsh.web.Service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.Serializable;
import java.util.*;

@RestController
@RequestMapping("/hr")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class HRController {
    private final HRService hrService;
    private final EmployeeService employeeService;
    public final HRRepo hrRepo;
    private final LeaveService leaveService;
    private final EmployeeRepo employeeRepo;

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

        Map<String, String> response = new HashMap<>();
        response.put("token", result);               // JWT token
        response.put("role", hr.getRole().name());
        response.put("username",hr.getUsername());

        return ResponseEntity.ok(response);
    }

    @CrossOrigin(origins = "http://localhost:5173")
    @PostMapping("/create-hr")
    public ResponseEntity<String> createHr(@RequestBody HR hr) {
        try {
            hrService.saveHr(hr);
            return ResponseEntity.ok("HR created successfully by Admin");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @CrossOrigin(origins = "http://localhost:5173")
    @GetMapping("/all-hr")
    public List<HR> getAllHr(){
        return hrService.getAllHr();
    }

    @CrossOrigin(origins = "http://localhost:5173")
    @PostMapping("/create-employee")
    public ResponseEntity<String> createEmployee(@RequestBody Employee employee) {
        try {
            employeeService.saveEmployee(employee);
            return ResponseEntity.ok("Employee created successfully by HR");
        } catch (RuntimeException e) {
            // Handle the username already exists error
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/all-employee")
    public List<Employee> getAllEmployee(){
        return employeeService.getAllEmployee();
    }

    //get all timelog
    @GetMapping("/get-all")
    public ResponseEntity<List<TimeLog>> getAllTimeLogs(@RequestHeader("Authorization") String token) {
        try {
            // Here you would check if the employee has admin privileges
            return ResponseEntity.ok(timeLogService.findAllTimeLogs());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @GetMapping("/me")
    @CrossOrigin(origins = "http://localhost:5173")
    public ResponseEntity<Map<String, Serializable>> getCurrentUserProfile(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Not authenticated"));
            }

            String username = authentication.getName();
            Optional<HR> hrOptional = hrRepo.findByUsername(username);

            if (hrOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "User not found."));
            }

            HR hr = hrOptional.get();
            return ResponseEntity.ok(Map.of(
                    "hrId", hr.getHrId(), // Make sure this is included
                    "username", hr.getUsername(),
                    "firstName", hr.getFirstName(),
                    "lastName", hr.getLastName(),
                    "email", hr.getEmail(),
                    "role", hr.getRole()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Server error: " + e.getMessage()));
        }
    }

    //update employee by profile
    @PutMapping("/update-profile-employee")
    public ResponseEntity<String> updateEmployeeByHr(@RequestBody Employee updatedData) {

        String username = updatedData.getUsername(); // Get target employee username from body
        hrService.updateEmployeeProfile(username, updatedData);
        return ResponseEntity.ok("Employee profile updated successfully");
    }

    @GetMapping("/pending-leave-requests/{hrId}")
    public ResponseEntity<List<LeaveRequest>> getPendingLeaveRequestsForHr(@PathVariable Long hrId) {
        return ResponseEntity.ok(leaveService.getPendingLeaveRequestsForHr(hrId));
    }

    @PostMapping("/approve-leave/{requestId}")
    public ResponseEntity<?> approveLeaveRequest(@PathVariable Long requestId) {
        return ResponseEntity.ok(leaveService.approveLeaveRequest(requestId));
    }

    @PostMapping("/reject-leave/{requestId}")
    public ResponseEntity<?> rejectLeaveRequest(@PathVariable Long requestId,
                                                @RequestBody String rejectionReason) {
        return ResponseEntity.ok(leaveService.rejectLeaveRequest(requestId, rejectionReason));
    }

    @PostMapping("/adjust-salary/{employeeId}")
    public ResponseEntity<Employee> adjustSalary(
            @PathVariable Long employeeId,
            @RequestParam float newSalary) {
        return ResponseEntity.ok(hrService.adjustEmployeeSalary(employeeId, newSalary));
    }

    //overview attendance employee (working hours, avg hours, days of attendance)
    @GetMapping("/attendance-overview")
    public ResponseEntity<Map<String, Object>> getAttendanceOverview() {
        return ResponseEntity.ok(hrService.getAttendanceOverview());
    }

    @PutMapping("/employee/{employeeId}/holiday-pays")
    public ResponseEntity<Employee> updateEmployeeHolidayPays(
            @PathVariable Long employeeId,
            @RequestParam float regularHolidayPay,
            @RequestParam float specialHolidayPay) {

        Employee employee = employeeService.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        employee.setRegularHolidayPay(regularHolidayPay);
        employee.setSpecialHolidayPay(specialHolidayPay);
        return ResponseEntity.ok(employeeRepo.save(employee));
    }

    @PutMapping("/employee/{employeeId}/absence-days")
    public ResponseEntity<Employee> updateEmployeeAbsenceDays(
            @PathVariable Long employeeId,
            @RequestParam int absenceDays) {

        Employee employee = employeeService.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        employee.setAbsenceDays(absenceDays);
        return ResponseEntity.ok(employeeRepo.save(employee));
    }

    @GetMapping("/available-hr-for-leave")
    public ResponseEntity<List<HR>> getAvailableHRForLeave() {
        return ResponseEntity.ok(hrService.getAllHr());
    }

    @GetMapping("/available-hr-for-timelog")
    public ResponseEntity<List<HR>> getAvailableHRForTimeLog() {
        return ResponseEntity.ok(hrService.getAllHr());
    }

    //view attendance employee in calendar
    @GetMapping("/attendance-calendar")
    public ResponseEntity<List<AttendanceRecord>> getAttendanceCalendar(
            @RequestParam(required = false) Long employeeId,
            @RequestParam int month,
            @RequestParam int year,
            @RequestParam(required = false) String status) {

        List<AttendanceRecord> records = hrService.getAttendanceRecords(employeeId, month, year, status);
        return ResponseEntity.ok(records);
    }
}
