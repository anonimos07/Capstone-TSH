package com.example.tsh.web.Service;

import com.example.tsh.web.DTO.AttendanceRecord;
import com.example.tsh.web.Entity.*;
import com.example.tsh.web.Repository.EmployeeRepo;
import com.example.tsh.web.Repository.HRRepo;
import com.example.tsh.web.Repository.TimeLogRepo;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HRService {
    private final HRRepo hrRepository;
    private final EmployeeRepo employeeRepo;
    private final PasswordEncoder passwordEncoder;
    private final TimeLogService timeLogService;
    private final TimeLogRepo timeLogRepo;

    @Autowired
    private JwtService jwtService;

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    EmployeeRepo employeeRepository;


    public HR saveHr(HR hr) {
        // Check if username already exists
        Optional<HR> existingHr = hrRepository.findByUsername(hr.getUsername());

        if (existingHr.isPresent()) {
            throw new RuntimeException("Username already exists: " + hr.getUsername());
        }

        hr.setPassword(passwordEncoder.encode(hr.getPassword()));
        hr.setRole(Role.HR); // Set role explicitly
        return hrRepository.save(hr);
    }

    public Employee createEmployee(Employee employee) {
        Optional<Employee> existingEmployee = employeeRepo.findByUsername(employee.getUsername());

        if (existingEmployee.isPresent()) {
            throw new RuntimeException("Username already exists: " + employee.getUsername());
        }

        employee.setPassword(passwordEncoder.encode(employee.getPassword()));
        employee.setRole(Role.EMPLOYEE);
        return employeeRepo.save(employee);
    }

    public List<HR> getAllHr(){
        return hrRepository.findAll();
    }

    public HR authenticateHR(String user, String password) {
        Optional<HR> hrOptional = hrRepository.findByUsername(user);

        if (hrOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        HR hr = hrOptional.get();

        if (!passwordEncoder.matches(password, hr.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        if (hr.getRole() != Role.HR) {
            throw new RuntimeException("Unauthorized");
        }

        return hr;
    }

    public String verify(HR hr, Role expectedRole) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(hr.getUsername(), hr.getPassword())
        );

        if (authentication.isAuthenticated()) {
            Optional<HR> foundHr = hrRepository.findByUsername(hr.getUsername());

            if (foundHr.isPresent() && foundHr.get().getRole() == expectedRole) {
                return jwtService.generateToken(hr.getUsername());
            } else {
                return "unauthorized";
            }
        }
        return "failed";
    }

    public Map<String, Object> getPayrollOverview() {
        List<Employee> employees = employeeRepo.findAll();

        Map<String, Object> overview = new HashMap<>();
        overview.put("totalEmployees", employees.size());

        float totalPayroll = employees.stream()
                .map(Employee::getBaseSalary)
                .reduce(0f, Float::sum);
        overview.put("totalPayroll", totalPayroll);

        float totalTax = employees.stream()
                .map(e -> e.getBaseSalary() * 0.2f)
                .reduce(0f, Float::sum);
        overview.put("totalTaxDeductions", totalTax);

        return overview;
    }

    public byte[] generatePayrollReport() {
        List<Employee> employees = employeeRepo.findAll();
        StringBuilder csv = new StringBuilder("ID,Name,Position,Base Salary,Tax\n");

        for (Employee e : employees) {
            csv.append(e.getEmployeeId()).append(",")
                    .append(e.getFirstName()).append(" ").append(e.getLastName()).append(",")
                    .append(e.getPosition()).append(",")
                    .append(e.getBaseSalary()).append(",")
                    .append(e.getBaseSalary() * 0.2f).append("\n");
        }

        return csv.toString().getBytes();
    }

    public Employee adjustEmployeeSalary(Long employeeId, float newSalary) {
        Employee employee = employeeRepo.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        employee.setBaseSalary(newSalary);
        return employeeRepo.save(employee);
    }

    public Map<String, String> detectPayrollErrors() {
        List<Employee> problematicEmployees = employeeRepo.findAll().stream()
                .filter(e -> e.getBaseSalary() <= 0)
                .toList();

        Map<String, String> result = new HashMap<>();
        if (problematicEmployees.isEmpty()) {
            result.put("status", "No errors detected");
        } else {
            result.put("status", "Errors detected");
            result.put("message", problematicEmployees.size() + " employees have invalid salaries");
            result.put("employeeIds", problematicEmployees.stream()
                    .map(e -> String.valueOf(e.getEmployeeId()))
                    .collect(Collectors.joining(",")));
        }
        return result;
    }

    public Map<String, Object> getAttendanceOverview() {
        Map<String, Object> attendance = new HashMap<>();

        List<TimeLog> allTimeLogs = timeLogService.findAllTimeLogs();

        long totalPresent = allTimeLogs.stream()
                .filter(log -> log.getTimeIn() != null)
                .map(log -> log.getDate().toLocalDate())
                .distinct()
                .count();

        long totalMinutes = allTimeLogs.stream()
                .filter(log -> log.getTimeIn() != null && log.getTimeOut() != null)
                .mapToLong(log -> log.getDurationMinutes() != null ? log.getDurationMinutes() : 0)
                .sum();

        double averageHours = totalPresent > 0 ? totalMinutes / 60.0 / totalPresent : 0;

        long totalEmployees = employeeRepo.count();

        attendance.put("totalPresentDays", totalPresent);
        attendance.put("totalEmployees", totalEmployees);
        attendance.put("averageHoursPerDay", Math.round(averageHours * 100.0) / 100.0); // Rounded to 2 decimal places
        attendance.put("totalWorkedMinutes", totalMinutes);

        return attendance;
    }

    public List<AttendanceRecord> getAttendanceRecords(Long employeeId, int month, int year, String statusFilter) {

        List<TimeLog> timeLogs = timeLogRepo.findByMonthAndYear(month, year);

        if (employeeId != null) {
            timeLogs = timeLogs.stream()
                    .filter(log -> log.getEmployee() != null &&
                            employeeId.equals(log.getEmployee().getEmployeeId()))
                    .collect(Collectors.toList());
        }

        List<AttendanceRecord> records = new ArrayList<>();

        for (TimeLog log : timeLogs) {
            if (log.getTimeIn() != null && log.getEmployee() != null) {
                String date = log.getDate().toLocalDate().toString();

                if (statusFilter == null || "PRESENT".equalsIgnoreCase(statusFilter)) {
                    records.add(new AttendanceRecord(
                            log.getEmployee().getEmployeeId(),
                            log.getEmployee(),
                            date,
                            "PRESENT"
                    ));
                }
            }
        }

        if (employeeId == null) {
            List<Employee> allEmployees = employeeRepo.findAll();

            LocalDate startDate = LocalDate.of(year, month, 1);
            LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

            for (Employee employee : allEmployees) {
                LocalDate currentDate = startDate;
                while (!currentDate.isAfter(endDate)) {
                    String dateStr = currentDate.toString();

                    boolean hasRecord = records.stream()
                            .anyMatch(r -> r.getEmployeeId().equals(employee.getEmployeeId())
                                    && r.getDate().equals(dateStr));

                    if (!hasRecord && (statusFilter == null || "ABSENT".equalsIgnoreCase(statusFilter))) {
                        records.add(new AttendanceRecord(
                                employee.getEmployeeId(),
                                employee,
                                dateStr,
                                "ABSENT"
                        ));
                    }

                    currentDate = currentDate.plusDays(1);
                }
            }
        }

        return records;
    }

    //edit employee from hr
    public void updateEmployeeProfile(String username, Employee updatedData) {
        Employee employee = employeeRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found: " + username));

        employee.setPosition(updatedData.getPosition());
        employee.setBaseSalary(updatedData.getBaseSalary());
        employee.setFirstName(updatedData.getFirstName());
        employee.setLastName(updatedData.getLastName());
        employee.setEmail(updatedData.getEmail());
        employee.setContact(updatedData.getContact());

        employeeRepository.save(employee);
    }
}