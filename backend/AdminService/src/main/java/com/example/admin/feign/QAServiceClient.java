package com.example.admin.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "QA-SERVICE")
public interface QAServiceClient {

    @PutMapping("/api/qa/questions/approve/{id}")
    Object approveQuestion(@PathVariable Long id);

    @PutMapping("/api/qa/answers/approve/{id}")
    Object approveAnswer(@PathVariable Long id);

    @DeleteMapping("/api/qa/questions/{id}")
    Object deleteQuestion(@PathVariable Long id);

    @DeleteMapping("/api/qa/answers/{id}")
    Object deleteAnswer(@PathVariable Long id);
}
