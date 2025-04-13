package com.example.tsh.web.Entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter@Setter
@Entity
@Table(name = "admin")
public class Admin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long adminId;

    @Setter
    @Getter
    private String username;

    @Setter
    @Getter
    private String password;

    @Enumerated(EnumType.STRING)
    @Getter @Setter
    private Role role = Role.ADMIN;

    public Admin(String username, String password){
        super();
        this.username = username;
        this.password = password;
        this.role = Role.ADMIN;
    }

    public Admin(){
        this.role = Role.ADMIN;
    }

}
