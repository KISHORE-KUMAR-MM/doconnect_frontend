package com.example.qa.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "answers")
public class Answer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long questionId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String answerText;

    @Column(nullable = false)
    private String answeredBy;

    @Column(nullable = false)
    private String status = "PENDING";

    private String approvedBy;
    private String rejectedBy;

    private LocalDateTime createdAt = LocalDateTime.now();
}
