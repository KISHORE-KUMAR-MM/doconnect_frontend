package com.example.user.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.user.entity.User;
import com.example.user.service.UserService;

@CrossOrigin(origins = {"http://localhost:5500", "http://localhost:3000"})
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/all")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @PutMapping("/status/{id}")
    public User updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return userService.updateUserStatus(id, body.get("status"));
    }
}
