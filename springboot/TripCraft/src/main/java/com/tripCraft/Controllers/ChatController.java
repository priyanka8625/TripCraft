//package com.tripCraft.Controllers;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import com.tripCraft.Services.ChatBotService;
//
//import java.util.Map;
//
//@RestController
//@RequestMapping("/api/chat")
//public class ChatController {
//
//    @Autowired
//    private ChatBotService chatBotService;
//
//    @PostMapping
//    public ResponseEntity<Map<String, String>> chatWithBot(@RequestBody Map<String, String> payload) {
//        String message = payload.get("message");
//
//        if (message == null || message.trim().isEmpty()) {
//            return ResponseEntity.badRequest().body(Map.of("error", "Message cannot be empty."));
//        }
//
//        String response = chatBotService.chat(message);
//        return ResponseEntity.ok(Map.of("response", response));
//    }
//}
