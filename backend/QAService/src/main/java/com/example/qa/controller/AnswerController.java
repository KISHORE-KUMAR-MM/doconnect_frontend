package com.example.qa.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.qa.entity.Answer;
import com.example.qa.security.JwtUtil;
import com.example.qa.service.AnswerService;

@CrossOrigin(origins = "http://127.0.0.1:5500")
@RestController
@RequestMapping("/api/answers")
public class AnswerController {

    private final AnswerService service;

    public AnswerController(AnswerService service) {
        this.service = service;
    }

    // USER — Submit answer (requires any authenticated user)
    @PostMapping("/post")
    public ResponseEntity<?> postAnswer(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                        @RequestBody Answer answer) {
        try {
            String role = extractRoleFromHeader(authHeader);
            if (role == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            Answer saved = service.postAnswer(answer);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid or expired token"));
        }
    }

    // USER — Get approved answers for question
    @GetMapping("/question/{questionId}")
    public List<Answer> getApprovedAnswers(@PathVariable("questionId") Long questionId) {
        return service.getApprovedAnswers(questionId);
    }


    // ADMIN — Get pending answers
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingAnswers(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        return ResponseEntity.ok(service.getPendingAnswers());
    }

    // ADMIN — Approve answer
    @PutMapping("/approve/{id}")
    public ResponseEntity<?> approve(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                     @PathVariable Long id,
                                     @RequestBody Map<String, String> body) {
        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        return ResponseEntity.ok(service.approveAnswer(id, body.get("approvedBy")));
    }

    // ADMIN — Reject answer
    @PutMapping("/reject/{id}")
    public ResponseEntity<?> reject(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                    @PathVariable Long id,
                                    @RequestBody Map<String, String> body) {
        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        return ResponseEntity.ok(service.rejectAnswer(id, body.get("rejectedBy")));
    }

    private String extractRoleFromHeader(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        String token = authHeader.substring(7);
        return JwtUtil.extractRole(token);
    }

    private boolean isAdmin(String authHeader) {
        try {
            String role = extractRoleFromHeader(authHeader);
            return role != null && role.equalsIgnoreCase("ROLE_ADMIN");
        } catch (Exception e) {
            return false;
        }
    }
}
