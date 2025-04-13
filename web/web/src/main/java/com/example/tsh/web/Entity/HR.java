package com.example.tsh.web.Entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
@Table(name = "hr")
public class HR {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long hrId;

    @Getter
    @Setter
    public String username;
    @Getter @Setter
    public String password;
    @Getter @Setter
    public String email;
    @Getter @Setter
    public String firstName;
    @Getter @Setter
    public String lastName;
    @Column(nullable = true)
    @Getter @Setter
    public String contact;
    @Getter @Setter
    public String position;
    @Getter @Setter
    public float baseSalary;

    @Enumerated(EnumType.STRING)
    @Setter @Getter
    private Role role = Role.HR;

    public HR(String user, String password,String email,String firstName,
                    String lastName, String contact, String position, float baseSalary){
        this.username = username;
        this.password = password;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.contact = contact;
        this.position = position;
        this.baseSalary = baseSalary;
        this.role = Role.HR;
    }
    public HR() {
        this.role = Role.HR;
    }
}
