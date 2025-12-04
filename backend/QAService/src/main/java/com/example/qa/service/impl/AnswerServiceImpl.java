package com.example.qa.service.impl;

import java.util.List;
import org.springframework.stereotype.Service;
import com.example.qa.entity.Answer;
import com.example.qa.repository.AnswerRepository;
import com.example.qa.service.AnswerService;

@Service
public class AnswerServiceImpl implements AnswerService {

    private final AnswerRepository repo;

    public AnswerServiceImpl(AnswerRepository repo) {
        this.repo = repo;
    }

    @Override
    public Answer postAnswer(Answer answer) {
        answer.setStatus("PENDING");
        answer.setApprovedBy(null);
        answer.setRejectedBy(null);
        return repo.save(answer);
    }

    @Override
    public List<Answer> getApprovedAnswers(Long questionId) {
        return repo.findByQuestionIdAndStatus(questionId, "APPROVED");
    }

    @Override
    public List<Answer> getPendingAnswers() {
        return repo.findByStatus("PENDING");
    }

    @Override
    public Answer approveAnswer(Long id, String approvedBy) {
        Answer ans = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Answer not found"));

        ans.setStatus("APPROVED");
        ans.setApprovedBy(approvedBy);
        ans.setRejectedBy(null);
        return repo.save(ans);
    }

    @Override
    public Answer rejectAnswer(Long id, String rejectedBy) {
        Answer ans = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Answer not found"));

        ans.setStatus("REJECTED");
        ans.setRejectedBy(rejectedBy);
        ans.setApprovedBy(null);
        return repo.save(ans);
    }
}
