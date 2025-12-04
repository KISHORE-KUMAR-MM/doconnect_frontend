package com.example.user.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.user.entity.User;
import com.example.user.feign.AdminClient;
import com.example.user.security.JwtUtil;
import com.example.user.service.UserService;

@CrossOrigin(origins = "http://127.0.0.1:5500")
@RestController
@RequestMapping("/api/auth")
public class UserAuthController {

    private final UserService userService;

    @Autowired
    private AdminClient adminClient;

    public UserAuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {

        String role = user.getRole();

        if ("Admin".equalsIgnoreCase(role) || "ROLE_ADMIN".equalsIgnoreCase(role)) {
            user.setRole("ROLE_ADMIN");
            return forwardToAdminService(user);
        }

        user.setRole("ROLE_USER");

        if (userService.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username already exists"));
        }

        User saved = userService.register(user);

        return ResponseEntity.ok(Map.of("id", saved.getId(),"username", saved.getUsername(),"message", "User registration successful"));}

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {

        String username = body.get("username");
        String password = body.get("password");

        Optional<User> maybe = userService.findByUsername(username);

        if (maybe.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }

        User user = maybe.get();

        if (!userService.checkPassword(user, password)) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }

        String token = JwtUtil.generateToken(user.getUsername(), user.getRole());

        return ResponseEntity.ok(
                Map.of(
                        "message", "Login successful",
                        "username", user.getUsername(),
                        "role", user.getRole(),
                        "token", token
                )
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    
    @GetMapping("/check-role/{username}")
    public ResponseEntity<?> checkRole(@PathVariable String username) {

        Optional<User> user = userService.findByUsername(username);

        if (user.isPresent()) {
            return ResponseEntity.ok(Map.of("role", user.get().getRole()));
        }

        return ResponseEntity.status(404).body(Map.of("role", "UNKNOWN"));
    }
    

    private ResponseEntity<?> forwardToAdminService(User user) {
        try {
            Map<String, Object> response = adminClient.registerAdmin(user);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Admin Service not reachable. Try again later."));
        }
    }
}
