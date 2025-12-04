package com.example.qa.service.impl;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.qa.entity.Question;
import com.example.qa.repository.QuestionRepository;
import com.example.qa.service.QuestionService;

@Service
public class QuestionServiceImpl implements QuestionService {

    @Autowired
    private QuestionRepository repo;

    @Override
    public Question askQuestion(Question question) {
        question.setStatus("PENDING");
        return repo.save(question);
    }

    @Override
    public List<Question> getAllApprovedQuestions() {
        return repo.findByStatus("APPROVED");
    }

    @Override
    public List<Question> getPendingQuestions() {
        return repo.findByStatus("PENDING");
    }

    @Override
    public Question approveQuestion(Long id, String approvedBy) {
        Question q = repo.findById(id).orElseThrow();
        q.setStatus("APPROVED");
        q.setApprovedBy(approvedBy);
        return repo.save(q);
    }

    @Override
    public Question rejectQuestion(Long id, String rejectedBy) {
        Question q = repo.findById(id).orElseThrow();
        q.setStatus("REJECTED");
        q.setPostedBy(rejectedBy);
        return repo.save(q);
    }

    @Override
    public Question closeQuestion(Long id) {
        Question q = repo.findById(id).orElseThrow();
        q.setStatus("CLOSED");
        return repo.save(q);
    }

    @Override
    public Question getById(Long id) {
        return repo.findById(id).orElseThrow();
    }

    @Override
    public List<Question> search(String keyword) {
        return repo.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(keyword, keyword);
    }

    @Override
    public void deleteQuestion(Long id) {
        repo.deleteById(id);
    }

    @Override
    public List<Question> getAllQuestions() {
        return repo.findAll();
    }

    @Override
    public Question updateQuestion(Long id, Question updated) {
        Question q = repo.findById(id).orElseThrow();

        if (updated.getTopic() != null) q.setTopic(updated.getTopic());
        if (updated.getTitle() != null) q.setTitle(updated.getTitle());
        if (updated.getDescription() != null) q.setDescription(updated.getDescription());

        return repo.save(q);
    }
}
