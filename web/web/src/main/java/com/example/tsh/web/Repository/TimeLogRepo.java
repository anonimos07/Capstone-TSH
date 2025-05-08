package com.example.tsh.web.Repository;

import com.example.tsh.web.Entity.Employee;
import com.example.tsh.web.Entity.HR;
import com.example.tsh.web.Entity.TimeLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TimeLogRepo extends JpaRepository<TimeLog, Long> {
    List<TimeLog> findByEmployee(Employee employee);

    // Find logs for an employee on a specific date
    @Query("SELECT t FROM TimeLog t WHERE t.employee = :employee AND CAST(t.date AS date) = CAST(:date AS date)")
    List<TimeLog> findByEmployeeAndDate(@Param("employee") Employee employee, @Param("date") LocalDateTime date);

    // Find logs for today for a specific employee
    @Query("SELECT t FROM TimeLog t WHERE t.employee = :employee AND CAST(t.date AS date) = CURRENT_DATE")
    List<TimeLog> findTodayLogsByEmployee(@Param("employee") Employee employee);

    // Find active log (without time_out) for an employee
    @Query("SELECT t FROM TimeLog t WHERE t.employee = :employee AND t.timeOut IS NULL")
    TimeLog findActiveLogByEmployee(@Param("employee") Employee employee);

    // In TimeLogRepo.java
    List<TimeLog> findByAssignedHr(HR hr);
}
