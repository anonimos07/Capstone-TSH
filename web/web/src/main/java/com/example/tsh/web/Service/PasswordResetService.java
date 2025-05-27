package com.example.tsh.web.Service;

import com.example.tsh.web.Entity.Employee;
import com.example.tsh.web.Entity.HR;
import com.example.tsh.web.Entity.PasswordResetToken;
import com.example.tsh.web.Repository.EmployeeRepo;
import com.example.tsh.web.Repository.HRRepo;
import com.example.tsh.web.Repository.PasswordResetTokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {

    private static final Logger logger = LoggerFactory.getLogger(PasswordResetService.class);

    @Autowired
    private EmployeeRepo employeeRepository;

    @Autowired
    private HRRepo hrRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public boolean requestPasswordReset(String emailOrUsername) {
        logger.info("Processing password reset request for: {}", emailOrUsername);

        Optional<Employee> employeeOptional = employeeRepository.findByEmail(emailOrUsername);

        if (employeeOptional.isEmpty()) {
            logger.debug("No employee found with email: {}, trying username", emailOrUsername);
            employeeOptional = employeeRepository.findByUsername(emailOrUsername);
        }

        if (employeeOptional.isPresent()) {
            Employee employee = employeeOptional.get();
            logger.info("Found employee: {} ({})", employee.firstName, employee.email);
            return processEmployeePasswordReset(employee);
        }

        Optional<HR> hrOptional = hrRepository.findByEmail(emailOrUsername);

        if (hrOptional.isEmpty()) {
            logger.debug("No HR found with email: {}, trying username", emailOrUsername);
            hrOptional = hrRepository.findByUsername(emailOrUsername);
        }

        if (hrOptional.isPresent()) {
            HR hr = hrOptional.get();
            logger.info("Found HR: {} ({})", hr.firstName, hr.email);
            return processHRPasswordReset(hr);
        }

        logger.info("No user found with email/username: {}", emailOrUsername);
        return false;
    }

    private boolean processEmployeePasswordReset(Employee employee) {
        String token = createOrUpdateToken(employee, null);

        // Send email
        String resetUrl = frontendUrl + "/reset-password?token=" + token;
        String emailSubject = "Password Reset Request";
        String emailBody = "Hello " + employee.firstName + ",\n\n" +
                "You have requested to reset your password. Please click on the link below to reset your password:\n\n" +
                resetUrl + "\n\n" +
                "This link will expire in 24 hours.\n\n" +
                "If you did not request a password reset, please ignore this email.\n\n" +
                "Regards,\nYour Company Team";

        logger.info("Sending password reset email to employee: {}", employee.email);
        boolean emailSent = emailService.sendSimpleMessage(employee.email, emailSubject, emailBody);

        if (emailSent) {
            logger.info("Password reset email sent successfully to employee: {}", employee.email);
        } else {
            logger.error("Failed to send password reset email to employee: {}", employee.email);
        }

        return emailSent;
    }

    private boolean processHRPasswordReset(HR hr) {
        String token = createOrUpdateToken(null, hr);

        String resetUrl = frontendUrl + "/reset-password?token=" + token;
        String emailSubject = "Password Reset Request";
        String emailBody = "Hello " + hr.firstName + ",\n\n" +
                "You have requested to reset your password. Please click on the link below to reset your password:\n\n" +
                resetUrl + "\n\n" +
                "This link will expire in 24 hours.\n\n" +
                "If you did not request a password reset, please ignore this email.\n\n" +
                "Regards,\nYour Company Team";

        logger.info("Sending password reset email to HR: {}", hr.email);
        boolean emailSent = emailService.sendSimpleMessage(hr.email, emailSubject, emailBody);

        if (emailSent) {
            logger.info("Password reset email sent successfully to HR: {}", hr.email);
        } else {
            logger.error("Failed to send password reset email to HR: {}", hr.email);
        }

        return emailSent;
    }

    private String createOrUpdateToken(Employee employee, HR hr) {
        PasswordResetToken token;

        if (employee != null) {
            Optional<PasswordResetToken> existingTokenOpt = tokenRepository.findByEmployee(employee);

            if (existingTokenOpt.isPresent()) {
                token = existingTokenOpt.get();
                token.setToken(UUID.randomUUID().toString());
                token.setExpiryDate(LocalDateTime.now().plusHours(24));
                logger.debug("Updated existing token for employee: {}", employee.email);
            } else {
                token = new PasswordResetToken(employee);
                logger.debug("Created new token for employee: {}", employee.email);
            }
        } else {
            Optional<PasswordResetToken> existingTokenOpt = tokenRepository.findByHr(hr);

            if (existingTokenOpt.isPresent()) {
                token = existingTokenOpt.get();
                token.setToken(UUID.randomUUID().toString());
                token.setExpiryDate(LocalDateTime.now().plusHours(24));
                logger.debug("Updated existing token for HR: {}", hr.email);
            } else {
                token = new PasswordResetToken(hr);
                logger.debug("Created new token for HR: {}", hr.email);
            }
        }

        tokenRepository.save(token);
        return token.getToken();
    }

    public boolean validateResetToken(String token) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token);
        boolean isValid = resetToken != null && !resetToken.isExpired();

        if (isValid) {
            logger.info("Token validated successfully: {}", token);
        } else {
            logger.warn("Invalid or expired token: {}", token);
        }

        return isValid;
    }

    public boolean resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token);

        if (resetToken == null || resetToken.isExpired()) {
            logger.warn("Password reset failed: Token invalid or expired");
            return false;
        }

        if (resetToken.getEmployee() != null) {
            Employee employee = resetToken.getEmployee();
            employee.password = passwordEncoder.encode(newPassword);
            employeeRepository.save(employee);
            logger.info("Password reset successful for employee: {}", employee.email);
        } else if (resetToken.getHr() != null) {
            HR hr = resetToken.getHr();
            hr.password = passwordEncoder.encode(newPassword);
            hrRepository.save(hr);
            logger.info("Password reset successful for HR: {}", hr.email);
        } else {
            logger.error("Password reset failed: Token not associated with any user");
            return false;
        }

        tokenRepository.delete(resetToken);
        logger.debug("Token deleted after successful password reset");

        return true;
    }
}