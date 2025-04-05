package com.example.tsh.web.Service;

import com.example.tsh.web.Entity.Admin;
import com.example.tsh.web.Entity.Employee;
import com.example.tsh.web.Entity.HR;
import com.example.tsh.web.Entity.Role;
import com.example.tsh.web.Repository.EmployeeRepo;
import com.example.tsh.web.Repository.HRRepo;
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
public class HRService {
    private final HRRepo hrRepository;
    private final EmployeeRepo employeeRepo;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    AuthenticationManager authenticationManager;

    public HR saveHr(HR hr) {
        hr.setPassword(passwordEncoder.encode(hr.getPassword()));
        hr.setRole(Role.HR);
        return hrRepository.save(hr);
    }
    public Employee createEmployee(Employee employee) {
        employee.setPassword(passwordEncoder.encode(employee.getPassword()));
        employee.setRole(Role.EMPLOYEE);
        return employeeRepo.save(employee);
    }

    public List<HR> getAllHr(){
        return hrRepository.findAll();
    }

    public HR authenticateHR(String user, String password) {
        Optional<HR> hrOptional = hrRepository.findByUser(user);

        if (hrOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        HR hr = hrOptional.get();

        if (!passwordEncoder.matches(password, hr.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        // Role is already set to EMPLOYEE in your saveEmployee method
        // You can add additional role checks here if needed
        if (hr.getRole() != Role.HR) {
            throw new RuntimeException("Unauthorized");
        }

        return hr;
    }

//    public String verify(HR hr){
//        Authentication authentication =
//                authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(hr.getUser(), hr.getPassword()));
//        if(authentication.isAuthenticated())
//            return jwtService.generateToken(hr.getUser());
//
//        return "failed";
//    }

    public String verify(HR hr, Role expectedRole) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(hr.getUser(), hr.getPassword())
        );

        if (authentication.isAuthenticated()) {
            Optional<HR> foundHr = hrRepository.findByUser(hr.getUser());

            if (foundHr.isPresent() && foundHr.get().getRole() == expectedRole) {
                return jwtService.generateToken(hr.getUser());
            } else {
                return "unauthorized";
            }
        }
        return "failed";
    }
}
