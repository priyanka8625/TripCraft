package com.tripCraft.Controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripCraft.model.Activity;
import com.tripCraft.model.Itinerary;
import com.tripCraft.model.ItineraryRequest;
import com.tripCraft.model.Trip;
import com.tripCraft.model.User;
import com.tripCraft.repository.ItineraryRepository;
import com.tripCraft.repository.TripRepository;
import com.tripCraft.repository.UserRepo;
import com.tripCraft.util.CurrentUserUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/trips")
public class TripController {
	@Autowired
    private  TripRepository tripRepository;
	@Autowired
    private  UserRepo userRepository;
  
    @Autowired
    private ItineraryRepository itineraryRepository;
    @Autowired
    private GeminiController geminiController;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private RestTemplate restTemplate;

    @Value("${python.microservice.url:http://localhost:5000/similarity}")
    private String pythonMicroserviceUrl;
    // ✅ Get all trips
    @GetMapping
    public List<Trip> getAllTrips() {
        return tripRepository.findAll();
    }

    // ✅ Get a single trip by ID
    @GetMapping("/{id}")
    public ResponseEntity<Trip> getTripById(@PathVariable String id) {
        Optional<Trip> trip = tripRepository.findById(id);
        return trip.map(ResponseEntity::ok)
                   .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ✅ Create a new trip
//    @PostMapping
//    public ResponseEntity<Trip> createTrip(@RequestBody Trip trip) {
//        Trip savedTrip = tripRepository.save(trip);
//        return ResponseEntity.ok(savedTrip);
//    }
    @GetMapping("/recent")
    public ResponseEntity<List<Trip>> getRecentTrips() {
    	String userId = getCurrentUserId();
        List<Trip> recentTrips = tripRepository.findByUserIdAndEndDateBefore(userId, LocalDate.now());
        return ResponseEntity.ok(recentTrips);
    }
 // ✅ Get upcoming trips of a user
    @GetMapping("/upcoming")
    public ResponseEntity<List<Trip>> getUpcomingTrips() {
    	String userId = getCurrentUserId();
        List<Trip> upcomingTrips = tripRepository.findByUserIdAndStartDateAfter(userId, java.time.LocalDate.now());
        return ResponseEntity.ok(upcomingTrips);
    }

    
    // ✅ Update an existing trip
    @PutMapping("/{id}")
    public ResponseEntity<Trip> updateTrip(@PathVariable String id, @RequestBody Trip updatedTrip) {
        if (!tripRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        updatedTrip.setId(id);  // Ensure the correct ID is set
        Trip savedTrip = tripRepository.save(updatedTrip);
        return ResponseEntity.ok(savedTrip);
    }

    // ✅ Delete a trip
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrip(@PathVariable String id) {
        if (!tripRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        tripRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    private String getCurrentUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername(); // Email or userId
        }
        return principal.toString();
    }
    
    public static class TripResponse {
        private Trip trip;
        private Itinerary itinerary;

        public Trip getTrip() { return trip; }
        public void setTrip(Trip trip) { this.trip = trip; }
        public Itinerary getItinerary() { return itinerary; }
        public void setItinerary(Itinerary itinerary) { this.itinerary = itinerary; }
    }
    @PostMapping
    public ResponseEntity<?> createTripAndItinerary(@RequestBody Trip trip) {
        // Step 1: Set required fields
    	String userId = getCurrentUserId();
    	trip.setUserId(userId);
        trip.setAiGenerated(true); // Set isAiGenerated to true as per requirement
        trip.setStatus("Planned");
        trip.setCreatedAt(LocalDateTime.now()); // Set current time

        // Step 2: Handle collaborators
        if (trip.getCollaborators() == null || trip.getCollaborators().isEmpty()) {
            // Keep as is (null or empty)
        } else {
            // Collaborators are already set in the request, no action needed
        }

        // Step 3: Check if destination exists in the database
        boolean destinationExists = tripRepository.existsByDestination(trip.getDestination());

        // Step 4: Call appropriate service based on destination existence
        Itinerary itinerary;
        if (destinationExists) {
            itinerary = callPythonMicroservice(trip);
        } else {
            itinerary = callGeminiService(trip);
        }

        // Step 5: Save Trip first to get its ID
        Trip savedTrip = tripRepository.save(trip);

        // Step 6: Set tripId in Itinerary and save
        itinerary.setTripId(savedTrip.getId());
        Itinerary savedItinerary = itineraryRepository.save(itinerary);

        // Step 7: Prepare response
        TripResponse response = new TripResponse();
        response.setTrip(savedTrip);
        response.setItinerary(savedItinerary);

        return ResponseEntity.ok(response);
    }
    private Itinerary callGeminiService(Trip trip) {
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
            return objectMapper.readValue(cleanedJson, Itinerary.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Gemini response: " + e.getMessage(), e);
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

    private Itinerary callPythonMicroservice(Trip trip) {
        // Prepare request body for Flask /similarity endpoint
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("destination", trip.getDestination());
        
        // Use the first preference if available, otherwise default to "Adventure"
        String preferenceType = (trip.getPreference() != null && !trip.getPreference().isEmpty()) 
            ? trip.getPreference().get(0) 
            : "Adventure";
        requestBody.put("preference_type", preferenceType);

        // Set headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Create HTTP entity
        HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestBody, headers);

        try {
            // Call Flask endpoint
            ResponseEntity<String> response = restTemplate.postForEntity(pythonMicroserviceUrl, entity, String.class);

            if (response.getStatusCode() != HttpStatus.OK) {
                throw new RuntimeException("Python microservice failed: " + response.getStatusCode());
            }

            // Parse response
            String jsonResponse = response.getBody();
            return parsePythonResponse(jsonResponse, trip.getDestination());
        } catch (Exception e) {
            throw new RuntimeException("Error calling Python microservice: " + e.getMessage(), e);
        }
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
                activity.setImage((String) activityDetails.get("image"));
                activity.setTimeSlot((String) activityDetails.get("timeSlot")); // Assuming Activity uses timeSlot
                activity.setEstimatedCost(((Number) activityDetails.get("estimatedCost")).doubleValue());
                return activity;
            })
            .toList();
        Itinerary itinerary = new Itinerary();
        itinerary.setActivities(activities);
        return itinerary;
    }
    }
