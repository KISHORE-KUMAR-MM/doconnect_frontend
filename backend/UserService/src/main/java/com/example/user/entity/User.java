package com.example.user.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user")   
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "full_name")   
    private String fullName;

    @Column(nullable = false)
    private String role;

    private String status = "ACTIVE"; 
}
