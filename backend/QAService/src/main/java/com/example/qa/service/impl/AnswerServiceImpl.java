package com.example.qa.service.impl;

import java.util.List;
import org.springframework.stereotype.Service;

import com.example.qa.entity.Answer;
import com.example.qa.exception.ResourceNotFoundException;
import com.example.qa.repository.AnswerRepository;
import com.example.qa.service.AnswerService;
import com.example.qa.service.EmailService;

@Service
public class AnswerServiceImpl implements AnswerService {

    private final AnswerRepository repo;
    private final EmailService emailService;

    public AnswerServiceImpl(AnswerRepository repo, EmailService emailService) {
        this.repo = repo;
        this.emailService = emailService;
    }

    // ============================================================
    // USER → POST ANSWER (default status = PENDING + email admin)
    // ============================================================
    @Override
    public Answer postAnswer(Answer answer) {
        answer.setStatus("PENDING");
        answer.setApprovedBy(null);
        answer.setRejectedBy(null);

        Answer saved = repo.save(answer);

        // =======================
        // SEND EMAIL TO ADMINS
        // =======================
        String subject = "Action Required: New Answer Pending Approval";

        String body =
                "Dear Admin,\n\n" +
                "A new answer has been submitted and is awaiting approval.\n\n" +
                "Question ID: " + saved.getQuestionId() + "\n" +
                "Answer: " + nullSafe(saved.getAnswerText()) + "\n" +
                "Answered By: " + nullSafe(saved.getAnsweredBy()) + "\n\n" +
                "Please review it in the admin panel.\n\n" +
                "DoConnect Bot\n" +
                "Automated Email — Do not reply.";

        emailService.sendToAdmins(subject, body);

        return saved;
    }

    // ============================================================
    // USER → Get approved answers for a question
    // ============================================================
    @Override
    public List<Answer> getApprovedAnswers(Long questionId) {
        return repo.findByQuestionIdAndStatus(questionId, "APPROVED");
    }

    // ============================================================
    // ADMIN → Get pending answers
    // ============================================================
    @Override
    public List<Answer> getPendingAnswers() {
        return repo.findByStatus("PENDING");
    }

    // ============================================================
    // COMMON → Get answer by ID
    // ============================================================
    @Override
    public Answer getById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Answer not found with ID: " + id));
    }

    // ============================================================
    // COMMON → Get all answers for a question
    // ============================================================
    @Override
    public List<Answer> getAllAnswersForQuestion(Long questionId) {
        return repo.findByQuestionId(questionId);
    }

    // ============================================================
    // COMMON → Get answers posted by a user
    // ============================================================
    @Override
    public List<Answer> getAnswersByUser(String username) {
        return repo.findByAnsweredBy(username);
    }

    // ============================================================
    // ADMIN → APPROVE ANSWER (+ email user)
    // ============================================================
    @Override
    public Answer approveAnswer(Long id, String approvedBy) {
        Answer ans = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Answer not found with ID: " + id));

        ans.setStatus("APPROVED");
        ans.setApprovedBy(approvedBy);
        ans.setRejectedBy(null);

        Answer saved = repo.save(ans);

        String subject = "Your Answer Has Been Approved";

        String body =
                "Hello " + nullSafe(ans.getAnsweredBy()) + ",\n\n" +
                "Good news! Your answer on DoConnect has been approved.\n\n" +
                "Question ID: " + ans.getQuestionId() + "\n" +
                "Your Answer: " + nullSafe(ans.getAnswerText()) + "\n\n" +
                "Thanks for contributing!\n\n" +
                "DoConnect Team";

        emailService.sendToUser(ans.getAnsweredBy(), subject, body);

        return saved;
    }

    // ============================================================
    // ADMIN → REJECT ANSWER (+ email user)
    // ============================================================
    @Override
    public Answer rejectAnswer(Long id, String rejectedBy) {
        Answer ans = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Answer not found with ID: " + id));

        ans.setStatus("REJECTED");
        ans.setRejectedBy(rejectedBy);
        ans.setApprovedBy(null);

        Answer saved = repo.save(ans);

        String subject = "Your Answer Has Been Rejected";

        String body =
                "Hello " + nullSafe(ans.getAnsweredBy()) + ",\n\n" +
                "Unfortunately, your answer could not be approved.\n\n" +
                "Question ID: " + ans.getQuestionId() + "\n" +
                "Your Answer: " + nullSafe(ans.getAnswerText()) + "\n\n" +
                "You may revise and submit again.\n\n" +
                "DoConnect Team";

        emailService.sendToUser(ans.getAnsweredBy(), subject, body);

        return saved;
    }

    // ------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------
    private String nullSafe(String s) {
        return s == null ? "" : s;
    }
}
