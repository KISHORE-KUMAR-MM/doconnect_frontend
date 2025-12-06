package com.example.admin.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.admin.entity.AdminLog;

public interface AdminLogRepository extends JpaRepository<AdminLog, Long> { 
	
}
