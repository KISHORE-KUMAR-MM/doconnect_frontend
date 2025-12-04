package com.example.user.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.user.entity.User;
import com.example.user.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository repo;

    public UserService(UserRepository repo) {
        this.repo = repo;
    }

    public User register(User user) {
        return repo.save(user);
    }

    public Optional<User> findByUsername(String username) {
        return repo.findByUsername(username);
    }

    public boolean checkPassword(User user, String rawPassword) {
        return rawPassword.equals(user.getPassword());
    }

    public List<User> getAllUsers() {
        return repo.findAll();
    }

    public User updateUserStatus(Long id, String status) {
        User user = repo.findById(id).orElseThrow();
        user.setStatus(status);
        return repo.save(user);
    }
}
