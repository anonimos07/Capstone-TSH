package com.example.tsh.web.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Setter
@Getter
@Entity
@Table(name = "payroll")
public class Payroll {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long payrollId;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

//    @Column(nullable = false)
    private LocalDate payrollDate;

//    @Column(nullable = false)
    private float baseSalary;

//    @Column(nullable = false, columnDefinition = "float default 0")
    private float regularHolidayPay;

//    @Column(nullable = false, columnDefinition = "float default 0")
    private float specialHolidayPay;

//    @Column(nullable = false, columnDefinition = "float default 0")
    private float overtimeHours;

//    @Column(nullable = false, columnDefinition = "float default 0")
    private float overtimeRate;

//    @Column(nullable = false, columnDefinition = "float default 0")
    private float overtimePay;

//    @Column(nullable = false, columnDefinition = "int default 0")
    private int absenceDays;

//    @Column(nullable = false, columnDefinition = "float default 0")
    private float absenceDeduction;

//    @Column(nullable = false, columnDefinition = "float default 0")
    private float partialIncome;

    // Philippine-specific statutory deductions
//    @Column(nullable = false, columnDefinition = "float default 0")
    private float sssContribution;

//    @Column(nullable = false, columnDefinition = "float default 0")
    private float philhealthContribution;

//    @Column(nullable = false, columnDefinition = "float default 0")
    private float pagibigContribution;

//    @Column(nullable = false, columnDefinition = "float default 0")
    private float incomeTax;

//    @Column(nullable = false, columnDefinition = "float default 0")
    private float totalDeductions;

//    @Column(nullable = false, columnDefinition = "float default 0")
    private float grossIncome;

//    @Column(nullable = false, columnDefinition = "float default 0")
    private float netIncome;

    public Payroll() {
    }

    public Payroll(Employee employee, LocalDate payrollDate) {
        this.employee = employee;
        this.payrollDate = payrollDate;
        this.baseSalary = employee.getBaseSalary();
        this.regularHolidayPay = employee.getRegularHolidayPay();
        this.specialHolidayPay = employee.getSpecialHolidayPay();
        this.absenceDays = employee.getAbsenceDays();
        calculatePayroll();
    }

    public void calculatePayroll() {
        // Calculate overtime pay
        this.overtimePay = overtimeHours * overtimeRate;

        // Calculate absence deduction (based on working days in a month, typically 22)
        float dailyRate = baseSalary / 22;
        this.absenceDeduction = absenceDays * dailyRate;

        // Calculate partial income (base salary adjusted for absences)
        this.partialIncome = baseSalary - absenceDeduction;

        // Calculate gross income
        this.grossIncome = partialIncome + regularHolidayPay + specialHolidayPay + overtimePay;

        // Calculate Philippine statutory contributions
        calculatePhilippineDeductions();

        // Calculate net income
        this.netIncome = grossIncome - totalDeductions;
    }

    private void calculatePhilippineDeductions() {
        // SSS Contribution (based on 2023 contribution table)
        // This is a simplified version; in production, implement the complete SSS contribution table
        if (grossIncome <= 3250) {
            this.sssContribution = 135.0f;
        } else if (grossIncome <= 24750) {
            this.sssContribution = 1125.0f;
        } else {
            this.sssContribution = 1350.0f; // Maximum SSS contribution
        }

        // PhilHealth Contribution (based on 2023 rates - 4% of monthly basic salary)
        float philhealthRate = 0.04f;
        this.philhealthContribution = Math.min(3200.0f, Math.max(400.0f, grossIncome * philhealthRate));

        // Pag-IBIG Contribution (standard 2% for most salary ranges)
        this.pagibigContribution = Math.min(100.0f, grossIncome * 0.02f);

        // Income Tax (simplified progressive tax calculation)
        calculateIncomeTax();

        // Total deductions
        this.totalDeductions = sssContribution + philhealthContribution + pagibigContribution + incomeTax;
    }

    private void calculateIncomeTax() {
        // Monthly taxable income (gross less SSS, PhilHealth, Pag-IBIG)
        float taxableIncome = grossIncome - (sssContribution + philhealthContribution + pagibigContribution);

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
}