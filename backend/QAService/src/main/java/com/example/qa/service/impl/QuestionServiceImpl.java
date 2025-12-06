package com.example.qa.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.qa.entity.Question;
import com.example.qa.exception.ResourceNotFoundException;
import com.example.qa.repository.QuestionRepository;
import com.example.qa.service.EmailService;
import com.example.qa.service.QuestionService;

@Service
public class QuestionServiceImpl implements QuestionService {

    private final QuestionRepository repo;
    private final EmailService emailService;

    public QuestionServiceImpl(QuestionRepository repo, EmailService emailService) {
        this.repo = repo;
        this.emailService = emailService;
    }

    // ============================================================
    // USER → ASK QUESTION (PENDING + email to admins)
    // ============================================================
    @Override
    public Question askQuestion(Question question) {

        question.setStatus("PENDING");
        question.setPostedAt(LocalDateTime.now());
        question.setUpdatedAt(null);
        question.setApprovedBy(null);
        question.setRejectedBy(null);
        question.setClosed(false);
        question.setResolved(false);

        Question saved = repo.save(question);

        // ------------------------
        // Send Email To Admins
        // ------------------------
        String subject = "Action Required: New Question Pending Approval";

        String body = 
                "Dear Admin,\n\n" +
                "A new question has been submitted and is awaiting your approval.\n\n" +
                "Topic: " + nullSafe(saved.getTopic()) + "\n" +
                "Title: " + nullSafe(saved.getTitle()) + "\n" +
                "Description: " + nullSafe(saved.getDescription()) + "\n" +
                "Posted By: " + nullSafe(saved.getPostedBy()) + "\n\n" +
                "Please review the question in the admin panel.\n\n" +
                "DoConnect Bot\n" +
                "Automated Notification — Do not reply.";

        emailService.sendToAdmins(subject, body);

        return saved;
    }

    // ============================================================
    // USER → Get APPROVED questions
    // ============================================================
    @Override
    public List<Question> getAllApprovedQuestions() {
        return repo.findByStatus("APPROVED");
    }

    // ============================================================
    // ADMIN → Get PENDING questions
    // ============================================================
    @Override
    public List<Question> getPendingQuestions() {
        return repo.findByStatus("PENDING");
    }

    // ============================================================
    // GET BY ID
    // ============================================================
    @Override
    public Question getById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with ID: " + id));
    }

    // ============================================================
    // SEARCH TITLE + DESCRIPTION
    // ============================================================
    @Override
    public List<Question> search(String keyword) {
        return repo.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(keyword, keyword);
    }

    // ============================================================
    // ADMIN → APPROVE QUESTION (+ email user)
    // ============================================================
    @Override
    public Question approveQuestion(Long id, String approvedBy) {

        Question q = getById(id);

        q.setStatus("APPROVED");
        q.setApprovedBy(approvedBy);
        q.setRejectedBy(null);
        q.setUpdatedAt(LocalDateTime.now());

        Question updated = repo.save(q);

        // ------------------------
        // Email User
        // ------------------------
        String subject = "Your Question Has Been Approved";

        String body =
                "Hello " + nullSafe(q.getPostedBy()) + ",\n\n" +
                "Good news! Your question has been approved by the admin team.\n\n" +
                "Title: " + nullSafe(q.getTitle()) + "\n" +
                "Description: " + nullSafe(q.getDescription()) + "\n\n" +
                "Thank you for contributing.\n\n" +
                "DoConnect Team";

        emailService.sendToUser(q.getPostedBy(), subject, body);

        return updated;
    }

    // ============================================================
    // ADMIN → REJECT QUESTION (+ email user)
    // ============================================================
    @Override
    public Question rejectQuestion(Long id, String rejectedBy) {

        Question q = getById(id);

        q.setStatus("REJECTED");
        q.setRejectedBy(rejectedBy);
        q.setApprovedBy(null);
        q.setUpdatedAt(LocalDateTime.now());

        Question updated = repo.save(q);

        // ------------------------
        // Email User
        // ------------------------
        String subject = "Your Question Has Been Rejected";

        String body =
                "Hello " + nullSafe(q.getPostedBy()) + ",\n\n" +
                "Unfortunately, your question could not be approved.\n\n" +
                "Title: " + nullSafe(q.getTitle()) + "\n" +
                "Description: " + nullSafe(q.getDescription()) + "\n\n" +
                "You may revise your question and submit it again.\n\n" +
                "DoConnect Team";

        emailService.sendToUser(q.getPostedBy(), subject, body);

        return updated;
    }

    // ============================================================
    // ADMIN → CLOSE QUESTION THREAD
    // ============================================================
    @Override
    public Question closeQuestion(Long id) {
        Question q = getById(id);
        q.setClosed(true);
        q.setUpdatedAt(LocalDateTime.now());
        return repo.save(q);
    }

    // ============================================================
    // ADMIN → MARK AS RESOLVED
    // ============================================================
    @Override
    public Question resolveQuestion(Long id) {
        Question q = getById(id);
        q.setResolved(true);
        q.setUpdatedAt(LocalDateTime.now());
        return repo.save(q);
    }

    // ============================================================
    // ADMIN → DELETE QUESTION
    // ============================================================
    @Override
    public void deleteQuestion(Long id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Question not found with ID: " + id);
        }
        repo.deleteById(id);
    }

    // ============================================================
    // GET ALL QUESTIONS (Admin Dashboard)
    // ============================================================
    @Override
    public List<Question> getAllQuestions() {
        return repo.findAll();
    }

    // ============================================================
    // UPDATE QUESTION
    // ============================================================
    @Override
    public Question updateQuestion(Long id, Question updatedData) {

        Question q = getById(id);

        if (updatedData.getTopic() != null) q.setTopic(updatedData.getTopic());
        if (updatedData.getTitle() != null) q.setTitle(updatedData.getTitle());
        if (updatedData.getDescription() != null) q.setDescription(updatedData.getDescription());

        q.setUpdatedAt(LocalDateTime.now());

        return repo.save(q);
    }

    // ============================================================
    // FILTER QUESTIONS BY TOPIC
    // ============================================================
    @Override
    public List<Question> getQuestionsByTopic(String topic) {
        return repo.findAll()
                .stream()
                .filter(q -> q.getTopic() != null && q.getTopic().equalsIgnoreCase(topic))
                .toList();
    }

    // Helper
    private String nullSafe(String s) {
        return s == null ? "" : s;
    }
}
