package com.example.tsh.web.Repository;

import com.example.tsh.web.DTO.TimeLogSummary;
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

    @Query("SELECT t FROM TimeLog t WHERE t.employee = :employee AND CAST(t.date AS date) = CAST(:date AS date)")
    List<TimeLog> findByEmployeeAndDate(@Param("employee") Employee employee, @Param("date") LocalDateTime date);

    @Query("SELECT t FROM TimeLog t WHERE t.employee = :employee AND CAST(t.date AS date) = CURRENT_DATE")
    List<TimeLog> findTodayLogsByEmployee(@Param("employee") Employee employee);

    @Query("SELECT t FROM TimeLog t WHERE t.employee = :employee AND t.timeOut IS NULL")
    TimeLog findActiveLogByEmployee(@Param("employee") Employee employee);

    List<TimeLog> findByAssignedHr(HR hr);

    @Query("SELECT t FROM TimeLog t WHERE YEAR(t.date) = :year AND MONTH(t.date) = :month")
    List<TimeLog> findByMonthAndYear(@Param("month") int month, @Param("year") int year);

    @Query("SELECT t FROM TimeLog t WHERE t.employee = :employee AND YEAR(t.date) = :year AND MONTH(t.date) = :month")
    List<TimeLog> findByEmployeeAndMonthAndYear(
            @Param("employee") Employee employee,
            @Param("month") int month,
            @Param("year") int year);


    //newly added para trace sa timelog cutoff
    @Query("SELECT t.cutoffPeriod AS cutoff, SUM(t.durationMinutes) AS totalMinutes " +
            "FROM TimeLog t " +
            "WHERE t.employee.id = :employeeId " +
            "GROUP BY t.cutoffPeriod " +
            "ORDER BY t.cutoffPeriod")
    List<TimeLogSummary> getWorkedMinutesByCutoff(@Param("employeeId") Long employeeId);

    // FOR PAYROLL - JARED
    @Query("SELECT t FROM TimeLog t WHERE t.employee = :employee AND t.date BETWEEN :startDate AND :endDate")
    List<TimeLog> findByEmployeeAndDateBetween(
            @Param("employee") Employee employee,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    List<TimeLog> findByEmployeeEmployeeIdAndTimeInBetween(Long employeeId, LocalDateTime start, LocalDateTime end);



    //test for overtime
//    List<TimeLogSummary> getOvertimeMinutesByCutoff(@Param("employeeId") Long employeeId);

}
