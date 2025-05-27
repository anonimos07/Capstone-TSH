package com.example.tsh.web.DTO;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
public class PayrollDTO {
    private Long payrollId;
    private Long employeeId;
    private String employeeFirstName;
    private String employeeLastName;
    private String employeePosition;
    private LocalDate payrollDate;
    private float baseSalary;
    private float regularHolidayPay;
    private float specialHolidayPay;
    private float overtimeHours;
    private float overtimeRate;
    private float overtimePay;
    private int absenceDays;
    private float absenceDeduction;
    private float partialIncome;
    private float sssContribution;
    private float philhealthContribution;
    private float pagibigContribution;
    private float incomeTax;
    private float totalDeductions;
    private float grossIncome;
    private float netIncome;


}