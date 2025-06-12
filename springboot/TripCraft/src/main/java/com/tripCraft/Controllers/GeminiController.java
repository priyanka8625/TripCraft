package com.tripCraft.Controllers;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.tripCraft.Services.GeminiService;
import com.tripCraft.model.ItineraryRequest;

@RestController
@RequestMapping("/api")
public class GeminiController {

    @Autowired
    private GeminiService geminiService;

    // Existing endpoint for itinerary generation
//    @PostMapping("/itinerary/generate")
//    public ResponseEntity<?> generateItinerary(@RequestBody ItineraryRequest request) {
//        try {
//            String prompt = buildPrompt(request);
//            String jsonResponse = geminiService.getGeminiResponse(prompt);
//
//            System.out.println("Generated JSON Response: " + jsonResponse); // Debugging log
//
//            return ResponseEntity.ok().body(jsonResponse);
//        } catch (Exception e) {
//            e.printStackTrace();
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body("{\"error\": \"" + e.getMessage() + "\"}");
//        }
//    }

    // New endpoint for general chatbot interaction
    @PostMapping("/chatbot/chat")
    public ResponseEntity<?> chat(@RequestBody String userPrompt) {
        try {
            // Directly pass the user's prompt to GeminiService
            String response = geminiService.getGeminiResponse(userPrompt);

            System.out.println("Chatbot Response: " + response); // Debugging log

            return ResponseEntity.ok().body(Map.of("message",response));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
    @PostMapping("/generateSpotsAndHotels")
    public ResponseEntity<String> generateSpotsAndHotels(@RequestParam String destination) {
        try {
            String prompt = geminiService.buildPrompt(destination);
            String response = geminiService.getGeminiResponse(prompt);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("Error generating spots and hotels: " + e.getMessage());
        }
    }

 
}


