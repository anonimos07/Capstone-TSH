package com.example.tsh.web.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class PayrollItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Employee employee;

    private double baseSalary;
    private double grossPay;
    private double netPay;
    private double tax;

    // getters and setters
}
