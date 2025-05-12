package com.example.tsh.web.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;


@Entity
@Table(name = "time_logs")
public class TimeLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long timeLogId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @Column(name = "time_in")
    private LocalDateTime timeIn;

    @Column(name = "time_out")
    private LocalDateTime timeOut;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "date")
    private LocalDateTime date;

    @Column(name = "cutoff_period")
    private String cutoffPeriod;


    @ManyToOne
    @JoinColumn(name = "assigned_hr_id")
    private HR assignedHr;

    public TimeLog(){

    }


    public TimeLog(Employee employee, LocalDateTime timeIn, LocalDateTime timeOut) {
        this.employee = employee;
        this.timeIn = timeIn;
        this.timeOut = timeOut;
        this.date = timeIn;
        if (timeIn != null && timeOut != null) {
            this.durationMinutes = calculateDurationInMinutes(timeIn, timeOut);
        }
    }


    private Integer calculateDurationInMinutes(LocalDateTime start, LocalDateTime end) {
        return (int) java.time.Duration.between(start, end).toMinutes();
    }

    public String getCutoffPeriod() {
        return cutoffPeriod;
    }

    public void setCutoffPeriod(String cutoffPeriod) {
        this.cutoffPeriod = cutoffPeriod;
    }


    public HR getAssignedHr() {
        return assignedHr;
    }

    public void setAssignedHr(HR assignedHr) {
        this.assignedHr = assignedHr;
    }


    public Long getTimeLogId() {
        return timeLogId;
    }

    public void setTimeLogId(Long timeLogId) {
        this.timeLogId = timeLogId;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public LocalDateTime getTimeIn() {
        return timeIn;
    }

    public void setTimeIn(LocalDateTime timeIn) {
        this.timeIn = timeIn;
        this.date = timeIn;
    }

    public LocalDateTime getTimeOut() {
        return timeOut;
    }

    public void setTimeOut(LocalDateTime timeOut) {
        this.timeOut = timeOut;
        if (this.timeIn != null && timeOut != null) {
            this.durationMinutes = calculateDurationInMinutes(this.timeIn, timeOut);
        }
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }
}