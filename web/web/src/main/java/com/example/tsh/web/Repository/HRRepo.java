package com.example.tsh.web.Repository;

import com.example.tsh.web.Entity.HR;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HRRepo extends JpaRepository<HR, Long> {
    Optional<HR> findByUsername(String username);
    Optional<HR> findByEmail(String email);
}
