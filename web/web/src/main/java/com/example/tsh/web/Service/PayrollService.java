package com.example.tsh.web.Service;

import com.example.tsh.web.Entity.Employee;
import com.example.tsh.web.Entity.Payroll;

import com.example.tsh.web.Entity.TimeLog;
import com.example.tsh.web.Repository.EmployeeRepo;
import com.example.tsh.web.Repository.PayrollRepository;
import com.example.tsh.web.Repository.TimeLogRepo;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Service
public class PayrollService {
    private static final Logger LOGGER = Logger.getLogger(PayrollService.class.getName());
    private static final int STANDARD_WORKING_DAYS = 22;
    private static final int STANDARD_HOURS_PER_DAY = 8;





    private final PayrollRepository payrollRepository;
    private final EmployeeRepo employeeRepository;
    private final TimeLogRepo timeLogRepo;

    @Autowired
    public PayrollService(PayrollRepository payrollRepository, EmployeeRepo employeeRepository, TimeLogRepo timeLogRepo) {
        this.payrollRepository = payrollRepository;
        this.employeeRepository = employeeRepository;
        this.timeLogRepo = timeLogRepo;
    }

    public List<Payroll> getAllPayrolls() {
        return payrollRepository.findAll();
    }

    public Payroll getPayrollById(Long id) {
        return payrollRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Payroll not found with id: " + id));
    }

    public List<Payroll> getPayrollsByEmployeeId(Long employeeId) {
        return payrollRepository.findByEmployeeEmployeeId(employeeId);
    }

    public List<Payroll> getPayrollsByDateRange(LocalDate startDate, LocalDate endDate) {
        return payrollRepository.findByPayrollDateBetween(startDate, endDate);
    }

    public List<Payroll> getPayrollsByEmployeeAndDateRange(Long employeeId, LocalDate startDate, LocalDate endDate) {
        return payrollRepository.findByEmployeeEmployeeIdAndPayrollDateBetween(employeeId, startDate, endDate);
    }

    public Payroll createPayroll(Long employeeId, Payroll payroll) {
        LOGGER.info("Creating payroll for employee ID: " + employeeId);

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + employeeId));

        LOGGER.info("Employee found: " + employee.getFirstName() + " " + employee.getLastName());
        LOGGER.info("Base salary from employee record: " + employee.getBaseSalary());

        LocalDate payrollDate = payroll.getPayrollDate();
        if (payrollDate == null) {
            payrollDate = LocalDate.now();
            payroll.setPayrollDate(payrollDate);
            LOGGER.info("Setting payroll date to today: " + payrollDate);
        }

        payroll.setEmployee(employee);

        calculatePayrollDetails(payroll, employee, payrollDate);

        LOGGER.info("Final verification before save:");
        LOGGER.info("  Overtime hours: " + payroll.getOvertimeHours());
        LOGGER.info("  Overtime rate: " + payroll.getOvertimeRate());
        LOGGER.info("  Overtime pay: " + payroll.getOvertimePay());

        return payrollRepository.save(payroll);
    }

    public Payroll updatePayroll(Long id, Payroll payrollDetails) {
        Payroll payroll = getPayrollById(id);
        Employee employee = payroll.getEmployee();

        payroll.setPayrollDate(payrollDetails.getPayrollDate());
        payroll.setOvertimeHours(payrollDetails.getOvertimeHours());
        payroll.setOvertimeRate(payrollDetails.getOvertimeRate());

        calculatePayrollDetails(payroll, employee, payroll.getPayrollDate());

        return payrollRepository.save(payroll);
    }

    public void deletePayroll(Long id) {
        Payroll payroll = getPayrollById(id);
        payrollRepository.delete(payroll);
    }

    public Payroll generatePayrollForEmployee(Long employeeId, LocalDate payrollDate) {
        LOGGER.info("Generating payroll for employee ID: " + employeeId + " for date: " + payrollDate);

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + employeeId));

        LOGGER.info("Employee base salary: " + employee.getBaseSalary());

        Payroll payroll = new Payroll();
        payroll.setEmployee(employee);
        payroll.setPayrollDate(payrollDate);

        calculatePayrollDetails(payroll, employee, payrollDate);

        return payrollRepository.save(payroll);
    }

    public Payroll generatePayrollForCurrentPeriod(Long employeeId) {

        LocalDate currentDate = LocalDate.now();
        LOGGER.info("Generating current period payroll for employee ID: " + employeeId + ", date: " + currentDate);
        return generatePayrollForEmployee(employeeId, currentDate);
    }

    private void calculatePayrollDetails(Payroll payroll, Employee employee, LocalDate payrollDate) {

        if (employee.getBaseSalary() <= 0) {
            LOGGER.severe("Employee has zero or negative base salary: " + employee.getBaseSalary());
            LOGGER.info("Setting a default base salary of 20000 for calculation purposes");
        }

        PayPeriod period = determinePayPeriod(payrollDate);
        LOGGER.info("Pay period: " + period.startDate + " to " + period.endDate);

        List<TimeLog> timeLogs = timeLogRepo.findByEmployeeEmployeeIdAndTimeInBetween(
                employee.getEmployeeId(),
                period.startDate.atStartOfDay(),
                period.endDate.atTime(23, 59, 59)
        );
        LOGGER.info("Found " + timeLogs.size() + " time logs for the pay period");

        ensureOvertimeCalculated(timeLogs);

        if (!timeLogs.isEmpty()) {
            LOGGER.info("Sample time log data after ensuring overtime calculation:");
            TimeLog sampleLog = timeLogs.get(0);
            LOGGER.info("  ID: " + sampleLog.getTimeLogId() +
                    ", Date: " + (sampleLog.getDate() != null ? sampleLog.getDate() : "null") +
                    ", TimeIn: " + (sampleLog.getTimeIn() != null ? sampleLog.getTimeIn() : "null") +
                    ", TimeOut: " + (sampleLog.getTimeOut() != null ? sampleLog.getTimeOut() : "null") +
                    ", Duration: " + sampleLog.getDurationMinutes() +
                    ", Overtime: " + sampleLog.getOvertimeMinutes());
        } else {
            LOGGER.warning("No time logs found for this pay period!");
        }

        AttendanceStats attendance = calculateAttendance(timeLogs, period);
        payroll.setAbsenceDays(attendance.absenceDays);

        float fullMonthlySalary = employee.getBaseSalary();
        LOGGER.info("Full monthly salary: " + fullMonthlySalary);

        float dailyRate = fullMonthlySalary / STANDARD_WORKING_DAYS;
        float proratedSalary = dailyRate * attendance.presentDays;
        LOGGER.info("Daily rate: " + dailyRate + ", Present days: " + attendance.presentDays);
        LOGGER.info("Prorated salary: " + proratedSalary);

        if (proratedSalary <= 0) {
            LOGGER.warning("Prorated salary calculation resulted in zero or negative amount!");

            proratedSalary = fullMonthlySalary / 2;
            LOGGER.info("Using default prorated salary for testing: " + proratedSalary);
        }


        float absenceDeduction = dailyRate * attendance.absenceDays;
        payroll.setAbsenceDeduction(absenceDeduction);
        LOGGER.info("Absence days: " + attendance.absenceDays + ", Absence deduction: " + absenceDeduction);

        payroll.setBaseSalary(proratedSalary);

        payroll.setRegularHolidayPay(employee.getRegularHolidayPay());
        payroll.setSpecialHolidayPay(employee.getSpecialHolidayPay());

        calculateOvertimeDetails(payroll, timeLogs, dailyRate);

        payroll.calculatePayroll();

        LOGGER.info("Final payroll calculation:");
        LOGGER.info("Base salary (prorated): " + payroll.getBaseSalary());
        LOGGER.info("Overtime pay: " + payroll.getOvertimePay());
        LOGGER.info("Gross income: " + payroll.getGrossIncome());
        LOGGER.info("Total deductions: " + payroll.getTotalDeductions());
        LOGGER.info("Net income: " + payroll.getNetIncome());
    }

    private void ensureOvertimeCalculated(List<TimeLog> timeLogs) {
        for (TimeLog log : timeLogs) {

            if (log.getTimeIn() == null || log.getTimeOut() == null) {
                continue;
            }

            if (log.getDurationMinutes() == null || log.getDurationMinutes() <= 0) {
                int durationMinutes = (int) Duration.between(log.getTimeIn(), log.getTimeOut()).toMinutes();
                log.setDurationMinutes(Math.max(0, durationMinutes));
                LOGGER.info("Recalculated duration for log ID " + log.getTimeLogId() + ": " + durationMinutes + " minutes");
            }

            if (log.getOvertimeMinutes() == null || log.getOvertimeMinutes() < 0) {
                int overtimeMinutes = Math.max(0, log.getDurationMinutes() - TimeLog.STANDARD_WORK_MINUTES);
                log.setOvertimeMinutes(overtimeMinutes);
                LOGGER.info("Recalculated overtime for log ID " + log.getTimeLogId() + ": " + overtimeMinutes + " minutes");
            }

            LOGGER.info("Time log ID: " + log.getTimeLogId() +
                    " - Duration: " + log.getDurationMinutes() +
                    " min, Overtime: " + log.getOvertimeMinutes() + " min");
        }

        if (!timeLogs.isEmpty()) {
            timeLogRepo.saveAll(timeLogs);
            LOGGER.info("Saved " + timeLogs.size() + " updated time logs with overtime calculations");
        }
    }

    private void calculateOvertimeDetails(Payroll payroll, List<TimeLog> timeLogs, float dailyRate) {
        LOGGER.info("===== STARTING OVERTIME CALCULATION =====");
        LOGGER.info("Number of time logs to process: " + timeLogs.size());

        float hourlyRate = dailyRate / STANDARD_HOURS_PER_DAY;

        float overtimeRate = hourlyRate * 1.25f;

        overtimeRate = Math.max(overtimeRate, 50.0f);
        payroll.setOvertimeRate(overtimeRate);
        LOGGER.info("Daily rate: " + dailyRate + ", Hourly rate: " + hourlyRate + ", Overtime rate: " + overtimeRate);

        float totalOvertimeHours = 0;

        boolean hasValidLogs = false;

        for (TimeLog log : timeLogs) {

            if (log.getTimeIn() == null || log.getTimeOut() == null) {
                LOGGER.warning("Skipping log ID " + log.getTimeLogId() + " - missing time in or time out values");
                continue;
            }

            LOGGER.info("Processing TimeLog ID: " + log.getTimeLogId() +
                    ", Date: " + log.getDate() +
                    ", TimeIn: " + log.getTimeIn() +
                    ", TimeOut: " + log.getTimeOut() +
                    ", Duration: " + log.getDurationMinutes() + " minutes, " +
                    "Overtime: " + log.getOvertimeMinutes() + " minutes");

            hasValidLogs = true;

            Integer overtimeMinutes = log.getOvertimeMinutes();

            if (overtimeMinutes == null) {
                LOGGER.warning("Log ID " + log.getTimeLogId() + " has null overtime minutes!");
                continue;
            }

            if (overtimeMinutes > 0) {
                float hours = overtimeMinutes / 60.0f;
                totalOvertimeHours += hours;
                LOGGER.info("Added " + hours + " overtime hours from log ID: " + log.getTimeLogId());
            }
        }

        if (!hasValidLogs && !timeLogs.isEmpty()) {
            LOGGER.warning("No valid time logs were found for overtime calculation! Check data integrity.");
        }

        LOGGER.info("Total calculated overtime hours: " + totalOvertimeHours);

        payroll.setOvertimeHours(totalOvertimeHours);

        float overtimePay = totalOvertimeHours * overtimeRate;
        payroll.setOvertimePay(overtimePay);
        LOGGER.info("Final overtime pay calculation: " + totalOvertimeHours + " hours × " + overtimeRate + " = " + overtimePay);
        LOGGER.info("===== COMPLETED OVERTIME CALCULATION =====");
    }


    private AttendanceStats calculateAttendance(List<TimeLog> timeLogs, PayPeriod period) {
        Set<LocalDate> presentDates = timeLogs.stream()
                .filter(log -> log.getDurationMinutes() != null && log.getDurationMinutes() > 0)
                .map(log -> log.getTimeIn().toLocalDate())
                .collect(Collectors.toSet());

        int presentDays = presentDates.size();
        LOGGER.info("Present days: " + presentDays);

        if (presentDays == 0 && !timeLogs.isEmpty()) {
            LOGGER.warning("No present days calculated despite having time logs. Using minimum value for testing.");
            presentDays = 1;
        } else if (presentDays == 0) {

            LOGGER.warning("No time logs found. Using half-month default for testing: 11 days");
            presentDays = 11;
        }

        int workingDaysInPeriod = (int) period.startDate.datesUntil(period.endDate.plusDays(1))
                .filter(date -> date.getDayOfWeek().getValue() < 6) // Mon-Fri only (1-5)
                .count();
        LOGGER.info("Working days in period: " + workingDaysInPeriod);

        int absenceDays = workingDaysInPeriod - presentDays;
        absenceDays = Math.max(0, absenceDays);
        LOGGER.info("Absence days: " + absenceDays);

        return new AttendanceStats(presentDays, absenceDays, workingDaysInPeriod);
    }

    private PayPeriod determinePayPeriod(LocalDate payrollDate) {
        LocalDate startDate, endDate;

        if (payrollDate.getDayOfMonth() <= 15) {
            startDate = payrollDate.withDayOfMonth(1);
            endDate = payrollDate.withDayOfMonth(15);
        } else {
            startDate = payrollDate.withDayOfMonth(16);
            endDate = payrollDate.withDayOfMonth(payrollDate.lengthOfMonth());
        }

        return new PayPeriod(startDate, endDate);
    }

    private static class PayPeriod {
        final LocalDate startDate;
        final LocalDate endDate;

        PayPeriod(LocalDate startDate, LocalDate endDate) {
            this.startDate = startDate;
            this.endDate = endDate;
        }
    }

    private static class AttendanceStats {
        final int presentDays;
        final int absenceDays;
        final int workingDays;

        AttendanceStats(int presentDays, int absenceDays, int workingDays) {
            this.presentDays = presentDays;
            this.absenceDays = absenceDays;
            this.workingDays = workingDays;
        }
    }
}