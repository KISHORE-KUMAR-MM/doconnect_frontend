package com.example.admin.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.*;

import com.example.admin.dto.AdminActionDTO;
import com.example.admin.feign.*;
import com.example.admin.service.AdminService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final UserServiceClient userClient;
    private final QAServiceClient qaClient;

    public AdminController(AdminService adminService,
                           UserServiceClient userClient,
                           QAServiceClient qaClient) {
        this.adminService = adminService;
        this.userClient = userClient;
        this.qaClient = qaClient;
    }

    // ---------------- APPROVE QUESTION ----------------
    @PutMapping("/question/approve/{id}")
    public Object approveQuestion(@PathVariable Long id, @RequestHeader("username") String admin) {

        qaClient.approveQuestion(id);

        adminService.recordAction(new AdminActionDTO(
                admin, "APPROVE_QUESTION", "QUESTION", id
        ));

        return "Question approved";
    }

    // ---------------- APPROVE ANSWER ----------------
    @PutMapping("/answer/approve/{id}")
    public Object approveAnswer(@PathVariable Long id, @RequestHeader("username") String admin) {

        qaClient.approveAnswer(id);

        adminService.recordAction(new AdminActionDTO(
                admin, "APPROVE_ANSWER", "ANSWER", id
        ));

        return "Answer approved";
    }

    // ---------------- DELETE QUESTION ----------------
    @DeleteMapping("/question/{id}")
    public Object deleteQuestion(@PathVariable Long id, @RequestHeader("username") String admin) {

        qaClient.deleteQuestion(id);

        adminService.recordAction(new AdminActionDTO(
                admin, "DELETE_QUESTION", "QUESTION", id
        ));

        return "Question deleted";
    }

    // ---------------- DELETE ANSWER ----------------
    @DeleteMapping("/answer/{id}")
    public Object deleteAnswer(@PathVariable Long id, @RequestHeader("username") String admin) {

        qaClient.deleteAnswer(id);

        adminService.recordAction(new AdminActionDTO(
                admin, "DELETE_ANSWER", "ANSWER", id
        ));

        return "Answer deleted";
    }

    // ---------------- DEACTIVATE USER ----------------
    @PutMapping("/user/deactivate/{id}")
    public Object deactivateUser(@PathVariable Long id, @RequestHeader("username") String admin) {

        userClient.updateStatus(id, Map.of("status", "INACTIVE"));

        adminService.recordAction(new AdminActionDTO(
                admin, "DEACTIVATE_USER", "USER", id
        ));

        return "User deactivated";
    }
}
