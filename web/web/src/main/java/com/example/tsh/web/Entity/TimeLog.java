package com.example.tsh.web.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter@Setter

@Entity
@Table(name = "time_logs")
public class TimeLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long timeLogId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Column(name = "time_in", nullable = false)
    private LocalDateTime timeIn;

    @Column(name = "time_out")
    private LocalDateTime timeOut;

    @Column(name = "work_hours")
    private Double workHours;

    @Column(name = "status", nullable = false)
    private TimeLogStatus status;

    public enum TimeLogStatus {
        ACTIVE, COMPLETED
    }


    // Constructor for time in
    public TimeLog(Employee employee) {
        this.employee = employee;
        this.timeIn = LocalDateTime.now();
        this.logDate = LocalDate.now();
        this.status = TimeLogStatus.ACTIVE;
    }

    // Calculate work hours
    public void completeTimeLog() {
        this.timeOut = LocalDateTime.now();
        this.status = TimeLogStatus.COMPLETED;

        // Calculate work hours
        if (this.timeIn != null && this.timeOut != null) {
            Duration duration = Duration.between(this.timeIn, this.timeOut);
            this.workHours = duration.toMinutes() / 60.0;
        }
    }
}
