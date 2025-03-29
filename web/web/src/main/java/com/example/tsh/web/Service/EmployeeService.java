package com.example.tsh.web.Service;

import com.example.tsh.web.Entity.Employee;
import com.example.tsh.web.Entity.Role;
import com.example.tsh.web.Repository.EmployeeRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EmployeeService {
    private final EmployeeRepo employeeRepository;
    private final PasswordEncoder passwordEncoder;


    public Employee saveEmployee(Employee employee) {
        employee.setPassword(passwordEncoder.encode(employee.getPassword()));
        employee.setRole(Role.EMPLOYEE); // Set role explicitly
        return employeeRepository.save(employee);
    }


    public Employee authenticateEmployee(String user, String password) {
        Optional<Employee> employeeOptional = employeeRepository.findByUser(user);

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
}

