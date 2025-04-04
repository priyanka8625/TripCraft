package com.tripCraft.Services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class GeminiService {

    @Value("${gemini.api.url}")
    private String apiUrl;

    @Value("${gemini.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

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

        System.out.println("Gemini API Response: " + response.getBody()); // Debugging

        if (response.getStatusCode().is2xxSuccessful()) {
            return extractJsonFromResponse(response.getBody());
        }
        throw new RuntimeException("API request failed: " + response.getStatusCode());
    } catch (Exception e) {
        e.printStackTrace();
        throw new RuntimeException("Error calling Gemini API: " + e.getMessage());
    }
}
   private final ObjectMapper objectMapper = new ObjectMapper();

    private String extractJsonFromResponse(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode parts = candidates.get(0).path("content").path("parts");
                if (parts.isArray() && parts.size() > 0) {
                    return parts.get(0).path("text").asText();
                }
            }
            throw new RuntimeException("Unexpected response structure: " + response);
        } catch (Exception e) {
            throw new RuntimeException("Error parsing response: " + e.getMessage(), e);
        }
    }


}
