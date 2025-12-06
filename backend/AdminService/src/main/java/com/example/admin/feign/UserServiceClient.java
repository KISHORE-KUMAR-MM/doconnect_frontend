package com.example.admin.feign;

import org.springframework.cloud.openfeign.FeignClient;

import org.springframework.web.bind.annotation.*;

@FeignClient(name = "USER-SERVICE")
public interface UserServiceClient {

    @PutMapping("/api/users/status/{id}")
    Object updateStatus(@PathVariable Long id, @RequestBody Object body);

    @GetMapping("/api/users/all")
    Object getAllUsers();
}
