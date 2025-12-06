package com.example.qa.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.*;

import com.example.qa.entity.Question;
import com.example.qa.service.QuestionService;

@CrossOrigin(origins = "http://127.0.0.1:5500")
@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    private final QuestionService service;

    public QuestionController(QuestionService service) {
        this.service = service;
    }

    // ============================================================
    // USER → Ask question
    // ============================================================
    @PostMapping("/ask")
    public Question askQuestion(@RequestBody Question question) {
        return service.askQuestion(question);
    }

    // ============================================================
    // USER → View approved questions
    // ============================================================
    @GetMapping("/approved")
    public List<Question> getApprovedQuestions() {
        return service.getAllApprovedQuestions();
    }

    // ============================================================
    // ADMIN → View all pending questions
    // ============================================================
    @GetMapping("/pending")
    public List<Question> getPendingQuestions() {
        return service.getPendingQuestions();
    }

    // ============================================================
    // ADMIN → Approve question
    // ============================================================
    @PutMapping("/approve/{id}")
    public Question approve(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        return service.approveQuestion(id, body.get("approvedBy"));
    }

    // ============================================================
    // ADMIN → Reject question
    // ============================================================
    @PutMapping("/reject/{id}")
    public Question reject(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        return service.rejectQuestion(id, body.get("rejectedBy"));
    }

    // ============================================================
    // ADMIN → Close question thread
    // ============================================================
    @PutMapping("/close/{id}")
    public Question close(@PathVariable Long id) {
        return service.closeQuestion(id);
    }

    // ============================================================
    // ADMIN → Mark question as resolved
    // ============================================================
    @PutMapping("/resolve/{id}")
    public Question resolve(@PathVariable Long id) {
        return service.resolveQuestion(id);
    }

    // ============================================================
    // USER / ADMIN → Get question by ID
    // ============================================================
    @GetMapping("/{id}")
    public Question getById(@PathVariable Long id) {
        return service.getById(id);
    }

    // ============================================================
    // USER / ADMIN → Search questions
    // ============================================================
    @GetMapping("/search")
    public List<Question> search(@RequestParam String keyword) {
        return service.search(keyword);
    }

    // ============================================================
    // ADMIN → Delete question
    // ============================================================
    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        service.deleteQuestion(id);
        return "Question deleted successfully";
    }

    // ============================================================
    // ADMIN → Update question (topic/title/description)
    // ============================================================
    @PutMapping("/update/{id}")
    public Question update(
            @PathVariable Long id,
            @RequestBody Question updated
    ) {
        return service.updateQuestion(id, updated);
    }
}
