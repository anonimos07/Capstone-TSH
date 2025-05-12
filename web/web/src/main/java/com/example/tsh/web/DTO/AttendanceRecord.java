package com.example.tsh.web.DTO;

import com.example.tsh.web.Entity.Employee;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class AttendanceRecord {

    private Long employeeId;
    private Employee employee;
    private String date;
    private String status;


    public AttendanceRecord() {}

    public AttendanceRecord(Long employeeId, Employee employee, String date, String status) {
        this.employeeId = employeeId;
        this.employee = employee;
        this.date = date;
        this.status = status;
    }

}