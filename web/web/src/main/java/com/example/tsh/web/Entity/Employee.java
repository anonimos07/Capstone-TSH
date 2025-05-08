package com.example.tsh.web.Entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
    import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
    import com.fasterxml.jackson.annotation.JsonManagedReference;
    import jakarta.persistence.*;
    import lombok.Getter;
    import lombok.Setter;

@Setter
@Getter
@Entity
@Table(name = "employee")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long employeeId;

    public String username;
    public String password;
    public String email;
    public String firstName;
    public String lastName;
    public String contact;
    public String position;
    public float baseSalary;

    @Column(nullable = false, columnDefinition = "float default 0")
    private float regularHolidayPay;

    @Column(nullable = false, columnDefinition = "float default 0")
    private float specialHolidayPay;

    @Column(nullable = false, columnDefinition = "int default 0")
    private int absenceDays;
        @JsonIgnoreProperties("employee")
        @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, orphanRemoval = true)
        private List<TimeLog> timeLogs;

    @Transient  // This won't be persisted in DB, will be calculated when needed
    private float grossIncome;

    @Transient  // This won't be persisted in DB, will be calculated when needed
    private float netIncome;

    @Enumerated(EnumType.STRING)
    private Role role = Role.EMPLOYEE;

    @JsonManagedReference
    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TimeLog> timeLogs;

    public Employee(String username, String password, String email, String firstName,
                    String lastName, String contact, String position, float baseSalary) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.contact = contact;
        this.position = position;
        this.baseSalary = baseSalary;
        this.role = Role.EMPLOYEE;
        this.regularHolidayPay = 0;
        this.specialHolidayPay = 0;
        this.absenceDays = 0;
    }

    public Employee() {
        this.role = Role.EMPLOYEE;
        this.regularHolidayPay = 0;
        this.specialHolidayPay = 0;
        this.absenceDays = 0;
    }

    // Calculate gross income based on base salary, holiday pays, and absence deductions
    public float getGrossIncome() {
        float dailyRate = this.baseSalary / 22; // Assuming 22 working days per month
        float absenceDeduction = this.absenceDays * dailyRate;
        return this.baseSalary + this.regularHolidayPay + this.specialHolidayPay - absenceDeduction;
    }

    // Calculate net income after tax deductions
    public float getNetIncome() {
        float gross = getGrossIncome();
        // Simple tax calculation - replace with your actual tax logic
        float tax = gross * 0.15f; // Assuming 15% tax
        return gross - tax;
    }

    public List<TimeLog> getTimeLogs() {
        return timeLogs;
    }

    public void setTimeLogs(List<TimeLog> timeLogs) {
        this.timeLogs = timeLogs;
    }
}