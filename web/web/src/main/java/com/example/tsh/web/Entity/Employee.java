package com.example.tsh.web.Entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

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

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Payroll> payrolls;

    @Enumerated(EnumType.STRING)
    private Role role = Role.EMPLOYEE;

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


    public float getGrossIncome() {
        float dailyRate = this.baseSalary / 22;
        float absenceDeduction = this.absenceDays * dailyRate;
        return this.baseSalary + this.regularHolidayPay + this.specialHolidayPay - absenceDeduction;
    }


    public float getNetIncome() {
        float gross = getGrossIncome();
        float tax = gross * 0.15f;
        return gross - tax;
    }

    public List<TimeLog> getTimeLogs() {
        return timeLogs;
    }

    public void setTimeLogs(List<TimeLog> timeLogs) {
        this.timeLogs = timeLogs;
    }
}