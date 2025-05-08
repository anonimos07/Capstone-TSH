package com.example.tsh.web.Service;

import com.example.tsh.web.Entity.Employee;
import com.example.tsh.web.Entity.Role;
import com.example.tsh.web.Repository.EmployeeRepo;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class EmployeeService {
    private final EmployeeRepo employeeRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;


    public Employee saveEmployee(Employee employee) {
        employee.setPassword(passwordEncoder.encode(employee.getPassword()));
        employee.setRole(Role.EMPLOYEE); // Set role explicitly
        return employeeRepository.save(employee);
    }


    public Employee authenticateEmployee(String user, String password) {
        Optional<Employee> employeeOptional = employeeRepository.findByUsername(user);

        if (employeeOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        Employee employee = employeeOptional.get();

        if (!passwordEncoder.matches(password, employee.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        // Role is already set to EMPLOYEE in your saveEmployee method
        // You can add additional role checks here if needed
        if (employee.getRole() != Role.EMPLOYEE) {
            throw new RuntimeException("Unauthorized");
        }

        return employee;
    }

    // get all employees list, mapped to hr controller
    public List<Employee> getAllEmployee(){
        return employeeRepository.findAll();
    }

    public String verify(Employee employee, Role expectedRole) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(employee.getUsername(), employee.getPassword())
        );

        if (authentication.isAuthenticated()) {
            Optional<Employee> foundEmployee = employeeRepository.findByUsername(employee.getUsername());

            if (foundEmployee.isPresent() && foundEmployee.get().getRole() == expectedRole) {
                return jwtService.generateToken(employee.getUsername());
            } else {
                return "unauthorized";
            }
        }
        return "failed";
    }

    public Optional<Employee> findById(Long employeeId) {
        return employeeRepository.findById(employeeId);
    }

    //edit emp prof
    public void updateOwnProfile(String username, Employee updatedData) {
        Employee employee = employeeRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found for username: " + username));

        employee.setFirstName(updatedData.getFirstName());
        employee.setLastName(updatedData.getLastName());
        employee.setEmail(updatedData.getEmail());
        employee.setContact(updatedData.getContact());

        employeeRepository.save(employee);
    }

    public Map<String, Object> getSalaryDetails(Long employeeId) {
        Optional<Employee> employee = employeeRepository.findById(employeeId);
        if (employee.isEmpty()) {
            throw new RuntimeException("Employee not found");
        }

        Map<String, Object> details = new HashMap<>();
        details.put("baseSalary", employee.get().getBaseSalary());
        // Add calculations for deductions, net pay, etc.
        return details;
    }

    public List<Map<String, Object>> getPayslips(Long employeeId) {
        // Implement payslip history retrieval
        return Collections.emptyList();
    }

    public Map<String, Object> getTaxDetails(Long employeeId) {
        // Implement tax calculation logic
        return Collections.emptyMap();
    }

    public Map<String, Object> calculateTax(Long employeeId) {
        Optional<Employee> employee = employeeRepository.findById(employeeId);
        if (employee.isEmpty()) {
            throw new RuntimeException("Employee not found");
        }

        // Simplified tax calculation - replace with actual logic
        float grossSalary = employee.get().getBaseSalary() * 12; // annual
        float tax = 0;

        if (grossSalary > 50000) tax = grossSalary * 0.2f;
        else if (grossSalary > 30000) tax = grossSalary * 0.15f;
        else tax = grossSalary * 0.1f;

        Map<String, Object> result = new HashMap<>();
        result.put("grossSalary", grossSalary);
        result.put("tax", tax);
        result.put("netSalary", grossSalary - tax);

        return result;
    }

    public Map<String, Object> getBenefits(Long employeeId) {
        // Implement benefits tracking logic
        Map<String, Object> benefits = new HashMap<>();
        benefits.put("healthInsurance", true);
        benefits.put("retirementPlan", true);
        // Add more benefits as needed
        return benefits;
    }

    public void updateHolidayPays(String username, float regularHolidayPay, float specialHolidayPay) {
        Employee employee = employeeRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found"));

        employee.setRegularHolidayPay(regularHolidayPay);
        employee.setSpecialHolidayPay(specialHolidayPay);
        employeeRepository.save(employee);
    }

    public void updateAbsenceDays(String username, int absenceDays) {
        Employee employee = employeeRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found"));

        employee.setAbsenceDays(absenceDays);
        employeeRepository.save(employee);
    }
}
