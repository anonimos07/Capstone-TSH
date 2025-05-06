package com.example.tsh.web.Controller;

import com.example.tsh.web.Service.PasswordResetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/password")
@CrossOrigin(origins = "http://localhost:5173")
public class PasswordResetController {

    @Autowired
    private PasswordResetService passwordResetService;

    @PostMapping("/forgot")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String emailOrUsername = request.get("emailOrUsername");

        if (emailOrUsername == null || emailOrUsername.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email or username is required"));
        }

        boolean emailSent = passwordResetService.requestPasswordReset(emailOrUsername);

        if (emailSent) {
            return ResponseEntity.ok(Map.of("message", "Password reset email has been sent"));
        } else {
            return ResponseEntity.ok(Map.of("message", "If the email/username exists in our system, you will receive a reset link"));
        }
    }

    @GetMapping("/validate-token")
    public ResponseEntity<?> validateToken(@RequestParam String token) {
        boolean isValid = passwordResetService.validateResetToken(token);

        if (isValid) {
            return ResponseEntity.ok(Map.of("valid", true));
        } else {
            return ResponseEntity.badRequest().body(Map.of("valid", false, "message", "Invalid or expired token"));
        }
    }

    @PostMapping("/reset")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        if (token == null || newPassword == null || newPassword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Token and new password are required"));
        }

        boolean resetSuccess = passwordResetService.resetPassword(token, newPassword);

        if (resetSuccess) {
            return ResponseEntity.ok(Map.of("message", "Password has been reset successfully"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to reset password. Token may be invalid or expired"));
        }
    }
}