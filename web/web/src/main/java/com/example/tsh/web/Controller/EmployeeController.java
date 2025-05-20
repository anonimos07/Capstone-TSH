package com.example.tsh.web.Controller;

import com.example.tsh.web.Entity.*;
import com.example.tsh.web.Repository.EmployeeRepo;
import com.example.tsh.web.Service.EmployeeService;
import com.example.tsh.web.Service.HRService;
import com.example.tsh.web.Service.LeaveService;
import com.example.tsh.web.Service.TimeLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.Serializable;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/employee")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class EmployeeController {

    private final EmployeeService employeeService;
    private final EmployeeRepo employeeRepo;
    private final LeaveService leaveService;
    private final HRService hrService;
    private final TimeLogService timeLogService;
//
//@PostMapping("/login")
//public ResponseEntity<Map<String, Object>> login(@RequestBody Employee employee) {
//    String result = employeeService.verify(employee, Role.EMPLOYEE);
//
//    if (result.equals("failed")) {
//        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Collections.singletonMap("error", result));
//    }
//
//    if (employee.getRole() != Role.EMPLOYEE) {
//        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Collections.singletonMap("error", "Access denied: Not an employee."));
//    }
//    Map<String, Object> response = new HashMap<>();
//    response.put("token", result);               // JWT token
//    response.put("role", employee.getRole().name());
//    response.put("username",employee.getUsername());
//    response.put("employeeId",employee.getEmployeeId());
//
//    return ResponseEntity.ok(response);
//}



    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Employee employee) {
        String result = employeeService.verify(employee, Role.EMPLOYEE);

        if (result.equals("failed")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Collections.singletonMap("error", result));
        }

        if (employee.getRole() != Role.EMPLOYEE) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Collections.singletonMap("error", "Access denied: Not an employee."));
        }

        Optional<Employee> dbEmployeeOpt = employeeRepo.findByUsername(employee.getUsername());
        if (dbEmployeeOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", "Employee not found"));
        }

        Employee dbEmployee = dbEmployeeOpt.get();

        Map<String, Object> response = new HashMap<>();
        response.put("token", result);  // JWT token
        response.put("role", dbEmployee.getRole().name());
        response.put("username", dbEmployee.getUsername());
        response.put("employeeId", dbEmployee.getEmployeeId()); // Correct ID from DB

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
                    "role", employee.getRole(),
                    "contact", employee.getContact(),
                    "position", employee.getPosition()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Server error: " + e.getMessage()));
        }
    }

    @GetMapping("/salary-details")
        public Map<String, Object> getSalaryDetails(Long employeeId) {
            Optional<Employee> employee = employeeRepo.findById(employeeId);
            if (employee.isEmpty()) {
                throw new RuntimeException("Employee not found");
            }

            Map<String, Object> details = new HashMap<>();
            details.put("baseSalary", employee.get().getBaseSalary());
            details.put("regularHolidayPay", employee.get().getRegularHolidayPay());
            details.put("specialHolidayPay", employee.get().getSpecialHolidayPay());
            details.put("absenceDays", employee.get().getAbsenceDays());
            details.put("grossIncome", employee.get().getGrossIncome());
            details.put("netIncome", employee.get().getNetIncome());

            return details;
    }

    //update profile emp
    @PutMapping("/update-profile")
    public ResponseEntity<String> updateEmployeeProfile(@RequestBody Employee employee, Authentication authentication){

        String username = authentication.getName();
        employeeService.updateOwnProfile(username, employee);
        return ResponseEntity.ok("Profile updated successfully");
    }

    @GetMapping("/payslips")
    public ResponseEntity<?> getPayslips(Authentication authentication) {
        String username = authentication.getName();
        Optional<Employee> employee = employeeRepo.findByUsername(username);

        if (employee.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(employeeService.getPayslips(employee.get().getEmployeeId()));
    }

    @GetMapping("/tax-details")
    public ResponseEntity<?> getTaxDetails(Authentication authentication) {
        String username = authentication.getName();
        Optional<Employee> employee = employeeRepo.findByUsername(username);

        if (employee.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(employeeService.getTaxDetails(employee.get().getEmployeeId()));
    }

    @PostMapping("/leave-request")
    public ResponseEntity<?> submitLeaveRequest(
            @RequestBody Map<String, Object> requestData,
            Authentication authentication) {
        String username = authentication.getName();
        Optional<Employee> employee = employeeRepo.findByUsername(username);

        if (employee.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        try {
            LeaveRequest request = leaveService.submitLeaveRequest(
                    employee.get().getEmployeeId(),
                    Long.parseLong(requestData.get("hrId").toString()), // Add HR ID
                    LocalDate.parse(requestData.get("startDate").toString()),
                    LocalDate.parse(requestData.get("endDate").toString()),
                    requestData.get("reason").toString(),
                    requestData.get("leaveType").toString()
            );
            return ResponseEntity.ok(request);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/leave-requests")
    public ResponseEntity<?> getLeaveRequests(Authentication authentication) {
        String username = authentication.getName();
        Optional<Employee> employee = employeeRepo.findByUsername(username);

        if (employee.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                leaveService.getEmployeeLeaveRequests(employee.get().getEmployeeId())
        );
    }

    @GetMapping("/tax-calculation")
    public ResponseEntity<?> calculateTax(Authentication authentication) {
        String username = authentication.getName();
        Optional<Employee> employee = employeeRepo.findByUsername(username);

        if (employee.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                employeeService.calculateTax(employee.get().getEmployeeId())
        );
    }

    @GetMapping("/benefits")
    public ResponseEntity<?> getBenefits(Authentication authentication) {
        String username = authentication.getName();
        Optional<Employee> employee = employeeRepo.findByUsername(username);

        if (employee.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                employeeService.getBenefits(employee.get().getEmployeeId())
        );
    }

    @PutMapping("/update-holiday-pays")
    public ResponseEntity<String> updateHolidayPays(
            @RequestParam float regularHolidayPay,
            @RequestParam float specialHolidayPay,
            Authentication authentication) {

        String username = authentication.getName();
        employeeService.updateHolidayPays(username, regularHolidayPay, specialHolidayPay);
        return ResponseEntity.ok("Holiday pays updated successfully");
    }

    @PutMapping("/update-absence-days")
    public ResponseEntity<String> updateAbsenceDays(
            @RequestParam int absenceDays,
            Authentication authentication) {

        String username = authentication.getName();
        employeeService.updateAbsenceDays(username, absenceDays);
        return ResponseEntity.ok("Absence days updated successfully");
    }

    @GetMapping("/available-hr")
    public ResponseEntity<List<HR>> getAvailableHR() {
        return ResponseEntity.ok(hrService.getAllHr());
    }

    @GetMapping("/attendance")
    public ResponseEntity<?> getEmployeeAttendance(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            Authentication authentication) {

        String username = authentication.getName();
        Optional<Employee> employee = employeeRepo.findByUsername(username);

        if (employee.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        int queryYear = year != null ? year : LocalDate.now().getYear();
        int queryMonth = month != null ? month : LocalDate.now().getMonthValue();

        Map<String, Object> response = new HashMap<>();
        response.put("year", queryYear);
        response.put("month", queryMonth);

        List<TimeLog> logs = timeLogService.getAttendanceForMonth(
                employee.get().getEmployeeId(),
                queryYear,
                queryMonth
        );

        Map<LocalDate, Map<String, Object>> attendanceMap = new LinkedHashMap<>();

        for (TimeLog log : logs) {
            LocalDate logDate = log.getDate().toLocalDate();
            Map<String, Object> attendanceDetails = new HashMap<>();
            attendanceDetails.put("status", "P");
            attendanceDetails.put("timeIn", log.getTimeIn() != null ? log.getTimeIn().toString() : null);
            attendanceDetails.put("timeOut", log.getTimeOut() != null ? log.getTimeOut().toString() : null);
            attendanceMap.put(logDate, attendanceDetails);
        }

        LocalDate startDate = LocalDate.of(queryYear, queryMonth, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        LocalDate today = LocalDate.now();

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            if (!attendanceMap.containsKey(date)
                    && date.isBefore(today) // only mark absent if the date is before today
                    && date.getDayOfWeek() != DayOfWeek.SATURDAY
                    && date.getDayOfWeek() != DayOfWeek.SUNDAY) {

                Map<String, Object> absentDetails = new HashMap<>();
                absentDetails.put("status", "A");
                absentDetails.put("timeIn", null);
                absentDetails.put("timeOut", null);
                attendanceMap.put(date, absentDetails);
            }
        }

        Map<String, Object> attendanceResponse = new LinkedHashMap<>();
        attendanceMap.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .forEach(entry -> attendanceResponse.put(entry.getKey().toString(), entry.getValue()));

        response.put("attendance", attendanceResponse);
        return ResponseEntity.ok(response);
    }

}
