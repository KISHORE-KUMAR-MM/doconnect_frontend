package com.example.qa.service.impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.example.qa.service.EmailService;

@Service
public class EmailServiceImpl implements EmailService {

    @Value("${admin.emails}")
    private String adminEmails;  // comma-separated list: admin1@gmail.com,admin2@gmail.com

    private final JavaMailSender mailSender;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendToAdmins(String subject, String body) {
        for (String email : adminEmails.split(",")) {
            sendEmail(email.trim(), subject, body);
        }
    }

    @Override
    public void sendToUser(String email, String subject, String body) {
        sendEmail(email, subject, body);
    }

    private void sendEmail(String to, String subject, String body) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom("doconnect.noreply@gmail.com"); // optional
        msg.setTo(to);
        msg.setSubject(subject);
        msg.setText(body);

        mailSender.send(msg);
    }
}
