package com.tripCraft.Controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.tripCraft.Services.EmailSenderService;
import com.tripCraft.model.Activity;
import com.tripCraft.model.Collaborator;
import com.tripCraft.model.Itinerary;
import com.tripCraft.model.ItineraryRequest;
import com.tripCraft.model.Trip;
import com.tripCraft.model.User;
import com.tripCraft.repository.DestinationRepository;
import com.tripCraft.repository.ItineraryRepository;
import com.tripCraft.repository.TripRepository;
import com.tripCraft.repository.UserRepo;
import com.tripCraft.util.CurrentUserUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/trips")
public class TripController {
	@Autowired
    private  TripRepository tripRepository;
	@Autowired
    private  UserRepo userRepository;
  
	@Autowired
	private DestinationRepository destinationRepository;
    @Autowired
    private ItineraryRepository itineraryRepository;
    @Autowired
    private GeminiController geminiController;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private EmailSenderService emailSenderService;
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

    @PostMapping("/create")
    public ResponseEntity<?> createTrip(@RequestBody Trip trip) {

    String userId = getCurrentUserId();

    // Step 1: Populate non-input fields
    trip.setUserId(userId);
    trip.setAiGenerated(false);
    if (trip.getCollaborators() == null) {
        trip.setCollaborators(new ArrayList<>());
    }
    else {
    	for (Collaborator collaborator : trip.getCollaborators()) {
    	    String subject = "New Trip Added!";
    	    String body ="Hi there!\r\n"
    	    		+ "You've been added as a collaborator to an exciting new trip planned on TripCraft. The trip is headed to "+trip.getDestination()+" from "+trip.getStartDate()+" to "+trip.getEndDate() +" As a "+collaborator.getRole()+", you'll be able to view and contribute to the trip details. Log in to your TripCraft account to explore the plan and join the adventure!\r\n"
    	    		+ "\r\n"
    	    		+ "";
    	    emailSenderService.sendEmail(collaborator.getEmail(), subject, body);
    	}

    }
    trip.setCreatedAt(LocalDateTime.now());

    
    System.out.println("Before Save: " + trip);
    Trip savedTrip = tripRepository.save(trip);
    System.out.println("After Save: " + savedTrip);

    // Step 3: Find all trips with the same destination
    List<String> tripIdsWithSameDestination = tripRepository.findByDestination(trip.getDestination())
            .stream()
            .map(Trip::getId)
            .collect(Collectors.toList());

    // Step 4: Fetch itineraries and safely collect activities
    List<Activity> activities = itineraryRepository.findByTripIdIn(tripIdsWithSameDestination)
            .stream()
            .filter(itinerary -> itinerary.getActivities() != null)
            .flatMap(itinerary -> itinerary.getActivities().stream())
            .collect(Collectors.toList());

    // Step 5: Extract unique locations and estimated costs
    List<Map<String, Object>> locationSuggestions = activities.stream()
        .collect(Collectors.toMap(
            Activity::getLocation,
            activity -> {
                Map<String, Object> map = new HashMap<>();
                map.put("location", activity.getLocation());
                map.put("estimatedCost", activity.getEstimatedCost());
                return map;
            },
            (existing, replacement) -> existing // if duplicate location, keep the first
        ))
        .values()
        .stream()
        .collect(Collectors.toList());

    // Step 6: Return response
    Map<String, Object> response = new HashMap<>();
    response.put("tripId", savedTrip.getId());
    response.put("recommendations", locationSuggestions);

    return ResponseEntity.ok(response);
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
        boolean destinationExists = destinationRepository.existsByDestination(trip.getDestination());

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
    private Itinerary callPythonMicroservice(Trip trip) {
        String flaskUrl = "http://localhost:5000/generate_itinerary";

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        ObjectMapper objectMapper = new ObjectMapper();
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
            ResponseEntity<Itinerary> response = restTemplate.exchange(
                flaskUrl,
                HttpMethod.POST,
                entity,
                Itinerary.class
            );

            return response.getBody();

        } catch (Exception e) {
            throw new RuntimeException("Error calling Python microservice: " + e.getMessage(), e);
        }
    }
  
}
