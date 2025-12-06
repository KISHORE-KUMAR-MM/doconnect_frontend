package com.example.qa.service;

public interface EmailService {
	 void sendToAdmins(String subject, String body);
	 void sendToUser(String username, String subject, String body);
}
