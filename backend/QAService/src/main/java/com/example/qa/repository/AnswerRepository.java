package com.example.qa.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.qa.entity.Answer;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, Long> {

    // Get all answers by status (PENDING / APPROVED / REJECTED)
    List<Answer> findByStatus(String status);

    // Get answers for a question filtered by status
    List<Answer> findByQuestionIdAndStatus(Long questionId, String status);

    // Get all answers for a given question (regardless of status)
    List<Answer> findByQuestionId(Long questionId);

    // Get all answers posted by a specific user
    List<Answer> findByAnsweredBy(String answeredBy);
}
