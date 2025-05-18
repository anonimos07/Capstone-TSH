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

    @Column(name = "overtime_minutes")
    private Integer overtimeMinutes;



    @ManyToOne
    @JoinColumn(name = "assigned_hr_id")
    private HR assignedHr;

    public TimeLog(){

    }

    public static final Integer STANDARD_WORK_MINUTES = 8 * 60;





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

//    public void setTimeOut(LocalDateTime timeOut) {
//        this.timeOut = timeOut;
//        if (this.timeIn != null && timeOut != null) {
//            this.durationMinutes = calculateDurationInMinutes(this.timeIn, timeOut);
//        }
//    }

    public void recalculateOvertimeMutates() {
        if (this.timeIn != null && this.timeOut != null) {
            // First calculate the duration
            this.durationMinutes = (int) Duration.between(this.timeIn, this.timeOut).toMinutes();

            // Then calculate overtime (anything beyond 8 hours)
            int standardWorkMinutes = 8 * 60; // 8 hours = 480 minutes
            this.overtimeMinutes = Math.max(0, this.durationMinutes - standardWorkMinutes);
        }
    }

    /**
     * Replace your setTimeOut method with this enhanced version
     */
    public void setTimeOut(LocalDateTime timeOut) {
        this.timeOut = timeOut;

        // Recalculate duration and overtime when timeOut is set
        if (this.timeIn != null && timeOut != null) {
            this.durationMinutes = (int) Duration.between(this.timeIn, timeOut).toMinutes();

            // Standard workday is 8 hours (480 minutes)
            int standardWorkMinutes = 8 * 60;
            this.overtimeMinutes = Math.max(0, this.durationMinutes - standardWorkMinutes);

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

    public Integer getOvertimeMinutes() {
        return overtimeMinutes;
    }

    public void setOvertimeMinutes(Integer overtimeMinutes) {
        this.overtimeMinutes = overtimeMinutes;
    }
}