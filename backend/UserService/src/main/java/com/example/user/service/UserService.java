package com.example.user.service;

import java.util.List;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository repo, PasswordEncoder passwordEncoder) {
        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
    }

    // ======================================================
    // REGISTER USER OR ADMIN (ENCODE PASSWORD)
    // ======================================================
    public User register(User user) {

        if (repo.findByUsername(user.getUsername()).isPresent()) {
            throw new UserAlreadyExistsException("Username already exists");
        }

        if (repo.findByEmail(user.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Email already exists");
        }

        // Encode password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));

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
    // VALIDATE LOGIN (CHECK ENCODED PASSWORD)
    // ======================================================
    public User validateLogin(String username, String rawPassword) {

        User user = repo.findByUsername(username)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid username or password"));

        // Compare raw password with encoded password
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new InvalidCredentialsException("Invalid username or password");
        }

        return user;
    }

    // ======================================================
    // GET ALL USERS (ADMIN ONLY)
    // ======================================================
    public List<User> getAllUsers() {
        return repo.findAll();
    }

    // ======================================================
    // UPDATE USER STATUS (ADMIN ONLY)
    // ======================================================
    public User updateUserStatus(Long id, String status) {

        User user = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        user.setStatus(status);
        return repo.save(user);
    }
}
