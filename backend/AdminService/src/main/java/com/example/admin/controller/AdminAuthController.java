package com.example.admin.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.admin.entity.Admin;
import com.example.admin.security.JwtUtil;
import com.example.admin.service.AdminService;

@CrossOrigin(origins = {"http://localhost:5500", "http://localhost:3000", "http://127.0.0.1:5500"})
@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {

    private final AdminService adminService;

    public AdminAuthController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Admin admin) {

        if (adminService.findByUsername(admin.getUsername()).isPresent()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Username already exists"));
        }

        admin.setRole("ROLE_ADMIN");

        Admin saved = adminService.register(admin);

        return ResponseEntity.ok(Map.of(
                "id", saved.getId(),
                "username", saved.getUsername(),
                "role", saved.getRole(),
                "message", "Admin registered successfully"
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {

        String username = body.get("username");
        String password = body.get("password");

        Optional<Admin> maybe = adminService.findByUsername(username);

        if (maybe.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }

        Admin admin = maybe.get();

        if (!adminService.checkPassword(admin, password)) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }

        String token = JwtUtil.generateToken(admin.getUsername(), admin.getRole());

        return ResponseEntity.ok(
                Map.of(
                        "message", "Login successful",
                        "username", admin.getUsername(),
                        "role", admin.getRole(),
                        "token", token
                )
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/check-role/{username}")
    public ResponseEntity<?> checkAdminRole(@PathVariable String username) {

        Optional<Admin> admin = adminService.findByUsername(username);

        if (admin.isPresent()) {
            return ResponseEntity.ok(Map.of("role", "ROLE_ADMIN"));
        }

        return ResponseEntity.status(404).body(Map.of("role", "UNKNOWN"));
    }
}
