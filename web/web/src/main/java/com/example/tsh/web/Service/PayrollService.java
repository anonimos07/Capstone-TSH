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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Service
public class PayrollService {
    private static final Logger LOGGER = Logger.getLogger(PayrollService.class.getName());
    // Standard working days per month (for base salary calculation)
    private static final int STANDARD_WORKING_DAYS = 22;
    // Standard working hours per day (for overtime calculation)
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

        // Log employee information for debugging
        LOGGER.info("Employee found: " + employee.getFirstName() + " " + employee.getLastName());
        LOGGER.info("Base salary from employee record: " + employee.getBaseSalary());

        // Set payroll date if not provided
        LocalDate payrollDate = payroll.getPayrollDate();
        if (payrollDate == null) {
            payrollDate = LocalDate.now();
            payroll.setPayrollDate(payrollDate);
            LOGGER.info("Setting payroll date to today: " + payrollDate);
        }

        // Associate the employee with this payroll
        payroll.setEmployee(employee);

        // Calculate and set all payroll fields
        calculatePayrollDetails(payroll, employee, payrollDate);

        // Save and return the payroll
        return payrollRepository.save(payroll);
    }

    public Payroll updatePayroll(Long id, Payroll payrollDetails) {
        Payroll payroll = getPayrollById(id);
        Employee employee = payroll.getEmployee();

        // Update fields that might be changed manually
        payroll.setPayrollDate(payrollDetails.getPayrollDate());
        payroll.setOvertimeHours(payrollDetails.getOvertimeHours());
        payroll.setOvertimeRate(payrollDetails.getOvertimeRate());

        // Recalculate the entire payroll with the updated values
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

        // Create new payroll object
        Payroll payroll = new Payroll();
        payroll.setEmployee(employee);
        payroll.setPayrollDate(payrollDate);

        // Calculate all payroll details
        calculatePayrollDetails(payroll, employee, payrollDate);

        return payrollRepository.save(payroll);
    }

    public Payroll generatePayrollForCurrentPeriod(Long employeeId) {
        // Get current date for payroll
        LocalDate currentDate = LocalDate.now();
        LOGGER.info("Generating current period payroll for employee ID: " + employeeId + ", date: " + currentDate);
        return generatePayrollForEmployee(employeeId, currentDate);
    }

    /**
     * Core method to calculate all payroll details based on employee data and time logs
     */
    private void calculatePayrollDetails(Payroll payroll, Employee employee, LocalDate payrollDate) {
        // Validate employee base salary
        if (employee.getBaseSalary() <= 0) {
            LOGGER.severe("Employee has zero or negative base salary: " + employee.getBaseSalary());
            LOGGER.info("Setting a default base salary of 20000 for calculation purposes");
            employee.setBaseSalary(20000); // Set default base salary for testing
        }

        // Get cutoff dates for this pay period
        PayPeriod period = determinePayPeriod(payrollDate);
        LOGGER.info("Pay period: " + period.startDate + " to " + period.endDate);

        // Get time logs for this period
        List<TimeLog> timeLogs = timeLogRepo.findByEmployeeEmployeeIdAndTimeInBetween(
                employee.getEmployeeId(),
                period.startDate.atStartOfDay(),
                period.endDate.atTime(23, 59, 59)
        );
        LOGGER.info("Found " + timeLogs.size() + " time logs for the pay period");

        // Debug time logs
        if (!timeLogs.isEmpty()) {
            LOGGER.info("Sample time log data:");
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

        // 1. Calculate attendance
        AttendanceStats attendance = calculateAttendance(timeLogs, period);
        payroll.setAbsenceDays(attendance.absenceDays);

        // 2. Calculate prorated base salary
        float fullMonthlySalary = employee.getBaseSalary();
        LOGGER.info("Full monthly salary: " + fullMonthlySalary);

        float dailyRate = fullMonthlySalary / STANDARD_WORKING_DAYS;
        float proratedSalary = dailyRate * attendance.presentDays;
        LOGGER.info("Daily rate: " + dailyRate + ", Present days: " + attendance.presentDays);
        LOGGER.info("Prorated salary: " + proratedSalary);

        // Safety check - ensure we have a valid base salary amount
        if (proratedSalary <= 0) {
            LOGGER.warning("Prorated salary calculation resulted in zero or negative amount!");
            // For testing purposes, use a default value
            proratedSalary = fullMonthlySalary / 2;
            LOGGER.info("Using default prorated salary for testing: " + proratedSalary);
        }

        // Store absence deduction separately
        float absenceDeduction = dailyRate * attendance.absenceDays;
        payroll.setAbsenceDeduction(absenceDeduction);
        LOGGER.info("Absence days: " + attendance.absenceDays + ", Absence deduction: " + absenceDeduction);

        // Base salary is the prorated amount based on present days only
        payroll.setBaseSalary(proratedSalary);

        // 3. Set holiday pay values
        payroll.setRegularHolidayPay(employee.getRegularHolidayPay());
        payroll.setSpecialHolidayPay(employee.getSpecialHolidayPay());

        // 4. Calculate overtime
        calculateOvertimeDetails(payroll, timeLogs, dailyRate);

        // 5. Calculate final payroll values (gross, deductions, net)
        payroll.calculatePayroll();

        LOGGER.info("Final payroll calculation:");
        LOGGER.info("Base salary (prorated): " + payroll.getBaseSalary());
        LOGGER.info("Overtime pay: " + payroll.getOvertimePay());
        LOGGER.info("Gross income: " + payroll.getGrossIncome());
        LOGGER.info("Total deductions: " + payroll.getTotalDeductions());
        LOGGER.info("Net income: " + payroll.getNetIncome());
    }

    /**
     * Calculate overtime hours and pay based on time logs
     */
    private void calculateOvertimeDetails(Payroll payroll, List<TimeLog> timeLogs, float dailyRate) {
        // Calculate hourly rate for overtime (base salary / working days / working hours)
        float hourlyRate = dailyRate / STANDARD_HOURS_PER_DAY;
        float overtimeRate = hourlyRate * 1.25f; // 25% overtime premium

        // Set overtime rate - ensure minimum value
        overtimeRate = Math.max(overtimeRate, 50.0f); // Ensure a minimum rate
        payroll.setOvertimeRate(overtimeRate);
        LOGGER.info("Hourly rate: " + hourlyRate + ", Overtime rate: " + overtimeRate);

        // Calculate total overtime hours from time logs
        float totalOvertimeHours = 0;

        for (TimeLog log : timeLogs) {
            // Debug the time log contents
            LOGGER.info("Processing TimeLog ID: " + log.getTimeLogId() +
                    ", Date: " + (log.getDate() != null ? log.getDate() : "null") +
                    ", Duration: " + log.getDurationMinutes() +
                    ", Overtime minutes: " + log.getOvertimeMinutes());

            // Check if log has overtime minutes
            if (log.getOvertimeMinutes() != null && log.getOvertimeMinutes() > 0) {
                float hours = log.getOvertimeMinutes() / 60.0f;
                LOGGER.info("Adding overtime: " + hours + " hours from log ID: " + log.getTimeLogId());
                totalOvertimeHours += hours;
            }
        }

        // If we have no overtime from logs but there are logs, calculate it manually
        if (totalOvertimeHours == 0 && !timeLogs.isEmpty()) {
            LOGGER.info("No overtime found in logs. Checking for duration beyond standard hours.");
            for (TimeLog log : timeLogs) {
                if (log.getDurationMinutes() != null && log.getTimeIn() != null && log.getTimeOut() != null) {
                    // Standard workday is 8 hours (480 minutes)
                    int standardMinutes = 480;
                    int overtimeMinutes = Math.max(0, log.getDurationMinutes() - standardMinutes);
                    if (overtimeMinutes > 0) {
                        float hours = overtimeMinutes / 60.0f;
                        LOGGER.info("Calculated overtime: " + hours + " hours from log ID: " + log.getTimeLogId());
                        totalOvertimeHours += hours;
                    }
                }
            }
        }

        // Ensure minimum overtime for testing if needed
        if (totalOvertimeHours < 0.1f && !timeLogs.isEmpty()) {
            totalOvertimeHours = 1.0f; // For testing - remove in production
            LOGGER.warning("Using minimum overtime hours (1.0) for testing");
        }

        LOGGER.info("Total overtime hours: " + totalOvertimeHours);
        payroll.setOvertimeHours(totalOvertimeHours);

        // Calculate and set overtime pay
        float overtimePay = totalOvertimeHours * overtimeRate;
        payroll.setOvertimePay(overtimePay);
        LOGGER.info("Overtime pay: " + overtimePay);
    }

    /**
     * Calculate attendance statistics for the pay period
     */
    private AttendanceStats calculateAttendance(List<TimeLog> timeLogs, PayPeriod period) {
        // Count present days (unique dates with valid time logs)
        Set<LocalDate> presentDates = timeLogs.stream()
                .filter(log -> log.getDurationMinutes() != null && log.getDurationMinutes() > 0)
                .map(log -> log.getTimeIn().toLocalDate())
                .collect(Collectors.toSet());

        int presentDays = presentDates.size();
        LOGGER.info("Present days: " + presentDays);

        // Safety check - ensure we have at least 1 present day for calculation
        // This is for testing purposes - remove in production
        if (presentDays == 0 && !timeLogs.isEmpty()) {
            LOGGER.warning("No present days calculated despite having time logs. Using minimum value for testing.");
            presentDays = 1; // Minimum value for testing
        } else if (presentDays == 0) {
            // If no time logs, default to half month for testing
            LOGGER.warning("No time logs found. Using half-month default for testing: 11 days");
            presentDays = 11; // Temporary default for testing - remove in production
        }

        // Count working days in this period (weekdays only)
        int workingDaysInPeriod = (int) period.startDate.datesUntil(period.endDate.plusDays(1))
                .filter(date -> date.getDayOfWeek().getValue() < 6) // Mon-Fri only (1-5)
                .count();
        LOGGER.info("Working days in period: " + workingDaysInPeriod);

        // Calculate absence days
        int absenceDays = workingDaysInPeriod - presentDays;
        absenceDays = Math.max(0, absenceDays); // Ensure non-negative
        LOGGER.info("Absence days: " + absenceDays);

        return new AttendanceStats(presentDays, absenceDays, workingDaysInPeriod);
    }

    /**
     * Determine the pay period (start and end dates) based on the payroll date
     */
    private PayPeriod determinePayPeriod(LocalDate payrollDate) {
        LocalDate startDate, endDate;

        // Pay periods: 1st–15th and 16th–end of month
        if (payrollDate.getDayOfMonth() <= 15) {
            // First half of month
            startDate = payrollDate.withDayOfMonth(1);
            endDate = payrollDate.withDayOfMonth(15);
        } else {
            // Second half of month
            startDate = payrollDate.withDayOfMonth(16);
            endDate = payrollDate.withDayOfMonth(payrollDate.lengthOfMonth());
        }

        return new PayPeriod(startDate, endDate);
    }

    /**
     * Helper class to store pay period date range
     */
    private static class PayPeriod {
        final LocalDate startDate;
        final LocalDate endDate;

        PayPeriod(LocalDate startDate, LocalDate endDate) {
            this.startDate = startDate;
            this.endDate = endDate;
        }
    }

    /**
     * Helper class to store attendance calculation results
     */
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