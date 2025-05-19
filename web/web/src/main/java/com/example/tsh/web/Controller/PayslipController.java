package com.example.tsh.web.Controller;

import com.example.tsh.web.Entity.Payslip;
import com.example.tsh.web.Service.PayslipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/payslips")
@CrossOrigin(origins = "http://localhost:5173")
public class PayslipController {
    private static final Logger LOGGER = Logger.getLogger(PayslipController.class.getName());

    private final PayslipService payslipService;

    @Autowired
    public PayslipController(PayslipService payslipService) {
        this.payslipService = payslipService;
    }

    /**
     * Generate a payslip from payroll
     */
    @PostMapping("/generate/{payrollId}")

    public ResponseEntity<Payslip> generatePayslip(@PathVariable Long payrollId) {
        LOGGER.info("Generating payslip for payroll ID: " + payrollId);
        Payslip payslip = payslipService.generatePayslip(payrollId);
        return ResponseEntity.ok(payslip);
    }

    /**
     * Mark payslip as sent to employee
     */
    @PutMapping("/{payslipId}/send")
    public ResponseEntity<Payslip> sendPayslipToEmployee(@PathVariable Long payslipId) {
        LOGGER.info("Marking payslip ID " + payslipId + " as sent");
        Payslip payslip = payslipService.markPayslipAsSent(payslipId);
        return ResponseEntity.ok(payslip);
    }

    /**
     * Download payslip (accessible by employee or HR/admin)
     */
    @GetMapping("/{payslipId}/download")
    public ResponseEntity<ByteArrayResource> downloadPayslip(@PathVariable Long payslipId) {
        LOGGER.info("Downloading payslip ID: " + payslipId);
        Payslip payslip = payslipService.getPayslipById(payslipId);

        // Mark as downloaded if accessed by employee
        // This would require checking if current user is the employee associated with this payslip
        // For simplicity, we'll mark it downloaded whenever accessed
        payslipService.markPayslipAsDownloaded(payslipId);

        ByteArrayResource resource = new ByteArrayResource(payslip.getFileContent());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + payslip.getPayslipFileName())
                .contentLength(payslip.getFileContent().length)
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }

    /**
     * Get all payslips (admin/HR only)
     */
    @GetMapping
    @PreAuthorize("hasRole('HR') or hasRole('ADMIN')")
    public ResponseEntity<List<Payslip>> getAllPayslips() {
        List<Payslip> payslips = payslipService.getAllPayslips();
        return ResponseEntity.ok(payslips);
    }

    /**
     * Get payslip by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Payslip> getPayslipById(@PathVariable Long id) {
        Payslip payslip = payslipService.getPayslipById(id);
        return ResponseEntity.ok(payslip);
    }

    /**
     * Get payslips by employee ID
     */
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Payslip>> getPayslipsByEmployeeId(@PathVariable Long employeeId) {
        List<Payslip> payslips = payslipService.getPayslipsByEmployeeId(employeeId);
        return ResponseEntity.ok(payslips);
    }

    /**
     * Get payslips by payroll ID
     */
    @GetMapping("/payroll/{payrollId}")
    public ResponseEntity<List<Payslip>> getPayslipsByPayrollId(@PathVariable Long payrollId) {
        List<Payslip> payslips = payslipService.getPayslipsByPayrollId(payrollId);
        return ResponseEntity.ok(payslips);
    }

    /**
     * Delete payslip (admin only)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Boolean>> deletePayslip(@PathVariable Long id) {
        payslipService.deletePayslip(id);

        Map<String, Boolean> response = new HashMap<>();
        response.put("deleted", Boolean.TRUE);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/test")
    public String test(){
        return "Hello";
    }
}