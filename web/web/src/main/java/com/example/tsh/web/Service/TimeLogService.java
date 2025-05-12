package com.example.tsh.web.Service;

import com.example.tsh.web.DTO.TimeLogSummary;
import com.example.tsh.web.Entity.Employee;
import com.example.tsh.web.Entity.HR;
import com.example.tsh.web.Entity.TimeLog;
import com.example.tsh.web.Repository.EmployeeRepo;
import com.example.tsh.web.Repository.HRRepo;
import com.example.tsh.web.Repository.TimeLogRepo;
import com.example.tsh.web.Util.CutoffUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class TimeLogService {

    @Autowired
    private TimeLogRepo timeLogRepository;

    // In TimeLogService.java
    @Autowired
    private HRRepo hrRepository;

    @Autowired
    private EmployeeRepo employeeRepo;


    CutoffUtil cutoffUtil;

    @Transactional
    public TimeLog assignHrToTimeLog(Long timeLogId, Long hrId) {
        TimeLog timeLog = timeLogRepository.findById(timeLogId)
                .orElseThrow(() -> new IllegalArgumentException("TimeLog not found"));

        HR hr = hrRepository.findById(hrId)
                .orElseThrow(() -> new IllegalArgumentException("HR not found"));

        timeLog.setAssignedHr(hr);
        return timeLogRepository.save(timeLog);
    }

    // Find all time logs
    public List<TimeLog> findAllTimeLogs() {
        return timeLogRepository.findAll();
    }

    // Find time log by ID
    public Optional<TimeLog> findTimeLogById(Long id) {
        return timeLogRepository.findById(id);
    }

    // Find logs by employee
    public List<TimeLog> findTimeLogsByEmployee(Employee employee) {
        return timeLogRepository.findByEmployee(employee);
    }

    // Find today's logs for an employee
    public List<TimeLog> findTodayLogsByEmployee(Employee employee) {
        return timeLogRepository.findTodayLogsByEmployee(employee);
    }

    // Find logs by employee and date
    public List<TimeLog> findLogsByEmployeeAndDate(Employee employee, LocalDateTime date) {
        return timeLogRepository.findByEmployeeAndDate(employee, date);
    }

    // Record time in (create new time log)
    public TimeLog timeIn(Employee employee) {
        // First check if there's an active log
        TimeLog activeLog = timeLogRepository.findActiveLogByEmployee(employee);

        if (activeLog != null) {
            throw new IllegalStateException("Employee already timed in");
        }


        LocalDateTime now = LocalDateTime.now();
        String cutoffLabel = CutoffUtil.getCutoffLabel(now.toLocalDate());

        // Create a new time log with the current timestamp
        TimeLog timeLog = new TimeLog(employee, LocalDateTime.now(), null);
        timeLog.setCutoffPeriod(cutoffLabel);
        // Save the new time log and return it
        return timeLogRepository.save(timeLog);
    }

    // Record time out (update existing time log)
    public TimeLog timeOut(Employee employee) {
        TimeLog activeLog = timeLogRepository.findActiveLogByEmployee(employee);

        if (activeLog == null) {
            throw new IllegalStateException("No active time-in found for employee");
        }

        // Set the time-out timestamp
        activeLog.setTimeOut(LocalDateTime.now());

        // Save the updated time log and return it
        return timeLogRepository.save(activeLog);
    }


    // Save or update a time log
    public TimeLog saveTimeLog(TimeLog timeLog) {
        return timeLogRepository.save(timeLog);
    }

    // Delete a time log
    public void deleteTimeLog(Long id) {
        timeLogRepository.deleteById(id);
    }

    // Get current employee status (timed in or not)
    public TimeLog getCurrentStatus(Employee employee) {
        return timeLogRepository.findActiveLogByEmployee(employee);
    }


    public TimeLog adjustTimeLog(Long timeLogId, Employee employee, LocalDateTime timeIn, LocalDateTime timeOut) {
        TimeLog log = timeLogRepository.findById(timeLogId)
                .orElseThrow(() -> new IllegalArgumentException("TimeLog not found"));

        if (log.getEmployee().getEmployeeId() != employee.getEmployeeId()) {
            throw new IllegalArgumentException("TimeLog does not belong to the specified employee");
        }


        if (timeIn != null) {
            log.setTimeIn(timeIn);
        }
        if (timeOut != null) {
            log.setTimeOut(timeOut);
        }

        return timeLogRepository.save(log);
    }

    public List<TimeLog> getAttendanceForMonth(Long employeeId, int year, int month) {
        Employee employee = employeeRepo.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        return timeLogRepository.findByEmployeeAndMonthAndYear(employee, month, year);
    }


    //mao ni akoa gigamit logic para cutoff
    public List<Map<String, Object>> getEmployeeHoursByCutoff(Long employeeId) {
        List<TimeLogSummary> summaries = timeLogRepository.getWorkedMinutesByCutoff(employeeId);

        return summaries.stream().map(summary -> {
            Map<String, Object> map = new HashMap<>();
            map.put("cutoffPeriod", summary.getCutoff());
            map.put("totalHours", summary.getTotalMinutes() / 60.0); // convert mins to hours
            return map;
        }).toList();
    }




}