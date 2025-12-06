package com.example.qa.controller;

import java.time.LocalDateTime;
import java.util.Map;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;
import com.example.qa.entity.ChatMessage;
import com.example.qa.service.ChatService;

@Controller
public class ChatWebSocketController {

    private final ChatService chatService;

    public ChatWebSocketController(ChatService chatService) {
        this.chatService = chatService;
    }

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(@Payload Map<String, String> messageMap, 
                                   SimpMessageHeaderAccessor headerAccessor) {
        
        String username = messageMap.get("username");
        String message = messageMap.get("message");
        String sessionId = messageMap.getOrDefault("sessionId", "default");

        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setUsername(username);
        chatMessage.setMessage(message);
        chatMessage.setSessionId(sessionId);
        chatMessage.setTimestamp(LocalDateTime.now());

        // Save message to database
        chatService.saveMessage(chatMessage);

        return chatMessage;
    }

    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public ChatMessage addUser(@Payload Map<String, String> messageMap,
                               SimpMessageHeaderAccessor headerAccessor) {
        
        String username = messageMap.get("username");
        String sessionId = messageMap.getOrDefault("sessionId", "default");

        headerAccessor.getSessionAttributes().put("username", username);
        headerAccessor.getSessionAttributes().put("sessionId", sessionId);

        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setUsername("System");
        chatMessage.setMessage(username + " joined the chat!");
        chatMessage.setSessionId(sessionId);
        chatMessage.setTimestamp(LocalDateTime.now());

        return chatMessage;
    }
}

