package com.example.admin.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.example.admin.dto.AdminActionDTO;
import com.example.admin.entity.AdminLog;
import com.example.admin.repository.AdminLogRepository;

@Service
public class AdminService {

    private final AdminLogRepository logRepo;

    public AdminService(AdminLogRepository logRepo) {
        this.logRepo = logRepo;
    }

    public void recordAction(AdminActionDTO dto) {

        AdminLog log = new AdminLog();
        log.setAdminUsername(dto.getAdminUsername());
        log.setAction(dto.getAction());
        log.setTargetType(dto.getTargetType());
        log.setTargetId(dto.getTargetId());
        log.setTimestamp(LocalDateTime.now().toString());

        logRepo.save(log);
    }
}
