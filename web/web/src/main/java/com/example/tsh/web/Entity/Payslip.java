package com.example.tsh.web.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Setter
@Getter
@Entity
@Table(name = "payslip")
public class Payslip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long payslipId;

    @ManyToOne
    @JoinColumn(name = "payroll_id", nullable = false)
    @JsonBackReference
    private Payroll payroll;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    @JsonBackReference
    private Employee employee;

    private LocalDate generatedDate;

    private String payslipTemplate;

    private String payslipFileName;

    private LocalDateTime sentDateTime;

    private boolean isDownloaded;

    private LocalDateTime downloadedDateTime;

    private String status;

    private String fileFormat;

    @Lob
    @Column
    private byte[] fileContent;


    public Payslip() {
        this.generatedDate = LocalDate.now();
        this.status = "GENERATED";
        this.fileFormat = "PDF";
        this.isDownloaded = false;
    }

    @Override
    public String toString() {
        return "Payslip{" +
                "payslipId=" + payslipId +
                ", payroll=" + (payroll != null ? payroll.getPayrollId() : "null") +
                ", employee=" + (employee != null ? employee.getEmployeeId() : "null") +
                ", generatedDate=" + generatedDate +
                ", status='" + status + '\'' +
                ", isDownloaded=" + isDownloaded +
                '}';
    }
}