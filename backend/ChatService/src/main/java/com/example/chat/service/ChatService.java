package com.example.chat.service;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.chat.entity.ChatMessage;
import com.example.chat.repository.ChatMessageRepository;
import com.example.chat.dto.ChatMessageDto;

@Service
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;

    public ChatService(ChatMessageRepository chatMessageRepository) {
        this.chatMessageRepository = chatMessageRepository;
    }

    @Transactional
    public ChatMessage saveMessage(ChatMessage message) {
        return chatMessageRepository.save(message);
    }

    public List<ChatMessageDto> getChatHistory(String sessionId) {
        List<ChatMessage> messages = chatMessageRepository.findBySessionIdOrderByTimestampAsc(sessionId);
        return messages.stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<ChatMessageDto> getMessagesByUser(String username) {
        List<ChatMessage> messages = chatMessageRepository.findByUsernameOrderByTimestampAsc(username);
        return messages.stream().map(this::toDto).collect(Collectors.toList());
    }

    private ChatMessageDto toDto(ChatMessage message) {
        ChatMessageDto dto = new ChatMessageDto();
        dto.setId(message.getId());
        dto.setUsername(message.getUsername());
        dto.setMessage(message.getMessage());
        dto.setTimestamp(message.getTimestamp());
        dto.setSessionId(message.getSessionId());
        return dto;
    }
}

