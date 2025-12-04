package com.example.user.feign;

import com.example.user.entity.User;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "admin-service", url = "http://localhost:8082")
public interface AdminClient {

    @PostMapping("/api/admin/auth/register")
    Map<String, Object> registerAdmin(@RequestBody User user);
}
