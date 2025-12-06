package com.example.qa.dto;

import lombok.Data;

@Data
public class QuestionDto {
    private String topic;
    private String title;
    private String description;
    private String postedBy;
}
