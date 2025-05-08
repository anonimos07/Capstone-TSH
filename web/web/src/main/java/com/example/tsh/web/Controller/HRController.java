package com.example.tsh.web.Controller;

import com.example.tsh.web.DTO.PayrollCreationRequest;
import com.example.tsh.web.DTO.PayrollDetails;
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

    @Autowired
    private PayrollCutoffService cutoffService;

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

    @GetMapping("/payroll-overview")
    public ResponseEntity<Map<String, Object>> getPayrollOverview() {
        return ResponseEntity.ok(hrService.getPayrollOverview());
    }

    @GetMapping("/export-payroll-report")
    public ResponseEntity<byte[]> exportPayrollReport() {
        byte[] report = hrService.generatePayrollReport();

        return ResponseEntity.ok()
                .header("Content-Type", "text/csv")
                .header("Content-Disposition", "attachment; filename=payroll_report.csv")
                .body(report);
    }

    @PostMapping("/adjust-salary/{employeeId}")
    public ResponseEntity<Employee> adjustSalary(
            @PathVariable Long employeeId,
            @RequestParam float newSalary) {
        return ResponseEntity.ok(hrService.adjustEmployeeSalary(employeeId, newSalary));
    }

    @GetMapping("/detect-payroll-errors")
    public ResponseEntity<Map<String, String>> detectPayrollErrors() {
        return ResponseEntity.ok(hrService.detectPayrollErrors());
    }

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

    @PostMapping("/create-payroll")
    public ResponseEntity<Payroll> createPayroll(@RequestBody PayrollCreationRequest request) {
        return ResponseEntity.ok(hrService.createPayroll(request));
    }

    @GetMapping("/all-payrolls")
    public ResponseEntity<List<Payroll>> getAllPayrolls() {
        return ResponseEntity.ok(hrService.getAllPayrolls());
    }

    @GetMapping("/payroll/{payrollId}")
    public ResponseEntity<PayrollDetails> getPayrollDetails(@PathVariable Long payrollId) {
        return ResponseEntity.ok(hrService.getPayrollDetails(payrollId));
    }

    @GetMapping("/search-payrolls")
    public ResponseEntity<List<Payroll>> searchPayrolls(
            @RequestParam(required = false) String period,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(hrService.searchPayrolls(period, status));
    }

    @GetMapping("/current-cutoff")
    public ResponseEntity<Map<String, Object>> getCurrentCutoffPeriod() {
        PayrollCutoffService.CutoffPeriod current = cutoffService.getCurrentCutoffPeriod();

        Map<String, Object> response = new HashMap<>();
        response.put("startDate", current.getStartDate());
        response.put("endDate", current.getEndDate());
        response.put("payDate", current.getPayDate());
        response.put("description", current.getDescription());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/cutoffs-for-month")
    public ResponseEntity<List<Map<String, Object>>> getCutoffsForMonth(
            @RequestParam int year,
            @RequestParam int month) {

        List<PayrollCutoffService.CutoffPeriod> periods = cutoffService.getCutoffPeriodsForMonth(year, month);

        List<Map<String, Object>> response = periods.stream()
                .map(p -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("startDate", p.getStartDate());
                    map.put("endDate", p.getEndDate());
                    map.put("payDate", p.getPayDate());
                    map.put("description", p.getDescription());
                    return map;
                })
                .toList();

        return ResponseEntity.ok(response);
    }

    // In HRController.java
    @GetMapping("/available-hr-for-leave")
    public ResponseEntity<List<HR>> getAvailableHRForLeave() {
        return ResponseEntity.ok(hrService.getAllHr());
    }
}
