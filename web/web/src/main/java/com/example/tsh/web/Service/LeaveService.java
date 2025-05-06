package com.example.tsh.web.Service;

import com.example.tsh.web.Entity.LeaveRequest;
import com.example.tsh.web.Entity.Employee;
import com.example.tsh.web.Repository.LeaveRequestRepo;
import com.example.tsh.web.Repository.EmployeeRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveService {
    private final LeaveRequestRepo leaveRequestRepo;
    private final EmployeeRepo employeeRepo;

    public LeaveRequest submitLeaveRequest(Long employeeId, LocalDate startDate,
                                           LocalDate endDate, String reason, String leaveType) {
        Employee employee = employeeRepo.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        LeaveRequest request = new LeaveRequest();
        request.setEmployee(employee);
        request.setStartDate(startDate);
        request.setEndDate(endDate);
        request.setReason(reason);
        request.setLeaveType(leaveType);
        request.setStatus("PENDING");

        return leaveRequestRepo.save(request);
    }

    public List<LeaveRequest> getEmployeeLeaveRequests(Long employeeId) {
        return leaveRequestRepo.findByEmployee_EmployeeId(employeeId);
    }

    public List<LeaveRequest> getPendingLeaveRequests() {
        return leaveRequestRepo.findByStatus("PENDING");
    }

    public LeaveRequest approveLeaveRequest(Long requestId) {
        LeaveRequest request = leaveRequestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        request.setStatus("APPROVED");
        return leaveRequestRepo.save(request);
    }

    public LeaveRequest rejectLeaveRequest(Long requestId, String rejectionReason) {
        LeaveRequest request = leaveRequestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        request.setStatus("REJECTED");
        request.setReason(request.getReason() + " (Rejected: " + rejectionReason + ")");
        return leaveRequestRepo.save(request);
    }
}