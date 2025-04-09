/*
 * package com.tripCraft.securityConfig; import
 * org.springframework.ai.chat.client.ChatClient; import
 * org.springframework.context.annotation.Bean; import
 * org.springframework.context.annotation.Configuration; import
 * org.springframework.web.client.RestClient; import
 * org.springframework.ai.chat.client.ChatClient; import
 * org.springframework.context.annotation.Bean; import
 * org.springframework.context.annotation.Configuration; import
 * org.springframework.web.client.RestClient;
 * 
 * @Configuration public class AiConfig {
 * 
 * @Bean public GeminiChatClient geminiChatClient() { String apiKey =
 * System.getenv("GEMINI_API_KEY"); // or fetch from properties
 * 
 * RestClient restClient = RestClient.builder()
 * .baseUrl("https://generativelanguage.googleapis.com/v1beta/models")
 * .defaultHeader("Content-Type", "application/json")
 * .defaultHeader("x-goog-api-key", apiKey) .build();
 * 
 * GeminiChatOptions options = GeminiChatOptions.builder()
 * .withModel("gemini-pro") .build();
 * 
 * return new GeminiChatClient(restClient, options); }
 * 
 * @Bean public ChatClient chatClient(GeminiChatClient geminiChatClient) {
 * return ChatClient.create(geminiChatClient); } }
 */