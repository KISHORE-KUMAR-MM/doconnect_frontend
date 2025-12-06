package com.example.admin.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "moderation_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ModerationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String requestType; 

    private Long requestId;   

    private String status;     

    private String createdAt = String.valueOf(java.time.LocalDateTime.now());
}
