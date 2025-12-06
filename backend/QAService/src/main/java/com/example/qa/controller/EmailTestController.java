package com.example.qa.controller;

import org.springframework.web.bind.annotation.*;

import com.example.qa.service.EmailService;

@RestController
@RequestMapping("/api/email")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5500"})
public class EmailTestController {

    private final EmailService emailService;

    public EmailTestController(EmailService emailService) {
        this.emailService = emailService;
    }

    // ============================================================
    // TEST → Send test email to YOUR personal email ID
    // ============================================================
    @GetMapping("/test")
    public String sendTestEmail(
            @RequestParam String toEmail
    ) {
        String subject = "DoConnect Email Service Test";
        String body =
                "Hello,\n\n" +
                "This is a test email to verify that the DoConnect email service " +
                "is working correctly.\n\n" +
                "If you received this email, SMTP configuration is successful!\n\n" +
                "Regards,\nDoConnect System";

        emailService.sendToUser(toEmail, subject, body);

        return "Test email sent to: " + toEmail;
    }
}
