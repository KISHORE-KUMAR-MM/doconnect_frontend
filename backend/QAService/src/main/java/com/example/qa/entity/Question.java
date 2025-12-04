package com.example.qa.entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.Data;

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

    private String approvedBy;  
}
