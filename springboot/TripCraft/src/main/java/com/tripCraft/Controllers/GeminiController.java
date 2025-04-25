package com.tripCraft.Controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripCraft.Services.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class GeminiController {

    @Autowired
    private GeminiService geminiService;

    // Accept only destination and return tourist spots
    @PostMapping("/spots/generate")
    public ResponseEntity<?> generateDestinationData(@RequestBody String destination) {
    	 try {
             String prompt = buildSpotsPrompt(destination);
             String jsonResponse = geminiService.getGeminiResponse(prompt);

             System.out.println("Gemini Response (spots + hotels): " + jsonResponse);

             ObjectMapper mapper = new ObjectMapper();
             JsonNode rootNode = mapper.readTree(jsonResponse);

             JsonNode spotsNode = rootNode.path("spots");
             JsonNode hotelsNode = rootNode.path("hotels");

             if (spotsNode.isMissingNode() || hotelsNode.isMissingNode()) {
                 return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                         .body("{\"error\": \"Required data not found in response.\"}");
             }

             return ResponseEntity.ok(rootNode); // Send full JSON including both arrays
         } catch (Exception e) {
             e.printStackTrace();
             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                     .body("{\"error\": \"" + e.getMessage() + "\"}");
         }
    }

    private String buildSpotsPrompt(String destination) {
        return String.format("""
            You are a smart travel planning assistant. Your job is to help plan a trip to the destination: %s.

            You must return **only JSON** with exactly two keys:
            - "spots": A list of at least 25 unique tourist spots in or near %s.
            - "hotels": A total of 60 hotel/restaurants/lodges, categorized as follows:

            -------------------
            1. SPOTS FORMAT:
            -------------------
            Each spot must include:
            {
              "name": "",
              "location": "",
              "category": "", // popular, offbeat, cultural, nature, or adventure
              "rating": 0.0,
              "estimatedCost": 0,
              "timeSlot": "",
              "longitude": 0.0,
              "latitude": 0.0
            }

            -------------------
            2. HOTELS FORMAT:
            -------------------
            Provide exactly:
            - 30 entries where `stayType` is "Lunch"
            - 30 entries where `stayType` is "Dinner and Stay"

            Within each group (Lunch / Dinner and Stay), include:
            - 10 hotels with **low price**
            - 10 hotels with **medium price**
            - 10 hotels with **high price**

            Hotel data format must match the stayType:

            --- For Lunch ---
            {
              "name": "",
              "location": "",
              "category": "", // eg. restaurant, café
              "rating": 0.0,
              "pricePerPerson": 0,
              "stayType": "Lunch",
              "longitude": 0.0,
              "latitude": 0.0,
              "nearbySpot": ""
            }

            --- For Dinner and Stay ---
            {
              "name": "",
              "location": "",
              "category": "", // eg. hotel, lodge, resort
              "rating": 0.0,
              "pricePerNight": 0,
              "stayType": "Dinner and Stay",
              "longitude": 0.0,
              "latitude": 0.0,
              "nearbySpot": ""
            }

            -------------------
            IMPORTANT RULES:
            -------------------
            - Do not return any explanation or extra text. Only valid JSON.
            - Use realistic locations and GPS coordinates.
            - Ensure each hotel references a tourist spot from the "spots" list using "nearbySpot".
            - Sort prices in each group (Lunch / Dinner and Stay) from low to high.
            """, destination, destination);
    }

}
