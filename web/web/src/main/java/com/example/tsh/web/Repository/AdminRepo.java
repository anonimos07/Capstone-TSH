package com.example.tsh.web.Repository;

import com.example.tsh.web.Entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminRepo extends JpaRepository<Admin, Long> {
    boolean existsByUser(String user);
    Optional<Admin> findByUser(String user);

}
