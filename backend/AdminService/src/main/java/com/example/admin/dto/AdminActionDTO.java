package com.example.admin.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminActionDTO {
    private String adminUsername;
    private String action;
    private String targetType;
    private Long targetId;
}
