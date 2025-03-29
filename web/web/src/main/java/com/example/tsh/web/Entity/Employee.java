package com.example.tsh.web.Entity;


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

    public String user;
    public String password;
    public String email;
    public String firstName;
    public String lastName;
    public String contact;
    public String position;
    public float baseSalary;

    @Enumerated(EnumType.STRING)
    private Role role = Role.EMPLOYEE;

    public Employee(String user, String password,String email,String firstName,
                    String lastName, String contact, String position, float baseSalary){
        this.user = user;
        this.password = password;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.contact = contact;
        this.position = position;
        this.baseSalary = baseSalary;
        this.role = Role.EMPLOYEE;
    }
    public Employee() {
        this.role = Role.EMPLOYEE;
    }
}
