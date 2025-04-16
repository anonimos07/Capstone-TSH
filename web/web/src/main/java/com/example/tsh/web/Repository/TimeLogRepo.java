package com.example.tsh.web.Repository;

import com.example.tsh.web.Entity.Employee;
import com.example.tsh.web.Entity.TimeLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TimeLogRepo extends JpaRepository<TimeLog, Long> {
    List<TimeLog> findByEmployeeOrderByTimeInDesc(Employee employee);

    List<TimeLog> findByEmployeeAndLogDateOrderByTimeInDesc(Employee employee, LocalDate logDate);

    @Query("SELECT t FROM TimeLog t WHERE t.status = :status")
    Optional<TimeLog> findActiveTimeLogByEmployee(@Param("employee") Employee employee);

    List<TimeLog> findByLogDateBetweenAndEmployee(LocalDate startDate, LocalDate endDate, Employee employee);
}
