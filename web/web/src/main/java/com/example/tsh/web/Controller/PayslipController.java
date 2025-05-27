package com.example.tsh.web.Controller;

import com.example.tsh.web.Entity.Employee;
import com.example.tsh.web.Entity.Payslip;
import com.example.tsh.web.Repository.EmployeeRepo;
import com.example.tsh.web.Service.EmployeeService;
import com.example.tsh.web.Service.PayslipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
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

    private final EmployeeRepo employeeRepo;

    @Autowired
    public PayslipController(PayslipService payslipService, EmployeeRepo employeeRepo) {
        this.payslipService = payslipService;
        this.employeeRepo = employeeRepo;
    }

   //gen payslip
    @PostMapping("/generate/{payrollId}")

    public ResponseEntity<Payslip> generatePayslip(@PathVariable Long payrollId) {
        LOGGER.info("Generating payslip for payroll ID: " + payrollId);
        Payslip payslip = payslipService.generatePayslip(payrollId);
        return ResponseEntity.ok(payslip);
    }


    @PutMapping("/{payslipId}/send")
    public ResponseEntity<Payslip> sendPayslipToEmployee(@PathVariable Long payslipId) {
        LOGGER.info("Marking payslip ID " + payslipId + " as sent");
        Payslip payslip = payslipService.markPayslipAsSent(payslipId);
        return ResponseEntity.ok(payslip);
    }

    //dl payslip
    @GetMapping("/{payslipId}/download")
    public ResponseEntity<ByteArrayResource> downloadPayslip(@PathVariable Long payslipId) {
        LOGGER.info("Downloading payslip ID: " + payslipId);
        Payslip payslip = payslipService.getPayslipById(payslipId);

        payslipService.markPayslipAsDownloaded(payslipId);

        ByteArrayResource resource = new ByteArrayResource(payslip.getFileContent());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + payslip.getPayslipFileName())
                .contentLength(payslip.getFileContent().length)
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }

   //get all payslip para hr
    @GetMapping
    public ResponseEntity<List<Payslip>> getAllPayslips() {
        List<Payslip> payslips = payslipService.getAllPayslips();
        return ResponseEntity.ok(payslips);
    }

    //get payslip Id
    @GetMapping("/{id}")
    public ResponseEntity<Payslip> getPayslipById(@PathVariable Long id) {
        Payslip payslip = payslipService.getPayslipById(id);
        return ResponseEntity.ok(payslip);
    }

   //get payslip empId
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Payslip>> getPayslipsByEmployeeId(@PathVariable Long employeeId) {
        List<Payslip> payslips = payslipService.getPayslipsByEmployeeId(employeeId);
        return ResponseEntity.ok(payslips);
    }


    @GetMapping("/payroll/{payrollId}")
    public ResponseEntity<List<Payslip>> getPayslipsByPayrollId(@PathVariable Long payrollId) {
        List<Payslip> payslips = payslipService.getPayslipsByPayrollId(payrollId);
        return ResponseEntity.ok(payslips);
    }

   //delete payslip
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

    @GetMapping("/my-payslips")
    public ResponseEntity<List<Payslip>> getLoggedInEmployeePayslips(Authentication authentication) {
        String username = authentication.getName();

        Employee employee = employeeRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Employee not found with username: " + username));

        Long employeeId = employee.getEmployeeId();
        List<Payslip> payslips = payslipService.getPayslipsByEmployeeId(employeeId);
        return ResponseEntity.ok(payslips);
    }
}