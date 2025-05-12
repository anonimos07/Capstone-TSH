package com.example.tsh.web.DTO;

import com.example.tsh.web.Entity.Payroll;
import lombok.Getter;
import lombok.Setter;


@Setter
@Getter
public class PayrollDetails {
    private Payroll payroll;
    private double totalGross;
    private double totalNet;
    private double totalTax;
    private int employeeCount;

}