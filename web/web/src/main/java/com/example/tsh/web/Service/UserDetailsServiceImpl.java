package com.example.tsh.web.Service;



import com.example.tsh.web.Entity.Admin;
import com.example.tsh.web.Entity.Employee;
import com.example.tsh.web.Entity.HR;
import com.example.tsh.web.Entity.Role;
import com.example.tsh.web.Repository.AdminRepo;
import com.example.tsh.web.Repository.EmployeeRepo;
import com.example.tsh.web.Repository.HRRepo;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final AdminRepo adminRepo;
    private final HRRepo hrRepo;
    private final EmployeeRepo employeeRepo;

    public UserDetailsServiceImpl(AdminRepo adminRepo, HRRepo hrRepo, EmployeeRepo employeeRepo) {
        this.adminRepo = adminRepo;
        this.hrRepo = hrRepo;
        this.employeeRepo = employeeRepo;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {


        Optional<Admin> admin = adminRepo.findByUser(username);
        if (admin.isPresent()) {
            return User.builder()
                    .username(admin.get().getUser())
                    .password(admin.get().getPassword())
                    .authorities("ROLE_" + admin.get().getRole().name())
                    .build();
        }

        Optional<HR> hr = hrRepo.findByUser(username);
        if (hr.isPresent()) {
            return User.builder()
                    .username(hr.get().getUser())
                    .password(hr.get().getPassword())
                    .authorities("ROLE_" + hr.get().getRole().name())
                    .build();
        }

        Optional<Employee> employee = employeeRepo.findByUser(username);
        if(employee.isPresent()){
            return  User.builder()
                    .username(employee.get().getUser())
                    .password(employee.get().getPassword())
                    .authorities("ROLE_" + employee.get().getRole().name())
                    .build();
        }
        throw new UsernameNotFoundException("User not found with username: " + username);
    }
}