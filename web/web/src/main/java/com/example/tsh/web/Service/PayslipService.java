package com.example.tsh.web.Service;

import com.example.tsh.web.Entity.Employee;
import com.example.tsh.web.Entity.Payroll;
import com.example.tsh.web.Entity.Payslip;
import com.example.tsh.web.Repository.EmployeeRepo;
import com.example.tsh.web.Repository.PayrollRepository;
import com.example.tsh.web.Repository.PayslipRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.FontFactory;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.awt.Color;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Logger;

@Service
public class PayslipService {
    private static final Logger LOGGER = Logger.getLogger(PayslipService.class.getName());

    private final PayslipRepository payslipRepository;
    private final PayrollRepository payrollRepository;
    private final EmployeeRepo employeeRepository;

    @Autowired
    public PayslipService(PayslipRepository payslipRepository,
                          PayrollRepository payrollRepository,
                          EmployeeRepo employeeRepository) {
        this.payslipRepository = payslipRepository;
        this.payrollRepository = payrollRepository;
        this.employeeRepository = employeeRepository;
    }

    /**
     * Generate a payslip for a specific payroll
     */
    public Payslip generatePayslip(Long payrollId) {
        LOGGER.info("Generating payslip for payroll ID: " + payrollId);

        // Get the payroll
        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new EntityNotFoundException("Payroll not found with ID: " + payrollId));

        // Get the employee from the payroll
        Employee employee = payroll.getEmployee();
        if (employee == null) {
            throw new EntityNotFoundException("Employee not found in payroll with ID: " + payrollId);
        }

        // Check if payslip already exists
        Optional<Payslip> existingPayslip = payslipRepository.findByPayrollPayrollIdAndEmployeeEmployeeId(
                payrollId, employee.getEmployeeId());

        if (existingPayslip.isPresent()) {
            LOGGER.info("Payslip already exists for payroll ID: " + payrollId);
            return existingPayslip.get();
        }

        // Create new payslip
        Payslip payslip = new Payslip();
        payslip.setPayroll(payroll);
        payslip.setEmployee(employee);
        payslip.setGeneratedDate(LocalDate.now());
        payslip.setStatus("GENERATED");

        // Create filename
        String fileName = createPayslipFileName(employee, payroll);
        payslip.setPayslipFileName(fileName);

        // Generate payslip PDF content
        byte[] pdfContent = generatePayslipPDF(payroll, employee);
        payslip.setFileContent(pdfContent);

        // Save and return
        return payslipRepository.save(payslip);
    }

    /**
     * Mark payslip as sent to employee
     */
    public Payslip markPayslipAsSent(Long payslipId) {
        Payslip payslip = payslipRepository.findById(payslipId)
                .orElseThrow(() -> new EntityNotFoundException("Payslip not found with ID: " + payslipId));

        payslip.setSentDateTime(LocalDateTime.now());
        payslip.setStatus("SENT");

        return payslipRepository.save(payslip);
    }

    /**
     * Mark payslip as downloaded by employee
     */
    public Payslip markPayslipAsDownloaded(Long payslipId) {
        Payslip payslip = payslipRepository.findById(payslipId)
                .orElseThrow(() -> new EntityNotFoundException("Payslip not found with ID: " + payslipId));

        payslip.setDownloadedDateTime(LocalDateTime.now());
        payslip.setDownloaded(true);
        payslip.setStatus("DOWNLOADED");

        return payslipRepository.save(payslip);
    }

    /**
     * Create standardized payslip file name
     */
    private String createPayslipFileName(Employee employee, Payroll payroll) {
        LocalDate payDate = payroll.getPayrollDate();
        String employeeId = String.valueOf(employee.getEmployeeId());
        String lastName = employee.getLastName().replaceAll("\\s+", "");

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
        String dateStr = payDate.format(formatter);

        return "Payslip_" + dateStr + "_" + employeeId + "_" + lastName + ".pdf";
    }

    /**
     * Generate payslip PDF content using iText
     */
    private byte[] generatePayslipPDF(Payroll payroll, Employee employee) {
        try {
            // Prepare payslip data
            Map<String, Object> data = preparePayslipData(payroll, employee);

            // Create PDF document
            Document document = new Document();
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            PdfWriter.getInstance(document, outputStream);

            document.open();

            // Add company header
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Paragraph companyName = new Paragraph(data.get("companyName").toString(), headerFont);
            companyName.setAlignment(Element.ALIGN_CENTER);
            document.add(companyName);

            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Paragraph companyAddress = new Paragraph(data.get("companyAddress").toString(), normalFont);
            companyAddress.setAlignment(Element.ALIGN_CENTER);
            document.add(companyAddress);

            Paragraph companyContact = new Paragraph("Phone: " + data.get("companyPhone") + " | Email: " + data.get("companyEmail"), normalFont);
            companyContact.setAlignment(Element.ALIGN_CENTER);
            document.add(companyContact);

            // Add payslip title
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
            Paragraph title = new Paragraph("PAYSLIP", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingBefore(15);
            title.setSpacingAfter(15);
            document.add(title);

            // Add employee info section
            PdfPTable employeeTable = new PdfPTable(2);
            employeeTable.setWidthPercentage(100);

            addTableCell(employeeTable, "Employee ID:", normalFont);
            addTableCell(employeeTable, data.get("employeeId").toString(), normalFont);

            addTableCell(employeeTable, "Employee Name:", normalFont);
            addTableCell(employeeTable, data.get("employeeName").toString(), normalFont);

            addTableCell(employeeTable, "Position:", normalFont);
            addTableCell(employeeTable, data.get("employeePosition").toString(), normalFont);

//            addTableCell(employeeTable, "Department:", normalFont);
//            addTableCell(employeeTable, data.get("employeeDepartment").toString(), normalFont);

            document.add(employeeTable);

            // Add payroll period info
            PdfPTable periodTable = new PdfPTable(2);
            periodTable.setWidthPercentage(100);
            periodTable.setSpacingBefore(10);

            addTableCell(periodTable, "Pay Date:", normalFont);
            addTableCell(periodTable, data.get("payrollDate").toString(), normalFont);

            addTableCell(periodTable, "Pay Period:", normalFont);
            addTableCell(periodTable, data.get("payPeriodStart") + " to " + data.get("payPeriodEnd"), normalFont);

            document.add(periodTable);

            // Section title for earnings
            Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Paragraph earningsTitle = new Paragraph("EARNINGS", sectionFont);
            earningsTitle.setSpacingBefore(15);
            earningsTitle.setSpacingAfter(5);
            document.add(earningsTitle);

            // Earnings table
            PdfPTable earningsTable = new PdfPTable(2);
            earningsTable.setWidthPercentage(100);

            addTableCell(earningsTable, "Base Salary:", normalFont);
            addTableCell(earningsTable, data.get("baseSalary").toString(), normalFont);

//            addTableCell(earningsTable, "Regular Holiday Pay:", normalFont);
//            addTableCell(earningsTable, data.get("regularHolidayPay").toString(), normalFont);
//
//            addTableCell(earningsTable, "Special Holiday Pay:", normalFont);
//            addTableCell(earningsTable, data.get("specialHolidayPay").toString(), normalFont);

            addTableCell(earningsTable, "Overtime Pay (" + data.get("overtimeHours") + " hrs @ " + data.get("overtimeRate") + "):", normalFont);
            addTableCell(earningsTable, data.get("overtimePay").toString(), normalFont);

            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            addTableCell(earningsTable, "GROSS INCOME:", boldFont);
            addTableCell(earningsTable, data.get("grossIncome").toString(), boldFont);

            document.add(earningsTable);

            // Section title for deductions
            Paragraph deductionsTitle = new Paragraph("DEDUCTIONS", sectionFont);
            deductionsTitle.setSpacingBefore(15);
            deductionsTitle.setSpacingAfter(5);
            document.add(deductionsTitle);

            // Deductions table
            PdfPTable deductionsTable = new PdfPTable(2);
            deductionsTable.setWidthPercentage(100);

            addTableCell(deductionsTable, "SSS Contribution:", normalFont);
            addTableCell(deductionsTable, data.get("sssContribution").toString(), normalFont);

            addTableCell(deductionsTable, "PhilHealth Contribution:", normalFont);
            addTableCell(deductionsTable, data.get("philhealthContribution").toString(), normalFont);

            addTableCell(deductionsTable, "Pag-IBIG Contribution:", normalFont);
            addTableCell(deductionsTable, data.get("pagibigContribution").toString(), normalFont);

//            addTableCell(deductionsTable, "Income Tax:", normalFont);
//            addTableCell(deductionsTable, data.get("incomeTax").toString(), normalFont);

            addTableCell(deductionsTable, "Absence Deduction (" + data.get("absenceDays") + " days):", normalFont);
            addTableCell(deductionsTable, data.get("absenceDeduction").toString(), normalFont);

            addTableCell(deductionsTable, "TOTAL DEDUCTIONS:", boldFont);
            addTableCell(deductionsTable, data.get("totalDeductions").toString(), boldFont);

            document.add(deductionsTable);

            // Net income
            PdfPTable summaryTable = new PdfPTable(2);
            summaryTable.setWidthPercentage(100);
            summaryTable.setSpacingBefore(15);

            Font netIncomeFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            addTableCell(summaryTable, "NET INCOME:", netIncomeFont);
            addTableCell(summaryTable, data.get("netIncome").toString(), netIncomeFont);

            document.add(summaryTable);

            // Footer
            Paragraph footer = new Paragraph("This is an electronically generated payslip and does not require signature.", normalFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(30);
            document.add(footer);

            document.close();
            return outputStream.toByteArray();

        } catch (Exception e) {
            LOGGER.severe("Unexpected error during PDF generation: " + e.getMessage());
            throw new RuntimeException("Failed to generate payslip PDF", e);
        }

    }

    /**
     * Helper method to add cells to PDF table
     */
    private void addTableCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(5);
        cell.setBorderWidth(0.5f);
        table.addCell(cell);
    }

    /**
     * Prepare data for payslip template
     */
    private Map<String, Object> preparePayslipData(Payroll payroll, Employee employee) {
        Map<String, Object> data = new HashMap<>();

        // Company information
        data.put("companyName", "Your Company Name");
        data.put("companyAddress", "Company Address, City, Country");
        data.put("companyPhone", "+123 456 7890");
        data.put("companyEmail", "hr@yourcompany.com");

        // Employee information
        data.put("employeeId", employee.getEmployeeId());
        data.put("employeeName", employee.getFirstName() + " " + employee.getLastName());
        data.put("employeePosition", employee.getPosition());


        // Payroll period
        LocalDate payDate = payroll.getPayrollDate();
        data.put("payrollDate", payDate.format(DateTimeFormatter.ofPattern("dd MMM yyyy")));

        // Determine pay period
        LocalDate startDate, endDate;
        if (payDate.getDayOfMonth() <= 15) {
            startDate = payDate.withDayOfMonth(1);
            endDate = payDate.withDayOfMonth(15);
        } else {
            startDate = payDate.withDayOfMonth(16);
            endDate = payDate.withDayOfMonth(payDate.lengthOfMonth());
        }

        data.put("payPeriodStart", startDate.format(DateTimeFormatter.ofPattern("dd MMM yyyy")));
        data.put("payPeriodEnd", endDate.format(DateTimeFormatter.ofPattern("dd MMM yyyy")));

        // Earnings
        data.put("baseSalary", formatCurrency(payroll.getBaseSalary()));
        data.put("regularHolidayPay", formatCurrency(payroll.getRegularHolidayPay()));
        data.put("specialHolidayPay", formatCurrency(payroll.getSpecialHolidayPay()));
        data.put("overtimePay", formatCurrency(payroll.getOvertimePay()));
        data.put("overtimeHours", payroll.getOvertimeHours());
        data.put("overtimeRate", formatCurrency(payroll.getOvertimeRate()));
        data.put("grossIncome", formatCurrency(payroll.getGrossIncome()));

        // Deductions
        data.put("sssContribution", formatCurrency(payroll.getSssContribution()));
        data.put("philhealthContribution", formatCurrency(payroll.getPhilhealthContribution()));
        data.put("pagibigContribution", formatCurrency(payroll.getPagibigContribution()));
        data.put("incomeTax", formatCurrency(payroll.getIncomeTax()));
        data.put("absenceDays", payroll.getAbsenceDays());
        data.put("absenceDeduction", formatCurrency(payroll.getAbsenceDeduction()));
        data.put("totalDeductions", formatCurrency(payroll.getTotalDeductions()));

        // Summary
        data.put("netIncome", formatCurrency(payroll.getNetIncome()));

        return data;
    }

    /**
     * Format currency values
     */
    private String formatCurrency(float amount) {
        return String.format("₱ %.2f", amount);
    }

    /**
     * Get all payslips
     */
    public List<Payslip> getAllPayslips() {
        return payslipRepository.findAll();
    }

    /**
     * Get payslip by ID
     */
    public Payslip getPayslipById(Long id) {
        return payslipRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Payslip not found with ID: " + id));
    }

    /**
     * Get payslips by employee ID
     */
    public List<Payslip> getPayslipsByEmployeeId(Long employeeId) {
        return payslipRepository.findByEmployeeEmployeeId(employeeId);
    }

    /**
     * Get payslips by payroll ID
     */
    public List<Payslip> getPayslipsByPayrollId(Long payrollId) {
        return payslipRepository.findByPayrollPayrollId(payrollId);
    }

    /**
     * Delete payslip
     */
    public void deletePayslip(Long id) {
        Payslip payslip = getPayslipById(id);
        payslipRepository.delete(payslip);
    }
}