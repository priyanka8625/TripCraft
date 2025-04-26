package com.tripCraft.Controllers;

import com.tripCraft.model.Trip;
import com.tripCraft.model.Activity;
import com.tripCraft.model.Destination;
import com.tripCraft.model.Itinerary;
import com.tripCraft.model.ItineraryRequest;
import com.tripCraft.model.PythonItinerary;
import com.tripCraft.model.TripResponse;
import com.tripCraft.repository.DestinationRepository;
import com.tripCraft.repository.TripRepository;
import com.tripCraft.repository.UserRepo;
import com.tripCraft.repository.ItineraryRepository;
import com.tripCraft.repository.PythonRepository;
import com.tripCraft.Services.PythonService;
import com.tripCraft.Services.TripService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.tripCraft.Services.GeminiService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/trips/ai")
public class TripWithAi {

	@Autowired
    private  TripRepository tripRepository;
	@Autowired
    private  UserRepo userRepository;
   
	@Autowired
	private DestinationRepository destinationRepository;
    @Autowired
    private ItineraryRepository itineraryRepository;
    @Autowired
    private PythonRepository pythonRepository;
    
    @Autowired
    private TripService tripService;
    @Autowired
    private GeminiController geminiController;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private RestTemplate restTemplate;
    @Autowired
    private PythonService pythonService;

    @Autowired
    private GeminiService geminiService;

    private final List<String> imageUrls = List.of(
        "url1.jpg", "url2.jpg", "url3.jpg"
    );

    @PostMapping
    public ResponseEntity<?> createTripAndItinerary(@RequestBody Trip trip) {
        // Set user ID
        String userId = getCurrentUserId(); // implement this method
        trip.setUserId(userId);
        trip.setAiGenerated(true);
        trip.setStatus("Planned");
        trip.setCreatedAt(LocalDateTime.now());

        // Set thumbnail
        String randomThumbnail = imageUrls.get(new Random().nextInt(imageUrls.size()));
        trip.setThumbnail(randomThumbnail);

        // Handle collaborators (optional)
        if (trip.getCollaborators() == null || trip.getCollaborators().isEmpty()) {
            // leave it as is
        }

        // Check if destination exists
        boolean destinationExists = destinationRepository.existsByDestination(trip.getDestination());

        // Call appropriate microservice
        PythonItinerary  itinerary;
        if (destinationExists) {
            itinerary = pythonService.callPythonMicroservice(trip);
        } else {
            itinerary = callGeminiService(trip);
        }

        // Save Trip
        Trip savedTrip = tripRepository.save(trip);

        // Save Itinerary
        itinerary.setTripId(savedTrip.getId());
        PythonItinerary savedItinerary = pythonRepository.save(itinerary);

        // Build response
        TripResponse response = new TripResponse();
        response.setTrip(savedTrip);
        response.setItinerary(savedItinerary);

        return ResponseEntity.ok(response);
    }
    private  PythonItinerary callGeminiService(Trip trip) {
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
            return objectMapper.readValue(cleanedJson, PythonItinerary.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Gemini response: " + e.getMessage(), e);
        }
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

 private String cleanJsonResponse(String response) {
        // Remove markdown code blocks and extra whitespace
        return response
            .replaceAll("```json\\s*", "") // Remove ```json and any following whitespace
            .replaceAll("```\\s*", "")     // Remove closing ```
            .trim();                       // Remove leading/trailing whitespace
    }
    private int calculateDays(LocalDate startDate, LocalDate endDate) {
        return (int) java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1;
    }

    private Itinerary parsePythonResponse(String jsonResponse, String destination) throws Exception {
        // Parse JSON response from Flask
        Map<String, Object> responseMap = objectMapper.readValue(jsonResponse, Map.class);

        // Check if there’s an error or no similar activities
        if (responseMap.containsKey("error")) {
            throw new RuntimeException("Python microservice error: " + responseMap.get("error"));
        }

        if (responseMap.containsKey("message") && responseMap.get("similar_activities") == null) {
            // No matching activities found; return empty itinerary
            Itinerary itinerary = new Itinerary();
            itinerary.setActivities(List.of());
            return itinerary;
        }
        List<Map<String, Object>> similarActivities = (List<Map<String, Object>>) responseMap.get("similar_activities");
        List<Activity> activities = similarActivities.stream()
            .map(activityMap -> {
                Map<String, Object> activityDetails = (Map<String, Object>) activityMap.get("activity");
                Activity activity = new Activity();
                activity.setDay((Integer) activityDetails.get("day"));
                activity.setDate(LocalDate.parse((String) activityDetails.get("date")));
                activity.setName((String) activityDetails.get("name"));
                activity.setLocation((String) activityDetails.get("location"));
                 activity.setTimeSlot((String) activityDetails.get("timeSlot")); // Assuming Activity uses timeSlot
                activity.setEstimatedCost(((Number) activityDetails.get("estimatedCost")).doubleValue());
                return activity;
            })
            .toList();
        Itinerary itinerary = new Itinerary();
        itinerary.setActivities(activities);
        return itinerary;
    }
    public String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            System.out.println("No authenticated user found.");
            throw new IllegalStateException("No authenticated user found.");
        }

        Object principal = authentication.getPrincipal();
        System.out.println("Principal: " + principal);

        if (principal instanceof UserDetails) {
            String username = ((UserDetails) principal).getUsername();
            System.out.println("Authenticated user ID (from UserDetails): " + username);
            return username;
        }

        String userId = principal.toString();
        System.out.println("Authenticated user ID (from principal.toString): " + userId);
        return userId;
    }
    }
