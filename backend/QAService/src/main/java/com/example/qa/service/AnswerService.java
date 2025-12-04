package com.example.qa.service;

import java.util.List;
import com.example.qa.entity.Answer;

public interface AnswerService {

    Answer postAnswer(Answer answer);

    List<Answer> getApprovedAnswers(Long questionId);

    List<Answer> getPendingAnswers();

    Answer approveAnswer(Long id, String approvedBy);

    Answer rejectAnswer(Long id, String rejectedBy);
}
