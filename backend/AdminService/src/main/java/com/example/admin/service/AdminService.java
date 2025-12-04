package com.example.admin.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.admin.entity.Admin;
import com.example.admin.repository.AdminRepository;

@Service
public class AdminService {

    private final AdminRepository repo;

    public AdminService(AdminRepository repo) {
        this.repo = repo;
    }

    public Admin register(Admin admin) {
        return repo.save(admin);
    }

    public Optional<Admin> findByUsername(String username) {
        return repo.findByUsername(username);
    }

    public boolean checkPassword(Admin admin, String rawPassword) {
        return rawPassword.equals(admin.getPassword());
    }
}
