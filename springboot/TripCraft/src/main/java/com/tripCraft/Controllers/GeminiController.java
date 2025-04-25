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

            System.out.println("Gemini Response (spots only): " + jsonResponse);

            // Extract just the "spots" array
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(jsonResponse);
            JsonNode spotsNode = rootNode.path("spots");

            if (spotsNode.isMissingNode()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("{\"error\": \"Spots array not found in the response.\"}");
            }

            return ResponseEntity.ok(spotsNode);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    private String buildSpotsPrompt(String destination) {
        return String.format("""
            You are a travel expert. Provide a list of at least 25 unique tourist "spots" near or in %s.
            Include a mix of:
            - popular,
            - offbeat,
            - cultural,
            - nature,
            - adventure spots.

            Return only JSON with the key "spots" like:
            {
              "spots": [
                {
                  "name": "",
                  "location": "",
                  "category": "",
                  "rating": 0,
                  "estimatedCost": 0,
                  "timeSlot": "",
                  "longitude": 0.0,
                  "latitude": 0.0
                },
                ...
              ]
            }
            """, destination);
    }
}
