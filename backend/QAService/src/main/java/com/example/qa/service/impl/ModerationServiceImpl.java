package com.example.qa.service.impl;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.example.qa.entity.Answer;
import com.example.qa.entity.Question;
import com.example.qa.exception.ResourceNotFoundException;
import com.example.qa.repository.AnswerRepository;
import com.example.qa.repository.QuestionRepository;
import com.example.qa.service.ModerationService;

@Service
public class ModerationServiceImpl implements ModerationService {

    private final QuestionRepository questionRepo;
    private final AnswerRepository answerRepo;

    public ModerationServiceImpl(QuestionRepository questionRepo, AnswerRepository answerRepo) {
        this.questionRepo = questionRepo;
        this.answerRepo = answerRepo;
    }

    // ============================================================
    // APPROVE QUESTION
    // ============================================================
    @Override
    public Question approveQuestion(Long id, String admin) {
        Question q = questionRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));

        q.setStatus("APPROVED");
        q.setApprovedBy(admin);
        q.setRejectedBy(null);
        q.setUpdatedAt(LocalDateTime.now());

        return questionRepo.save(q);
    }

    // ============================================================
    // REJECT QUESTION
    // ============================================================
    @Override
    public Question rejectQuestion(Long id, String admin) {
        Question q = questionRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));

        q.setStatus("REJECTED");
        q.setRejectedBy(admin);
        q.setApprovedBy(null);
        q.setUpdatedAt(LocalDateTime.now());

        return questionRepo.save(q);
    }

    // ============================================================
    // CLOSE QUESTION THREAD
    // ============================================================
    @Override
    public Question closeQuestion(Long id, String admin) {
        Question q = questionRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));

        q.setClosed(true);
        q.setUpdatedAt(LocalDateTime.now());

        return questionRepo.save(q);
    }

    // ============================================================
    // MARK QUESTION AS RESOLVED
    // ============================================================
    @Override
    public Question resolveQuestion(Long id, String admin) {
        Question q = questionRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));

        q.setResolved(true);
        q.setUpdatedAt(LocalDateTime.now());

        return questionRepo.save(q);
    }

    // ============================================================
    // APPROVE ANSWER
    // ============================================================
    @Override
    public Answer approveAnswer(Long id, String admin) {
        Answer ans = answerRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Answer not found"));

        ans.setStatus("APPROVED");
        ans.setApprovedBy(admin);
        ans.setRejectedBy(null);

        return answerRepo.save(ans);
    }

    // ============================================================
    // REJECT ANSWER
    // ============================================================
    @Override
    public Answer rejectAnswer(Long id, String admin) {
        Answer ans = answerRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Answer not found"));

        ans.setStatus("REJECTED");
        ans.setRejectedBy(admin);
        ans.setApprovedBy(null);

        return answerRepo.save(ans);
    }
}
