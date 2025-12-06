package com.example.admin.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "admin_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String adminUsername;       
    
    private String action;       
    
    private String targetType;    
    
    private Long targetId;         
    
    private String description;      
  
    @Column(nullable = false)
    private String timestamp;           
}