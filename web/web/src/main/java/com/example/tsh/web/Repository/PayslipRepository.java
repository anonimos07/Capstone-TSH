package com.example.tsh.web.Repository;

import com.example.tsh.web.Entity.Payslip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PayslipRepository extends JpaRepository<Payslip, Long> {


    @Query("SELECT p FROM Payslip p WHERE p.employee.employeeId = :employeeId")
    List<Payslip> findPayslipsByEmployeeId(@Param("employeeId") Long employeeId);

    List<Payslip> findByPayrollPayrollId(Long payrollId);

    Optional<Payslip> findByPayrollPayrollIdAndEmployeeEmployeeId(Long payrollId, Long employeeId);

    List<Payslip> findByGeneratedDateBetween(LocalDate startDate, LocalDate endDate);

    List<Payslip> findByEmployeeEmployeeIdAndGeneratedDateBetween(Long employeeId, LocalDate startDate, LocalDate endDate);

    List<Payslip> findByStatus(String status);
}