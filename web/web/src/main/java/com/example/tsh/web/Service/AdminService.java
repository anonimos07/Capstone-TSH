package com.example.tsh.web.Service;


import com.example.tsh.web.Entity.Admin;
import com.example.tsh.web.Entity.Employee;
import com.example.tsh.web.Entity.Role;
import com.example.tsh.web.Repository.AdminRepo;
import jakarta.annotation.PostConstruct;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AdminService {

    public final AdminRepo adminRepository;
    private final PasswordEncoder passwordEncoder;

//    public AdminService(AdminRepo adminRepository, PasswordEncoder passwordEncoder){
//        this.adminRepository = adminRepository;
//        this.passwordEncoder = passwordEncoder;
//    }

    public Admin authenticateAdmin(String user, String password) {
        Optional<Admin> adminOptional = adminRepository.findByUser(user);

        if (adminOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        Admin admin = adminOptional.get();

        if (!passwordEncoder.matches(password, admin.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        // Role is already set to EMPLOYEE in your saveEmployee method
        // You can add additional role checks here if needed
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



//    // Check login credentials (optional for authentication)
//    public boolean validateAdmin(String user, String password) {
//        return adminRepository.findByUserAndPassword(user, password).isPresent();
//    }

    @PostConstruct
    public void adminAcc() {
        String defUser = "tsh.ADMIN";
        String defPass = "admin123";

        // Check if admin exists (by username only)
        if (!adminRepository.existsByUser(defUser)) {
            Admin admin = new Admin();
            admin.setUser(defUser);
            admin.setPassword(passwordEncoder.encode(defPass));
            admin.setRole(Role.ADMIN);
            adminRepository.save(admin);
            System.out.println("Default admin created with encoded password");
        }
    }



}
