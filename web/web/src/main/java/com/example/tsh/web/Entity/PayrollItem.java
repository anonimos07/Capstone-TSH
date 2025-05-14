//package com.example.tsh.web.Entity;
//
//import jakarta.persistence.*;
//import lombok.Getter;
//import lombok.Setter;
//
//@Getter
//@Setter
//@Entity
//public class PayrollItem {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @ManyToOne
//    private Employee employee;
//
//    private double baseSalary;
//
//    // Make these fields nullable by using wrapper classes instead of primitives
//    private Integer daysWorked;          // Number of days the employee worked
//    private Double overtimeHours;        // Total overtime hours
//    private Double overtimeRate;         // Hourly rate for overtime
//    private Double overtimePay;          // Total overtime pay
//    private double grossPay;             // Base pay + overtime pay
//    private double tax;                  // Tax deductions
//    private double netPay;               // Gross pay - tax deductions
//    private Double cashAdvance;          // Any cash advances taken
//    private Double totalDeductions;      // Sum of all deductions
//
//}