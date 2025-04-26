package com.tripCraft.Services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.tripCraft.model.AIActivity;
import com.tripCraft.model.Activity;
import com.tripCraft.model.Destination;
import com.tripCraft.model.PythonItinerary;
import com.tripCraft.model.Trip;
import com.tripCraft.repository.DestinationRepository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class PythonService {

    @Value("${python.service.url}") // Define in application.properties/yml
    private String pythonServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @Autowired
    private DestinationRepository destinationRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public PythonItinerary getItineraryFromPython(Trip trip) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Trip> requestEntity = new HttpEntity<>(trip, headers);

        ResponseEntity<PythonItinerary> response = restTemplate.exchange(
            pythonServiceUrl + "/generate-itinerary",
            HttpMethod.POST,
            requestEntity,
            PythonItinerary.class
        );

        return response.getBody();
    }

    private void saveSpotsToMongo(String cleanedJson, String destinationName) {
        try {
            JsonNode rootNode = objectMapper.readTree(cleanedJson);
            JsonNode spotsNode = rootNode.get("spots");

            if (spotsNode != null && spotsNode.isArray()) {
                List<Destination.Spot> spots = new ArrayList<>();
                for (JsonNode spotNode : spotsNode) {
                    Destination.Spot spot = objectMapper.treeToValue(spotNode, Destination.Spot.class);
                    spots.add(spot);
                }

                Destination destination = new Destination();
                destination.setDestination(destinationName);
                destination.setSpots(spots);
                destinationRepository.save(destination);
            }
        } catch (Exception e) {
            System.err.println("Failed to extract/save spots: " + e.getMessage());
            // Don't stop the main flow even if spot saving fails
        }
    }

    public String cleanJsonResponse(String response) {
        // Remove markdown code blocks and extra whitespace
        return response
            .replaceAll("```json\\s*", "") // Remove ```json and any following whitespace
            .replaceAll("```\\s*", "")     // Remove closing ```
            .trim();                       // Remove leading/trailing whitespace
    }

    private int calculateDays(LocalDate startDate, LocalDate endDate) {
        return (int) java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1;
    }

    public PythonItinerary parsePythonResponse(String jsonResponse, String destination) throws Exception {
        // Parse JSON response from Flask
        Map<String, Object> responseMap = objectMapper.readValue(jsonResponse, Map.class);

        if (responseMap.containsKey("error")) {
            throw new RuntimeException("Python microservice error: " + responseMap.get("error"));
        }

        if (responseMap.containsKey("message") && responseMap.get("similar_activities") == null) {
            PythonItinerary itinerary = new PythonItinerary();
            itinerary.setActivities(List.of());
            return itinerary;
        }

        List<Map<String, Object>> similarActivities = (List<Map<String, Object>>) responseMap.get("similar_activities");
        List<AIActivity> activities = similarActivities.stream()
            .map(activityMap -> {
                Map<String, Object> activityDetails = (Map<String, Object>) activityMap.get("activity");
                AIActivity activity = new AIActivity();
                activity.setDay((Integer) activityDetails.get("day"));
                activity.setDate(LocalDate.parse((String) activityDetails.get("date")));
                activity.setName((String) activityDetails.get("name"));
                activity.setLocation((String) activityDetails.get("location"));
                activity.setTimeSlot((String) activityDetails.get("timeSlot"));
                activity.setEstimatedCost(((Number) activityDetails.get("estimatedCost")).doubleValue());
                // Assuming you need to populate additional fields from the JSON, you can set them here
                // For example, if "category", "distance", "latitude" etc. are part of the activity details:
                activity.setCategory((String) activityDetails.get("category"));
                activity.setDistance(((Number) activityDetails.get("distance")).doubleValue());
                activity.setDistanceUnit((String) activityDetails.get("distanceUnit"));
                activity.setDuration(((Number) activityDetails.get("duration")).doubleValue());
                activity.setDurationUnit((String) activityDetails.get("durationUnit"));
                activity.setIndex((Integer) activityDetails.get("index"));
                activity.setLatitude(((Number) activityDetails.get("latitude")).doubleValue());
                activity.setLongitude(((Number) activityDetails.get("longitude")).doubleValue());
                activity.setMatrixIndex((Integer) activityDetails.get("matrixIndex"));
                activity.setRating(((Number) activityDetails.get("rating")).doubleValue());
                return activity;
            })
            .toList();

        PythonItinerary itinerary = new PythonItinerary();
        itinerary.setActivities(activities);
        itinerary.setDestination(destination); // Set destination if needed
        return itinerary;
    }

    public PythonItinerary callPythonMicroservice(Trip trip) {
        String flaskUrl = "http://localhost:5000/generate_itinerary";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        ObjectNode json = objectMapper.createObjectNode();
        json.put("destination", trip.getDestination());
        json.put("budget", trip.getBudget());

        int peopleCount = (trip.getCollaborators() != null ? trip.getCollaborators().size() : 0) + 1;
        json.put("people", peopleCount);
        json.put("startDate", trip.getStartDate().toString());
        json.put("endDate", trip.getEndDate().toString());

        if (trip.getPreferences() != null && !trip.getPreferences().isEmpty()) {
            ArrayNode preferencesArray = objectMapper.valueToTree(trip.getPreferences());
            json.set("preferences", preferencesArray);
        }

        HttpEntity<String> entity = new HttpEntity<>(json.toString(), headers);

        try {
            ResponseEntity<PythonItinerary> response = restTemplate.exchange(
                flaskUrl,
                HttpMethod.POST,
                entity,
                PythonItinerary.class
            );

            return response.getBody();

        } catch (Exception e) {
            throw new RuntimeException("Error calling Python microservice: " + e.getMessage(), e);
        }
    }
}
