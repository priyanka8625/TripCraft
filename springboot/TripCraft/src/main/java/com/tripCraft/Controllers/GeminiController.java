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
    @PostMapping("/itinerary/generate")
    public ResponseEntity<?> generateItinerary(@RequestBody ItineraryRequest request) {
        try {
            String prompt = buildPrompt(request);
            String jsonResponse = geminiService.getGeminiResponse(prompt);

            System.out.println("Generated JSON Response: " + jsonResponse); // Debugging log

            return ResponseEntity.ok().body(jsonResponse);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

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

    // Existing method for building itinerary prompt
    private String buildPrompt(ItineraryRequest request) {
        return String.format("""
            Generate a travel itinerary in JSON format with these requirements:
            - Destination: %s
            - Duration: %d days (%s to %s)
            - Budget: $%.2f
            - People: %d
            - Interest: %s
            
            Structure:
            {
              "activities": [
                {
                  "day": 1,
                  "date": "2024-06-10",
                  "name": "Visit Eiffel Tower",
                  "location": "Paris, France",
                  "image": "url",
                  "time_slot": "10:00 AM - 12:00 PM",
                  "estimated_cost": 20.00
                }
              ]
            }
            
            Ensure the JSON is valid, escape quotes properly, and maintain the exact structure.
            """, 
            request.destination(), request.days(), request.startDate(), 
            request.endDate(), request.budget(), request.people(), request.interest());
    }
}

