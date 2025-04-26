package com.tripCraft.Services;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripCraft.model.Itinerary;
import com.tripCraft.model.ItineraryRequest;
import com.tripCraft.model.Trip;
@Service
public class GeminiService {

    @Value("${gemini.api.url}")
    private String apiUrl;

    @Value("${gemini.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String getGeminiResponse(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-goog-api-key", apiKey);

        String requestBody = String.format("""
            {
              "contents": [{
                "parts": [{
                  "text": "%s"
                }]
              }]
            }
            """, prompt.replace("\"", "\\\""));

        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, entity, String.class);
            String rawResponse = response.getBody();
            System.out.println("Gemini API Raw Response: " + rawResponse);

            if (response.getStatusCode().is2xxSuccessful()) {
                return extractJsonFromResponse(rawResponse);
            }
            throw new RuntimeException("API request failed: " + response.getStatusCode());
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error calling Gemini API: " + e.getMessage());
        }
    }

    private String extractJsonFromResponse(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode parts = candidates.get(0).path("content").path("parts");
                if (parts.isArray() && parts.size() > 0) {
                    String text = parts.get(0).path("text").asText();
                    // Clean markdown if present
                    return text
                        .replaceAll("```json\\s*", "")
                        .replaceAll("```\\s*", "")
                        .trim();
                }
            }
            throw new RuntimeException("Unexpected response structure: " + response);
        } catch (Exception e) {
            throw new RuntimeException("Error parsing response: " + e.getMessage(), e);
        }
    }
    public  Itinerary callGeminiService(Trip trip) {
        ItineraryRequest itineraryRequest = new ItineraryRequest(
            trip.getDestination(),
            1, // Default people
            calculateDays(trip.getStartDate(), trip.getEndDate()),
            trip.getStartDate().format(DateTimeFormatter.ISO_LOCAL_DATE),
            trip.getEndDate().format(DateTimeFormatter.ISO_LOCAL_DATE),
            trip.getBudget(),
            "general" // Default interest
        );

        ResponseEntity<?> response = geminiController.generateItinerary(itineraryRequest);
        if (response.getStatusCode() != HttpStatus.OK) {
            throw new RuntimeException("Failed to generate itinerary from Gemini: " + response.getBody());
        }

        String jsonResponse = (String) response.getBody();
        try {
            // Clean the response to remove markdown backticks
            String cleanedJson = cleanJsonResponse(jsonResponse);

            // Extract and save spots into MongoDB
            saveSpotsToMongo(cleanedJson, trip.getDestination());

            // Convert entire JSON to Itinerary object
            return objectMapper.readValue(cleanedJson, Itinerary.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Gemini response: " + e.getMessage(), e);
        }
    }
    private int calculateDays(LocalDate startDate, LocalDate endDate) {
        return (int) java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1;
    }
}