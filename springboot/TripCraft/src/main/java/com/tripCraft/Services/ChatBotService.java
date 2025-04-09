//package com.tripCraft.Services;
//
//import org.springframework.ai.chat.client.ChatClient;
//import org.springframework.ai.chat.messages.UserMessage;
//import org.springframework.ai.chat.prompt.Prompt;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//@Service
//public class ChatBotService {
//
//    private final ChatClient chatClient;
//
//    @Autowired
//    public ChatBotService(ChatClient chatClient) {
//        this.chatClient = chatClient;
//    }
//
//    public String chat(String userMessage) {
//        return chatClient.prompt()
//                .user(userMessage)
//                .call()
//                .content();
//    }
//}
