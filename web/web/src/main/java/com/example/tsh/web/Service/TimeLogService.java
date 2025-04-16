package com.example.tsh.web.Service;

import com.example.tsh.web.Entity.Employee;
import com.example.tsh.web.Entity.TimeLog;
import com.example.tsh.web.Repository.EmployeeRepo;
import com.example.tsh.web.Repository.TimeLogRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TimeLogService {

    private final TimeLogRepo timeLogRepo;
    private final EmployeeRepo employeeRepo;

//    @Autowired
//    public TimeLogService(TimeLogRepo timeLogRepo, EmployeeRepo employeeRepository) {
//        this.timeLogRepository = timeLogRepository;
//        this.employeeRepository = employeeRepository;
//    }

    /**
     * Record time in for an employee
     * @param employeeId the employee ID
     * @return the created time log
     */
    @Transactional
    public TimeLog timeIn(Long employeeId) {
        Employee employee = employeeRepo.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Check if employee already has an active time log
        Optional<TimeLog> activeLog = timeLogRepo.findActiveTimeLogByEmployee(employee);
        if (activeLog.isPresent()) {
            throw new RuntimeException("Employee already has an active time log. Please time out first.");
        }

        // Create and save new time log
        TimeLog timeLog = new TimeLog(employee);
        return timeLogRepo.save(timeLog);
    }

    /**
     * Record time out for an employee
     * @param employeeId the employee ID
     * @return the updated time log
     */
    @Transactional
    public TimeLog timeOut(Long employeeId) {
        Employee employee = employeeRepo.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Find active time log
        TimeLog activeLog = timeLogRepo.findActiveTimeLogByEmployee(employee)
                .orElseThrow(() -> new RuntimeException("No active time log found. Please time in first."));

        // Complete the time log
        activeLog.completeTimeLog();
        return timeLogRepo.save(activeLog);
    }

    /**
     * Check if employee has an active time log
     * @param employeeId the employee ID
     * @return true if active log exists
     */
    public boolean hasActiveTimeLog(Long employeeId) {
        Employee employee = employeeRepo.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        return timeLogRepo.findActiveTimeLogByEmployee(employee).isPresent();
    }

    /**
     * Get employee's time logs for a date range
     * @param employeeId the employee ID
     * @param startDate start date
     * @param endDate end date
     * @return list of time logs
     */
    public List<TimeLog> getTimeLogsByDateRange(Long employeeId, LocalDate startDate, LocalDate endDate) {
        Employee employee = employeeRepo.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        return timeLogRepo.findByLogDateBetweenAndEmployee(startDate, endDate, employee);
    }

    /**
     * Get employee's time logs for today
     * @param employeeId the employee ID
     * @return list of today's time logs
     */
    public List<TimeLog> getTodayTimeLogs(Long employeeId) {
        Employee employee = employeeRepo.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        return timeLogRepo.findByEmployeeAndLogDateOrderByTimeInDesc(employee, LocalDate.now());
    }

    /**
     * Get all time logs of an employee
     * @param employeeId the employee ID
     * @return list of all time logs
     */
    public List<TimeLog> getAllEmployeeTimeLogs(Long employeeId) {
        Employee employee = employeeRepo.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        return timeLogRepo.findByEmployeeOrderByTimeInDesc(employee);
    }
}
