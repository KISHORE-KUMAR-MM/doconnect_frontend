package com.example.qa.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ChatMessageDto {
    private Long id;
    private String username;
    private String message;
    private LocalDateTime timestamp;
    private String sessionId;
}

