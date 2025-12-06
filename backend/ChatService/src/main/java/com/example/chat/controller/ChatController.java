package com.example.chat.controller;

import java.util.List;
import org.springframework.web.bind.annotation.*;
import com.example.chat.dto.ChatMessageDto;
import com.example.chat.service.ChatService;

@CrossOrigin(origins = {"http://localhost:5500", "http://127.0.0.1:5500", "http://localhost:3000"})
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping("/history/{sessionId}")
    public List<ChatMessageDto> getChatHistory(@PathVariable String sessionId) {
        return chatService.getChatHistory(sessionId);
    }

    @GetMapping("/user/{username}")
    public List<ChatMessageDto> getMessagesByUser(@PathVariable String username) {
        return chatService.getMessagesByUser(username);
    }
}

