package com.example.qa.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.qa.entity.Answer;

public interface AnswerRepository extends JpaRepository<Answer, Long> {

    List<Answer> findByStatus(String status);

    List<Answer> findByQuestionIdAndStatus(Long questionId, String status);
}
