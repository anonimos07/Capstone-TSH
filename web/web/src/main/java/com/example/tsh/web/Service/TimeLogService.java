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

    public List<TimeLog> findAllTimeLogs() {
        return timeLogRepository.findAll();
    }

    public Optional<TimeLog> findTimeLogById(Long id) {
        return timeLogRepository.findById(id);
    }

    public List<TimeLog> findTimeLogsByEmployee(Employee employee) {
        return timeLogRepository.findByEmployee(employee);
    }

    public List<TimeLog> findTodayLogsByEmployee(Employee employee) {
        return timeLogRepository.findTodayLogsByEmployee(employee);
    }

    public List<TimeLog> findLogsByEmployeeAndDate(Employee employee, LocalDateTime date) {
        return timeLogRepository.findByEmployeeAndDate(employee, date);
    }

    public TimeLog timeIn(Employee employee) {
        TimeLog activeLog = timeLogRepository.findActiveLogByEmployee(employee);

        if (activeLog != null) {
            throw new IllegalStateException("Employee already timed in");
        }


        LocalDateTime now = LocalDateTime.now();
        String cutoffLabel = CutoffUtil.getCutoffLabel(now.toLocalDate());

        TimeLog timeLog = new TimeLog(employee, LocalDateTime.now(), null);
        timeLog.setCutoffPeriod(cutoffLabel);
        return timeLogRepository.save(timeLog);
    }

    public TimeLog timeOut(Employee employee) {
        TimeLog activeLog = timeLogRepository.findActiveLogByEmployee(employee);

        if (activeLog == null) {
            throw new IllegalStateException("No active time-in found for employee");
        }

        activeLog.setTimeOut(LocalDateTime.now());

        return timeLogRepository.save(activeLog);
    }

    public TimeLog saveTimeLog(TimeLog timeLog) {
        return timeLogRepository.save(timeLog);
    }

    public void deleteTimeLog(Long id) {
        timeLogRepository.deleteById(id);
    }

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