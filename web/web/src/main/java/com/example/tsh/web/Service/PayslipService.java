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
import org.springframework.transaction.annotation.Transactional;


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

    @Transactional
    public Payslip generatePayslip(Long payrollId) {
        LOGGER.info("Generating payslip for payroll ID: " + payrollId);

        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new EntityNotFoundException("Payroll not found with ID: " + payrollId));

        Employee employee = payroll.getEmployee();
        if (employee == null) {
            throw new EntityNotFoundException("Employee not found in payroll with ID: " + payrollId);
        }

        Optional<Payslip> existingPayslip = payslipRepository.findByPayrollPayrollIdAndEmployeeEmployeeId(
                payrollId, employee.getEmployeeId());

        if (existingPayslip.isPresent()) {
            LOGGER.info("Payslip already exists for payroll ID: " + payrollId);
            return existingPayslip.get();
        }

        Payslip payslip = new Payslip();
        payslip.setPayroll(payroll);
        payslip.setEmployee(employee);
        payslip.setGeneratedDate(LocalDate.now());
        payslip.setStatus("GENERATED");

        String fileName = createPayslipFileName(employee, payroll);
        payslip.setPayslipFileName(fileName);

        byte[] pdfContent = generatePayslipPDF(payroll, employee);
        payslip.setFileContent(pdfContent);

        return payslipRepository.save(payslip);
    }

    @Transactional
    public Payslip markPayslipAsSent(Long payslipId) {
        Payslip payslip = payslipRepository.findById(payslipId)
                .orElseThrow(() -> new EntityNotFoundException("Payslip not found with ID: " + payslipId));

        payslip.setSentDateTime(LocalDateTime.now());
        payslip.setStatus("SENT");

        return payslipRepository.save(payslip);
    }

    @Transactional
    public Payslip markPayslipAsDownloaded(Long payslipId) {
        Payslip payslip = payslipRepository.findById(payslipId)
                .orElseThrow(() -> new EntityNotFoundException("Payslip not found with ID: " + payslipId));

        payslip.setDownloadedDateTime(LocalDateTime.now());
        payslip.setDownloaded(true);
        payslip.setStatus("DOWNLOADED");

        return payslipRepository.save(payslip);
    }

    private String createPayslipFileName(Employee employee, Payroll payroll) {
        LocalDate payDate = payroll.getPayrollDate();
        String employeeId = String.valueOf(employee.getEmployeeId());
        String lastName = employee.getLastName().replaceAll("\\s+", "");

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
        String dateStr = payDate.format(formatter);

        return "Payslip_" + dateStr + "_" + employeeId + "_" + lastName + ".pdf";
    }

    private byte[] generatePayslipPDF(Payroll payroll, Employee employee) {
        try {
            Map<String, Object> data = preparePayslipData(payroll, employee);

            Document document = new Document();
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            PdfWriter.getInstance(document, outputStream);

            document.open();

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

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
            Paragraph title = new Paragraph("PAYSLIP", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingBefore(15);
            title.setSpacingAfter(15);
            document.add(title);

            PdfPTable employeeTable = new PdfPTable(2);
            employeeTable.setWidthPercentage(100);

            addTableCell(employeeTable, "Employee ID:", normalFont);
            addTableCell(employeeTable, data.get("employeeId").toString(), normalFont);

            addTableCell(employeeTable, "Employee Name:", normalFont);
            addTableCell(employeeTable, data.get("employeeName").toString(), normalFont);

            addTableCell(employeeTable, "Position:", normalFont);
            addTableCell(employeeTable, data.get("employeePosition").toString(), normalFont);


            document.add(employeeTable);

            PdfPTable periodTable = new PdfPTable(2);
            periodTable.setWidthPercentage(100);
            periodTable.setSpacingBefore(10);

            addTableCell(periodTable, "Pay Date:", normalFont);
            addTableCell(periodTable, data.get("payrollDate").toString(), normalFont);

            addTableCell(periodTable, "Pay Period:", normalFont);
            addTableCell(periodTable, data.get("payPeriodStart") + " to " + data.get("payPeriodEnd"), normalFont);

            document.add(periodTable);

            Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Paragraph earningsTitle = new Paragraph("EARNINGS", sectionFont);
            earningsTitle.setSpacingBefore(15);
            earningsTitle.setSpacingAfter(5);
            document.add(earningsTitle);

            PdfPTable earningsTable = new PdfPTable(2);
            earningsTable.setWidthPercentage(100);

            addTableCell(earningsTable, "Base Salary:", normalFont);
            addTableCell(earningsTable, data.get("baseSalary").toString(), normalFont);

            addTableCell(earningsTable, "Overtime Pay (" + data.get("overtimeHours") + " hrs @ " + data.get("overtimeRate") + "):", normalFont);
            addTableCell(earningsTable, data.get("overtimePay").toString(), normalFont);

            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            addTableCell(earningsTable, "GROSS INCOME:", boldFont);
            addTableCell(earningsTable, data.get("grossIncome").toString(), boldFont);

            document.add(earningsTable);

            Paragraph deductionsTitle = new Paragraph("DEDUCTIONS", sectionFont);
            deductionsTitle.setSpacingBefore(15);
            deductionsTitle.setSpacingAfter(5);
            document.add(deductionsTitle);

            PdfPTable deductionsTable = new PdfPTable(2);
            deductionsTable.setWidthPercentage(100);

            addTableCell(deductionsTable, "SSS Contribution:", normalFont);
            addTableCell(deductionsTable, data.get("sssContribution").toString(), normalFont);

            addTableCell(deductionsTable, "PhilHealth Contribution:", normalFont);
            addTableCell(deductionsTable, data.get("philhealthContribution").toString(), normalFont);

            addTableCell(deductionsTable, "Pag-IBIG Contribution:", normalFont);
            addTableCell(deductionsTable, data.get("pagibigContribution").toString(), normalFont);


            addTableCell(deductionsTable, "Absence Deduction (" + data.get("absenceDays") + " days):", normalFont);
            addTableCell(deductionsTable, data.get("absenceDeduction").toString(), normalFont);

            addTableCell(deductionsTable, "TOTAL DEDUCTIONS:", boldFont);
            addTableCell(deductionsTable, data.get("totalDeductions").toString(), boldFont);

            document.add(deductionsTable);

            PdfPTable summaryTable = new PdfPTable(2);
            summaryTable.setWidthPercentage(100);
            summaryTable.setSpacingBefore(15);

            Font netIncomeFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            addTableCell(summaryTable, "NET INCOME:", netIncomeFont);
            addTableCell(summaryTable, data.get("netIncome").toString(), netIncomeFont);

            document.add(summaryTable);

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


    private void addTableCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(5);
        cell.setBorderWidth(0.5f);
        table.addCell(cell);
    }

    private Map<String, Object> preparePayslipData(Payroll payroll, Employee employee) {
        Map<String, Object> data = new HashMap<>();

        data.put("companyName", "IDEAL TECH STAFFING PHILIPPINES");
        data.put("companyAddress", "11/F 1Nito Tower, Archbishop Ave, Lahug, Cebu City 6000 Philippines");
        data.put("companyPhone", "+639345919392");
        data.put("companyEmail", "tsh@gmail.com");

        data.put("employeeId", employee.getEmployeeId());
        data.put("employeeName", employee.getFirstName() + " " + employee.getLastName());
        data.put("employeePosition", employee.getPosition());

        LocalDate payDate = payroll.getPayrollDate();
        data.put("payrollDate", payDate.format(DateTimeFormatter.ofPattern("dd MMM yyyy")));

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

        data.put("baseSalary", formatCurrency(payroll.getBaseSalary()));
        data.put("regularHolidayPay", formatCurrency(payroll.getRegularHolidayPay()));
        data.put("specialHolidayPay", formatCurrency(payroll.getSpecialHolidayPay()));
        data.put("overtimePay", formatCurrency(payroll.getOvertimePay()));
        data.put("overtimeHours", payroll.getOvertimeHours());
        data.put("overtimeRate", formatCurrency(payroll.getOvertimeRate()));
        data.put("grossIncome", formatCurrency(payroll.getGrossIncome()));

        data.put("sssContribution", formatCurrency(payroll.getSssContribution()));
        data.put("philhealthContribution", formatCurrency(payroll.getPhilhealthContribution()));
        data.put("pagibigContribution", formatCurrency(payroll.getPagibigContribution()));
        data.put("incomeTax", formatCurrency(payroll.getIncomeTax()));
        data.put("absenceDays", payroll.getAbsenceDays());
        data.put("absenceDeduction", formatCurrency(payroll.getAbsenceDeduction()));
        data.put("totalDeductions", formatCurrency(payroll.getTotalDeductions()));

        data.put("netIncome", formatCurrency(payroll.getNetIncome()));

        return data;
    }


    private String formatCurrency(float amount) {
        return String.format("₱ %.2f", amount);
    }

    public List<Payslip> getAllPayslips() {
        return payslipRepository.findAll();
    }

    public Payslip getPayslipById(Long id) {
        return payslipRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Payslip not found with ID: " + id));
    }

    @Transactional
    public List<Payslip> getPayslipsByEmployeeId(Long employeeId) {
        if (!employeeRepository.existsById(employeeId)) {
            throw new EntityNotFoundException("Employee not found with ID: " + employeeId);
        }

        List<Payslip> payslips = payslipRepository.findPayslipsByEmployeeId(employeeId);

        LOGGER.info("Found " + payslips.size() + " payslips for employee ID: " + employeeId);

        return payslips;
    }

    public List<Payslip> getPayslipsByPayrollId(Long payrollId) {
        return payslipRepository.findByPayrollPayrollId(payrollId);
    }

    @Transactional
    public void deletePayslip(Long id) {
        Payslip payslip = getPayslipById(id);
        payslipRepository.delete(payslip);
    }
}