package com.example.tsh.web.Service;

import com.example.tsh.web.Entity.Employee;
import com.example.tsh.web.Entity.PasswordResetToken;
import com.example.tsh.web.Repository.EmployeeRepo;
import com.example.tsh.web.Repository.PasswordResetTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {

    @Autowired
    private EmployeeRepo employeeRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public boolean requestPasswordReset(String emailOrUsername) {
        // Try to find by email first
        Optional<Employee> employeeOptional = employeeRepository.findByEmail(emailOrUsername);

        // If not found, try by username
        if (employeeOptional.isEmpty()) {
            employeeOptional = employeeRepository.findByUsername(emailOrUsername);
        }

        if (employeeOptional.isPresent()) {
            Employee employee = employeeOptional.get();

            // Check if a token already exists for this employee
            Optional<PasswordResetToken> existingTokenOpt = tokenRepository.findByEmployee(employee);

            PasswordResetToken token;
            if (existingTokenOpt.isPresent()) {
                token = existingTokenOpt.get();
                // Refresh token values
                token.setToken(UUID.randomUUID().toString());
                token.setExpiryDate(LocalDateTime.now().plusHours(24));
            } else {
                token = new PasswordResetToken(employee);
            }

            tokenRepository.save(token);

            // Send email with reset link
            String resetUrl = frontendUrl + "/reset-password?token=" + token.getToken();
            String emailSubject = "Password Reset Request";
            String emailBody = "Hello " + employee.firstName + ",\n\n" +
                    "You have requested to reset your password. Please click on the link below to reset your password:\n\n" +
                    resetUrl + "\n\n" +
                    "This link will expire in 24 hours.\n\n" +
                    "If you did not request a password reset, please ignore this email.\n\n" +
                    "Regards,\nYour Company Team";

            emailService.sendSimpleMessage(employee.email, emailSubject, emailBody);
            return true;
        }
        return false;
    }

    public boolean validateResetToken(String token) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token);
        return resetToken != null && !resetToken.isExpired();
    }

    public boolean resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token);

        if (resetToken == null || resetToken.isExpired()) {
            return false;
        }

        Employee employee = resetToken.getEmployee();
        employee.password = passwordEncoder.encode(newPassword);
        employeeRepository.save(employee);

        // Delete the used token
        tokenRepository.delete(resetToken);

        return true;
    }
}
