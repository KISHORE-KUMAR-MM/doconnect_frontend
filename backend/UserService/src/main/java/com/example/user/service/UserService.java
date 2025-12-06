package com.example.user.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.user.entity.User;
import com.example.user.exception.EmailAlreadyExistsException;
import com.example.user.exception.InvalidCredentialsException;
import com.example.user.exception.ResourceNotFoundException;
import com.example.user.exception.UserAlreadyExistsException;
import com.example.user.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository repo;

    public UserService(UserRepository repo) {
        this.repo = repo;
    }

    // ======================================================
    // REGISTER USER OR ADMIN
    // ======================================================
    public User register(User user) {

        // Unique username validation
        if (repo.findByUsername(user.getUsername()).isPresent()) {
            throw new UserAlreadyExistsException("Username already exists");
        }

        // Unique email validation
        if (repo.findByEmail(user.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Email already exists");
        }

        return repo.save(user);
    }

    // ======================================================
    // FIND USER BY USERNAME
    // ======================================================
    public Optional<User> findByUsername(String username) {
        return repo.findByUsername(username);
    }

    // ======================================================
    // FIND USER BY EMAIL
    // ======================================================
    public Optional<User> findByEmail(String email) {
        return repo.findByEmail(email);
    }

    // ======================================================
    // VALIDATE LOGIN
    // ======================================================
    public User validateLogin(String username, String password) {

        User user = repo.findByUsername(username)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid username or password"));

        if (!password.equals(user.getPassword())) {
            throw new InvalidCredentialsException("Invalid username or password");
        }

        return user;
    }

    // ======================================================
    // GET ALL USERS (ADMIN ACCESS)
    // ======================================================
    public List<User> getAllUsers() {
        return repo.findAll();
    }

    // ======================================================
    // UPDATE USER STATUS (ADMIN ACCESS)
    // ======================================================
    public User updateUserStatus(Long id, String status) {

        User user = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        user.setStatus(status);
        return repo.save(user);
    }
}
