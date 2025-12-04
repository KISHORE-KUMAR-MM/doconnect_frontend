package com.example.qa.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.qa.entity.Question;
import com.example.qa.security.JwtUtil;
import com.example.qa.service.QuestionService;

@CrossOrigin(origins = "http://127.0.0.1:5500")
@RestController
@RequestMapping("/api/question")
public class QuestionController {

    @Autowired
    private QuestionService service;

    // USER — Ask question (requires any authenticated user)
    @PostMapping("/ask")
    public ResponseEntity<?> ask(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                 @RequestBody Question question) {
        try {
            String role = extractRoleFromHeader(authHeader);
            if (role == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            Question saved = service.askQuestion(question);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid or expired token"));
        }
    }

    // USER — get only approved questions
    @GetMapping("/approved")
    public List<Question> approved() {
        return service.getAllApprovedQuestions();
    }

    // ADMIN — get pending questions (requires ROLE_ADMIN)
    @GetMapping("/pending")
    public ResponseEntity<?> pending(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        return ResponseEntity.ok(service.getPendingQuestions());
    }

    // ANYONE — get question by id
    @GetMapping("/get/{id}")
    public Question getById(@PathVariable Long id) {
        return service.getById(id);
    }

    // Search
    @GetMapping("/search/{keyword}")
    public List<Question> search(@PathVariable String keyword) {
        return service.search(keyword);
    }

    // ADMIN — Approve
    @PutMapping("/approve/{id}")
    public ResponseEntity<?> approve(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                     @PathVariable Long id,
                                     @RequestBody Map<String, String> body) {
        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        return ResponseEntity.ok(service.approveQuestion(id, body.get("approvedBy")));
    }

    // ADMIN — Reject
    @PutMapping("/reject/{id}")
    public ResponseEntity<?> reject(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                    @PathVariable Long id,
                                    @RequestBody Map<String, String> body) {
        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        return ResponseEntity.ok(service.rejectQuestion(id, body.get("rejectedBy")));
    }

    // ADMIN — Close question
    @PutMapping("/close/{id}")
    public ResponseEntity<?> close(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                   @PathVariable Long id) {
        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        return ResponseEntity.ok(service.closeQuestion(id));
    }

    // ADMIN — Get ALL questions (approved + pending + rejected)
    @GetMapping("/all")
    public ResponseEntity<?> getAllQuestions(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        return ResponseEntity.ok(service.getAllQuestions());
    }

    // ADMIN — Update question (edit)
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateQuestion(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                            @PathVariable Long id,
                                            @RequestBody Question q) {
        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        return ResponseEntity.ok(service.updateQuestion(id, q));
    }

    // ADMIN — Delete question
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteQuestion(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                            @PathVariable Long id) {
        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        service.deleteQuestion(id);
        return ResponseEntity.ok().build();
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
