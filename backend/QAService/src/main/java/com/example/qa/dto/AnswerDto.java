package com.example.qa.dto;

import lombok.Data;

@Data
public class AnswerDto {
    private Long questionId;
    private String answerText;
    private String answeredBy;
}
