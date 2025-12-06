package com.example.qa.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.qa.entity.ChatMessage;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findBySessionIdOrderByTimestampAsc(String sessionId);
    List<ChatMessage> findByUsernameOrderByTimestampAsc(String username);
}

