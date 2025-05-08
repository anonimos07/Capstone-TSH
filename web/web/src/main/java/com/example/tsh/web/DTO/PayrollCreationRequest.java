package com.example.tsh.web.DTO;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

// DTO
@Setter
@Getter
public class PayrollCreationRequest {
    private String period;
    private List<Long> employeeIds;

}