package com.example.tsh.web.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Table(name = "leave_requests")
@Getter @Setter
public class LeaveRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @ManyToOne
    @JoinColumn(name = "hr_id")
    private HR assignedHR;

    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
    private String status;
    private String leaveType;
}