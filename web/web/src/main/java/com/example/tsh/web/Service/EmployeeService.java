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

//    public String verify(Employee employee){
//        Authentication authentication =
//                authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(employee.getUser(), employee.getPassword()));
//        if(authentication.isAuthenticated())
//            return jwtService.generateToken(employee.getUser());
//
//        return "failed";
//    }

    public String verify(Employee employee, Role expectedRole) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(employee.getUser(), employee.getPassword())
        );

        if (authentication.isAuthenticated()) {
            Optional<Employee> foundEmployee = employeeRepository.findByUser(employee.getUser());

            if (foundEmployee.isPresent() && foundEmployee.get().getRole() == expectedRole) {
                return jwtService.generateToken(employee.getUser());
            } else {
                return "unauthorized";
            }
        }
        return "failed";
    }
}
