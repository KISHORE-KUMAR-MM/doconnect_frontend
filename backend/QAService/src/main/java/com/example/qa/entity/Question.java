package com.example.qa.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "questions")
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String topic;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String status = "PENDING";

    @Column(nullable = false)
    private String postedBy;

    private LocalDateTime postedAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    private String approvedBy;
    private String rejectedBy;

    private boolean closed = false;
    private boolean resolved = false;
}
