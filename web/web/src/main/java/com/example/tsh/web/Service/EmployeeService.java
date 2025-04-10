package com.example.tsh.web.Service;

import com.example.tsh.web.Entity.Employee;
import com.example.tsh.web.Entity.Role;
import com.example.tsh.web.Repository.EmployeeRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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
}
