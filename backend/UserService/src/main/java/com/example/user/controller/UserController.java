package com.example.user.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.user.entity.User;
import com.example.user.service.UserService;

@CrossOrigin(origins = {"http://localhost:5500", "http://localhost:3000"})
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    // ==============================================
    // GET ALL USERS (ADMIN ONLY - validated via JWT)
    // ==============================================
    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // ==============================================
    // UPDATE USER STATUS (ADMIN ONLY)
    // ==============================================
    @PutMapping("/status/{id}")
    public ResponseEntity<User> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String status = body.get("status");
        if (status == null || status.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        User updated = userService.updateUserStatus(id, status);
        return ResponseEntity.ok(updated);
    }
}
