package com.tripCraft.Controllers;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tripCraft.Services.GeminiService;

@RestController
@RequestMapping("/api/itinerary")
public class GeminiController {

    @Autowired
    private GeminiService geminiService;

    @PostMapping("/generate")
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
