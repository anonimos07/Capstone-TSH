package com.example.tsh.web.Repository;

import com.example.tsh.web.Entity.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PayrollRepo extends JpaRepository<Payroll, Long> {

    List<Payroll> findByPeriodContaining(String keyword);

    List<Payroll> findByPeriodContainingAndStatus(String keyword, String status);

    List<Payroll> findByStatus(String status);
}
