package com.example.user.controller;

import java.util.Map;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.example.user.entity.User;
import com.example.user.exception.ValidationException;
import com.example.user.security.JwtUtil;
import com.example.user.service.UserService;

@CrossOrigin(origins = "http://127.0.0.1:5500")
@RestController
@RequestMapping("/api/auth")
public class UserAuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserAuthController(UserService userService, JwtUtil jwtUtil, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    // ======================================================
    // REGISTER
    // ======================================================
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {

        // VALIDATION
        if (user.getUsername() == null || user.getUsername().trim().isEmpty())
            throw new ValidationException("Username cannot be empty");

        if (!Pattern.matches("^[A-Za-z0-9_]{4,20}$", user.getUsername()))
            throw new ValidationException("Username must be 4–20 characters");

        if (user.getEmail() == null || user.getEmail().trim().isEmpty())
            throw new ValidationException("Email cannot be empty");

        if (!Pattern.matches("^[\\w.-]+@[\\w.-]+\\.\\w{2,}$", user.getEmail()))
            throw new ValidationException("Invalid email format");

        if (user.getPassword() == null || user.getPassword().trim().isEmpty())
            throw new ValidationException("Password cannot be empty");

        if (user.getPassword().length() < 6)
            throw new ValidationException("Password must be at least 6 characters");

        // ROLE NORMALIZATION
        String role = user.getRole() != null ? user.getRole().toUpperCase() : "ROLE_USER";
        if (!role.startsWith("ROLE_")) role = "ROLE_" + role;
        if (!role.equals("ROLE_USER") && !role.equals("ROLE_ADMIN"))
            throw new ValidationException("Role must be USER or ADMIN");

        user.setRole(role);


        // SAVE
        User saved = userService.register(user);

        return ResponseEntity.ok(
                Map.of(
                        "id", saved.getId(),
                        "username", saved.getUsername(),
                        "role", saved.getRole(),
                        "message", "Registration successful"
                )
        );
    }

    // ======================================================
    // LOGIN
    // ======================================================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {

        String username = body.get("username");
        String password = body.get("password");

        if (username == null || username.isBlank())
            throw new ValidationException("Username cannot be empty");

        if (password == null || password.isBlank())
            throw new ValidationException("Password cannot be empty");

        User user = userService.findByUsername(username)
                .orElseThrow(() -> new ValidationException("Invalid username or password"));

        if (!passwordEncoder.matches(password, user.getPassword()))
            throw new ValidationException("Invalid username or password");

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole());

        return ResponseEntity.ok(
                Map.of(
                        "token", token,
                        "username", user.getUsername(),
                        "role", user.getRole(),
                        "message", "Login successful"
                )
        );
    }

    // ======================================================
    // LOGOUT
    // ======================================================
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    // ======================================================
    // CHECK ROLE
    // ======================================================
    @GetMapping("/check-role/{username}")
    public ResponseEntity<?> checkRole(@PathVariable String username) {

        User user = userService.findByUsername(username)
                .orElseThrow(() -> new ValidationException("User not found"));

        return ResponseEntity.ok(Map.of("role", user.getRole()));
    }

   
    }

