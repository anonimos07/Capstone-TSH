package com.example.tsh.web.Repository;

import com.example.tsh.web.Entity.HR;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HRRepo extends JpaRepository<HR, Long> {
    Optional<HR> findByUser(String user);
}
