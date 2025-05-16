package com.example.tsh.web.Controller;

import com.example.tsh.web.Entity.Payroll;
import com.example.tsh.web.Service.PayrollService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payrolls")
@CrossOrigin(origins = "http://localhost:5173")
public class PayrollController {

    private final PayrollService payrollService;

    @Autowired
    public PayrollController(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    @GetMapping
    public ResponseEntity<List<Payroll>> getAllPayrolls() {
        List<Payroll> payrolls = payrollService.getAllPayrolls();
        return new ResponseEntity<>(payrolls, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Payroll> getPayrollById(@PathVariable Long id) {
        try {
            Payroll payroll = payrollService.getPayrollById(id);
            return new ResponseEntity<>(payroll, HttpStatus.OK);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Payroll>> getPayrollsByEmployeeId(@PathVariable Long employeeId) {
        List<Payroll> payrolls = payrollService.getPayrollsByEmployeeId(employeeId);
        return new ResponseEntity<>(payrolls, HttpStatus.OK);
    }

    @GetMapping("/dateRange")
    public ResponseEntity<List<Payroll>> getPayrollsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<Payroll> payrolls = payrollService.getPayrollsByDateRange(startDate, endDate);
        return new ResponseEntity<>(payrolls, HttpStatus.OK);
    }

    @GetMapping("/employee/{employeeId}/dateRange")
    public ResponseEntity<List<Payroll>> getPayrollsByEmployeeAndDateRange(
            @PathVariable Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<Payroll> payrolls = payrollService.getPayrollsByEmployeeAndDateRange(employeeId, startDate, endDate);
        return new ResponseEntity<>(payrolls, HttpStatus.OK);
    }

    @PostMapping("/create/{employeeId}")
    public ResponseEntity<Payroll> createPayroll(@PathVariable Long employeeId, @RequestBody Payroll payroll) {
        try {
            Payroll newPayroll = payrollService.createPayroll(employeeId, payroll);
            return new ResponseEntity<>(newPayroll, HttpStatus.CREATED);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Payroll> updatePayroll(@PathVariable Long id, @RequestBody Payroll payrollDetails) {
        try {
            Payroll updatedPayroll = payrollService.updatePayroll(id, payrollDetails);
            return new ResponseEntity<>(updatedPayroll, HttpStatus.OK);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayroll(@PathVariable Long id) {
        try {
            payrollService.deletePayroll(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/generate/{employeeId}")
    public ResponseEntity<Payroll> generatePayrollForEmployee(
            @PathVariable Long employeeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate payrollDate) {
        try {
            Payroll payroll;
            if (payrollDate != null) {
                payroll = payrollService.generatePayrollForEmployee(employeeId, payrollDate);
            } else {
                payroll = payrollService.generatePayrollForCurrentPeriod(employeeId);
            }
            return new ResponseEntity<>(payroll, HttpStatus.OK);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/generate/bulk")
    public ResponseEntity<List<Payroll>> generatePayrollForAllEmployees(
            @RequestBody Map<String, Object> request) {
        // Implementation for bulk payroll generation
        // This would be implemented in the service layer
        return new ResponseEntity<>(HttpStatus.NOT_IMPLEMENTED);
    }

    @GetMapping("/test")
    public String test(){
        return "Hello";
    }
}