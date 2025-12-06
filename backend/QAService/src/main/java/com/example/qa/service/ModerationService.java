package com.example.qa.service;

import com.example.qa.entity.Answer;
import com.example.qa.entity.Question;

public interface ModerationService {

    Question approveQuestion(Long id, String admin);

    Question rejectQuestion(Long id, String admin);

    Question closeQuestion(Long id, String admin);

    Question resolveQuestion(Long id, String admin);

    Answer approveAnswer(Long id, String admin);

    Answer rejectAnswer(Long id, String admin);
}
