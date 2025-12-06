package com.example.qa.service;

import java.util.List;
import com.example.qa.entity.Question;

public interface QuestionService {

    Question askQuestion(Question question);

    List<Question> getAllApprovedQuestions();

    List<Question> getPendingQuestions();

    Question getById(Long id);

    List<Question> search(String keyword);

    void deleteQuestion(Long id);

    List<Question> getAllQuestions();

    Question updateQuestion(Long id, Question updated);

    List<Question> getQuestionsByTopic(String topic);

    // ADMIN operations
    Question approveQuestion(Long id, String approvedBy);

    Question rejectQuestion(Long id, String rejectedBy);

    Question closeQuestion(Long id);

    Question resolveQuestion(Long id);
}
