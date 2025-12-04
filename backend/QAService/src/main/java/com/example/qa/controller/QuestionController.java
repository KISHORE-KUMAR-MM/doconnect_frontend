package com.example.qa.controller;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.qa.entity.Question;
import com.example.qa.service.QuestionService;

@CrossOrigin(origins = "http://127.0.0.1:5500")
@RestController
@RequestMapping("/api/question")
public class QuestionController {

    @Autowired
    private QuestionService service;

    // USER — Ask question
    @PostMapping("/ask")
    public Question ask(@RequestBody Question question) {
        return service.askQuestion(question);
    }

    // USER — get only approved questions
    @GetMapping("/approved")
    public List<Question> approved() {
        return service.getAllApprovedQuestions();
    }

    // ADMIN — get pending questions
    @GetMapping("/pending")
    public List<Question> pending() {
        return service.getPendingQuestions();
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
    public Question approve(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return service.approveQuestion(id, body.get("approvedBy"));
    }

    // ADMIN — Reject
    @PutMapping("/reject/{id}")
    public Question reject(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return service.rejectQuestion(id, body.get("rejectedBy"));
    }

    // ADMIN — Close question
    @PutMapping("/close/{id}")
    public Question close(@PathVariable Long id) {
        return service.closeQuestion(id);
    }

    // ADMIN — Get ALL questions (approved + pending + rejected)
    @GetMapping("/all")
    public List<Question> getAllQuestions() {
        return service.getAllQuestions();
    }

    // ADMIN — Update question (edit)
    @PutMapping("/update/{id}")
    public Question updateQuestion(@PathVariable Long id, @RequestBody Question q) {
        return service.updateQuestion(id, q);
    }

    // ADMIN — Delete question
    @DeleteMapping("/delete/{id}")
    public void deleteQuestion(@PathVariable Long id) {
        service.deleteQuestion(id);
    }
}
