package com.example.tsh.web.Service;

import com.example.tsh.web.Entity.Employee;
import com.example.tsh.web.Entity.Payroll;
import com.example.tsh.web.Entity.TimeLog;
import com.example.tsh.web.Repository.EmployeeRepo;
import com.example.tsh.web.Repository.PayrollRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PayrollService {

    private final PayrollRepository payrollRepository;
    private final EmployeeRepo employeeRepository;

    @Autowired
    public PayrollService(PayrollRepository payrollRepository, EmployeeRepo employeeRepository) {
        this.payrollRepository = payrollRepository;
        this.employeeRepository = employeeRepository;
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
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + employeeId));

        payroll.setEmployee(employee);
        payroll.setBaseSalary(employee.getBaseSalary());
        payroll.setRegularHolidayPay(employee.getRegularHolidayPay());
        payroll.setSpecialHolidayPay(employee.getSpecialHolidayPay());
        payroll.setAbsenceDays(employee.getAbsenceDays());

        // Calculate overtime based on employee time logs if available
        if (employee.getTimeLogs() != null && !employee.getTimeLogs().isEmpty()) {
            calculateOvertimeFromTimeLogs(payroll, employee.getTimeLogs());
        }

        // Recalculate all payroll values
        payroll.calculatePayroll();

        return payrollRepository.save(payroll);
    }

    public Payroll updatePayroll(Long id, Payroll payrollDetails) {
        Payroll payroll = getPayrollById(id);

        // Update fields
        payroll.setPayrollDate(payrollDetails.getPayrollDate());
        payroll.setOvertimeHours(payrollDetails.getOvertimeHours());
        payroll.setOvertimeRate(payrollDetails.getOvertimeRate());

        // Recalculate payroll
        payroll.calculatePayroll();

        return payrollRepository.save(payroll);
    }

    public void deletePayroll(Long id) {
        Payroll payroll = getPayrollById(id);
        payrollRepository.delete(payroll);
    }

    public Payroll generatePayrollForEmployee(Long employeeId, LocalDate payrollDate) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + employeeId));

        Payroll payroll = new Payroll(employee, payrollDate);

        // Default overtime rate (1.25 times the hourly rate for regular overtime)
        float hourlyRate = employee.getBaseSalary() / (22 * 8); // Assuming 22 working days and 8 hours per day
        payroll.setOvertimeRate(hourlyRate * 1.25f);

        // Calculate overtime from time logs if available
        if (employee.getTimeLogs() != null && !employee.getTimeLogs().isEmpty()) {
            calculateOvertimeFromTimeLogs(payroll, employee.getTimeLogs());
        }

        // Calculate final payroll
        payroll.calculatePayroll();

        return payrollRepository.save(payroll);
    }

    private void calculateOvertimeFromTimeLogs(Payroll payroll, List<TimeLog> timeLogs) {

        float totalOvertimeHours = 0;

        for (TimeLog log : timeLogs) {
            // Check if there's overtime (assuming regular work day is 8 hours)
            LocalDateTime timeIn = log.getTimeIn();
            LocalDateTime timeOut = log.getTimeOut();

            if (timeIn != null && timeOut != null) {
                Duration duration = Duration.between(timeIn, timeOut);
                double hoursWorked = duration.toMinutes() / 60.0;

                // If worked more than 8 hours, add to overtime
                if (hoursWorked > 8) {
                    totalOvertimeHours += hoursWorked - 8;
                }
            }
        }

        payroll.setOvertimeHours(totalOvertimeHours);
    }

    public Payroll generatePayrollForCurrentPeriod(Long employeeId) {
        // Get current date for payroll
        LocalDate currentDate = LocalDate.now();
        return generatePayrollForEmployee(employeeId, currentDate);
    }
}