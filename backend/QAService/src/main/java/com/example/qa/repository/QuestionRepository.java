package com.example.qa.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.qa.entity.Question;

public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findByStatus(String status);

    List<Question> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            String title, String description
    );
}
