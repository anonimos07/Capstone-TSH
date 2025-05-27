package com.example.tsh.web.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.util.logging.Logger;

@Setter
@Getter
@Entity
@Table(name = "payroll")
public class Payroll {
    private static final Logger LOGGER = Logger.getLogger(Payroll.class.getName());

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long payrollId;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    @JsonBackReference
    private Employee employee;

    //newly added para sa sdd nga erd
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hr_id") // optional but recommended for tracking
    private HR hr;

    private LocalDate payrollDate;

    private float baseSalary;        // This is the prorated salary based on present days
    private float regularHolidayPay;
    private float specialHolidayPay;
    private float overtimeHours;
    private float overtimeRate;
    private float overtimePay;
    private int absenceDays;
    private float absenceDeduction;  // New explicit field for absence deduction

    // Philippine-specific statutory deductions
    private float sssContribution;
    private float philhealthContribution;
    private float pagibigContribution;
    private float incomeTax;
    private float totalDeductions;
    private float grossIncome;
    private float netIncome;

    public Payroll() {
        // Initialize with default values to prevent NullPointerExceptions
        this.baseSalary = 0f;
        this.regularHolidayPay = 0f;
        this.specialHolidayPay = 0f;
        this.overtimeHours = 0f;
        this.overtimeRate = 0f;
        this.overtimePay = 0f;
        this.absenceDays = 0;
        this.absenceDeduction = 0f;
        this.grossIncome = 0f;
        this.netIncome = 0f;
    }

    public void calculatePayroll() {
        LOGGER.info("Starting payroll calculation");
        LOGGER.info("Base salary (already prorated): " + this.baseSalary);
        LOGGER.info("Overtime hours: " + this.overtimeHours);
        LOGGER.info("Overtime rate: " + this.overtimeRate);

        // Calculate gross income (prorated base salary + holiday pay + overtime pay)
        // Note: Absence deduction is already factored into the prorated base salary
        this.grossIncome = this.baseSalary +
                this.regularHolidayPay +
                this.specialHolidayPay +
                this.overtimePay;

        LOGGER.info("Calculated gross income: " + this.grossIncome);

        // Calculate deductions
        calculatePhilippineDeductions();
        LOGGER.info("Total deductions: " + this.totalDeductions);

        // Calculate net income
        this.netIncome = this.grossIncome - this.totalDeductions;
        LOGGER.info("Calculated net income: " + this.netIncome);
    }

    private void calculatePhilippineDeductions() {
        // SSS Contribution (based on 2023 contribution table)
        if (this.grossIncome <= 3250) {
            this.sssContribution = 135.0f;
        } else if (this.grossIncome <= 24750) {
            this.sssContribution = 1125.0f;
        } else {
            this.sssContribution = 1350.0f; // Maximum SSS contribution
        }
        LOGGER.info("SSS contribution: " + this.sssContribution);

        // PhilHealth Contribution (based on 2023 rates - 4% of monthly basic salary)
        float philhealthRate = 0.04f;
        this.philhealthContribution = Math.min(3200.0f, Math.max(400.0f, this.grossIncome * philhealthRate));
        LOGGER.info("PhilHealth contribution: " + this.philhealthContribution);

        // Pag-IBIG Contribution (standard 2% for most salary ranges)
        this.pagibigContribution = Math.min(100.0f, this.grossIncome * 0.02f);
        LOGGER.info("Pag-IBIG contribution: " + this.pagibigContribution);

        // Income Tax
        calculateIncomeTax();
        LOGGER.info("Income tax: " + this.incomeTax);

        // Total deductions
        this.totalDeductions = this.sssContribution + this.philhealthContribution +
                this.pagibigContribution + this.incomeTax;
    }

    private void calculateIncomeTax() {
        // Monthly taxable income (gross less SSS, PhilHealth, Pag-IBIG)
        float taxableIncome = this.grossIncome - (this.sssContribution +
                this.philhealthContribution + this.pagibigContribution);
        LOGGER.info("Taxable income: " + taxableIncome);

        // 2023 Philippine Income Tax Table (Monthly)
        if (taxableIncome <= 20833) {
            this.incomeTax = 0; // 0%
        } else if (taxableIncome <= 33332) {
            this.incomeTax = (taxableIncome - 20833) * 0.15f; // 15% of excess over 20,833
        } else if (taxableIncome <= 66666) {
            this.incomeTax = 1875 + (taxableIncome - 33333) * 0.20f; // 1,875 + 20% of excess over 33,333
        } else if (taxableIncome <= 166666) {
            this.incomeTax = 8541.8f + (taxableIncome - 66667) * 0.25f; // 8,541.8 + 25% of excess over 66,667
        } else if (taxableIncome <= 666666) {
            this.incomeTax = 33541.8f + (taxableIncome - 166667) * 0.30f; // 33,541.8 + 30% of excess over 166,667
        } else {
            this.incomeTax = 183541.8f + (taxableIncome - 666667) * 0.35f; // 183,541.8 + 35% of excess over 666,667
        }
    }

    @Override
    public String toString() {
        return "Payroll{" +
                "payrollId=" + payrollId +
                ", employee=" + (employee != null ? employee.getEmployeeId() : "null") +
                ", payrollDate=" + payrollDate +
                ", baseSalary=" + baseSalary +
                ", overtimeHours=" + overtimeHours +
                ", overtimeRate=" + overtimeRate +
                ", overtimePay=" + overtimePay +
                ", absenceDays=" + absenceDays +
                ", absenceDeduction=" + absenceDeduction +
                ", grossIncome=" + grossIncome +
                ", netIncome=" + netIncome +
                '}';
    }
}