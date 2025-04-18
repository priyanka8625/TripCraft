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
            You are a smart travel planner. Based on the following travel plan:
            {
              "title": "Summer Vacation",
              "destination": "%s",
              "startDate": "%s",
              "endDate": "%s",
              "budget": %.2f,
              "preferences": ["%s"],
              "people": %d,
              "collaborators": []
            }

            Generate a JSON itinerary with two parts:
            1. "activities" – a list of daily travel activities, each with:
               - day (number),
               - date (yyyy-mm-dd),
               - name (of the activity),
               - location,
               - image (URL),
               - timeSlot (e.g., Morning, Afternoon),
               - estimatedCost (in INR)

            2. "spots" –  Provide a rich list of **at least 25 unique tourist spots** near the destination. Include popular, offbeat, cultural, nature, and adventure spots.
              - name,
               - location,
               - category (e.g., nature, cultural, shopping),
               - rating (1 to 5),
               - estimatedCost (approx. in INR),
               - timeSlot

            Make sure the response is in **pure JSON** format like:
            {
              "activities": [ ... ],
              "spots": [ ... ]
            }
            """,
            request.destination(),
            request.startDate(),
            request.endDate(),
            request.budget(),
            request.interest(),
            request.people()
        );
    }
}


