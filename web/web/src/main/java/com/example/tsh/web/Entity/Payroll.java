//package com.example.tsh.web.Entity;
//
//import com.example.tsh.web.DTO.PayrollCreationRequest;
//import jakarta.persistence.*;
//import lombok.Getter;
//import lombok.Setter;
//
//import java.time.LocalDate;
//import java.util.List;
//
//@Getter
//@Setter
//@Entity
//public class Payroll {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    private String period;
//    private String status;
//    private LocalDate creationDate;
//
//
//    private LocalDate cutoffStartDate;
//    private LocalDate cutoffEndDate;
//    private LocalDate payDate;
//
//    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
//    private List<PayrollItem> items;
//
//}