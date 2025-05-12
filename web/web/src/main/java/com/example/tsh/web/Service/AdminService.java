package com.example.tsh.web.Service;


import com.example.tsh.web.Entity.Admin;
import com.example.tsh.web.Entity.Employee;
import com.example.tsh.web.Entity.HR;
import com.example.tsh.web.Entity.Role;
import com.example.tsh.web.Repository.AdminRepo;
import com.example.tsh.web.Repository.EmployeeRepo;
import jakarta.annotation.PostConstruct;

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
public class AdminService {

    public final AdminRepo adminRepository;
    private final PasswordEncoder passwordEncoder;


    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    JwtService jwtService;


    public Admin authenticateAdmin(String user, String password) {
        Optional<Admin> adminOptional = adminRepository.findByUsername(user);

        if (adminOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        Admin admin = adminOptional.get();

        if (!passwordEncoder.matches(password, admin.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        if (admin.getRole() != Role.ADMIN) {
            throw new RuntimeException("Unauthorized");
        }

        return admin;
    }


    //create
    public Admin saveAdmin(Admin admin){
        admin.setPassword(passwordEncoder.encode(admin.getPassword()));
        admin.setRole(Role.ADMIN);
        return adminRepository.save(admin);
    }

    //retrieve all
    public List<Admin>getAllAdmins(){
        return adminRepository.findAll();
    }

    //retrieve id
    public Optional<Admin>getAdminById(long Id){
        return adminRepository.findById(Id);
    }

    // Delete an admin by ID
    public void deleteAdmin(Long id) {
        adminRepository.deleteById(id);
    }

    @PostConstruct
    public void adminAcc() {
        String defUsername = "tsh.ADMIN";
        String defPass = "admin123";

        if (!adminRepository.existsByUsername(defUsername)) {
            Admin admin = new Admin();
            admin.setUsername(defUsername);
            admin.setPassword(passwordEncoder.encode(defPass));
            admin.setRole(Role.ADMIN);
            adminRepository.save(admin);
            System.out.println("Default admin created with encoded password");
        }
    }
    public String verify(Admin admin){
        Authentication authentication =
                authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(admin.getUsername(), admin.getPassword()));
        if(authentication.isAuthenticated())
            return jwtService.generateToken(admin.getUsername());

        return "failed";
    }




}
