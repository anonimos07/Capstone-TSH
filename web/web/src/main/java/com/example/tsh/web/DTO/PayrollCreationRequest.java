package com.example.tsh.web.DTO;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
public class PayrollCreationRequest {
    private String period;
    private List<Long> employeeIds;
    private int month;
    private int year;
}