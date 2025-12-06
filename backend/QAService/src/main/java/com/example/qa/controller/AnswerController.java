package com.example.qa.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.*;

import com.example.qa.entity.Answer;
import com.example.qa.service.AnswerService;

@CrossOrigin(origins = {"http://localhost:5500", "http://localhost:3000"})
@RestController
@RequestMapping("/api/answers")
public class AnswerController {

    private final AnswerService service;

    public AnswerController(AnswerService service) {
        this.service = service;
    }

    // ============================================================
    // USER → POST ANSWER (automatically saved as PENDING)
    // ============================================================
    @PostMapping("/post")
    public Answer postAnswer(@RequestBody Answer answer) {
        return service.postAnswer(answer);
    }

    // ============================================================
    // USER → Get APPROVED answers for a question
    // ============================================================
    @GetMapping("/question/{questionId}")
    public List<Answer> getApprovedAnswers(@PathVariable Long questionId) {
        return service.getApprovedAnswers(questionId);
    }

    // ============================================================
    // ADMIN → Get all PENDING answers for moderation
    // ============================================================
    @GetMapping("/pending")
    public List<Answer> getPendingAnswers() {
        return service.getPendingAnswers();
    }

    // ============================================================
    // ADMIN → Approve answer
    // ============================================================
    @PutMapping("/approve/{id}")
    public Answer approve(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return service.approveAnswer(id, body.get("approvedBy"));
    }

    // ============================================================
    // ADMIN → Reject answer
    // ============================================================
    @PutMapping("/reject/{id}")
    public Answer reject(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return service.rejectAnswer(id, body.get("rejectedBy"));
    }
}
