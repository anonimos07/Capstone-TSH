package com.example.tsh.web.Repository;

import com.example.tsh.web.Entity.Employee;
import com.example.tsh.web.Entity.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Long> {
    List<Payroll> findByEmployee(Employee employee);
    List<Payroll> findByEmployeeEmployeeId(Long employeeId);
    List<Payroll> findByPayrollDateBetween(LocalDate startDate, LocalDate endDate);
    List<Payroll> findByEmployeeEmployeeIdAndPayrollDateBetween(Long employeeId, LocalDate startDate, LocalDate endDate);
}