package com.tripCraft.Controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.tripCraft.Services.EmailSenderService;
import com.tripCraft.Services.TripService;
import com.tripCraft.model.Activity;
import com.tripCraft.model.Collaborator;
import com.tripCraft.model.DailyPlanResponse;
import com.tripCraft.model.Destination;
import com.tripCraft.model.Destination.Spot;
import com.tripCraft.model.Itinerary;
import com.tripCraft.model.ItineraryRequest;
import com.tripCraft.model.Lunch;
import com.tripCraft.model.PlanResponse;
import com.tripCraft.model.Stay;
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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
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
    private TripService tripService;
    @Autowired
    private GeminiController geminiController;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private EmailSenderService emailSenderService;
    @Value("${python.microservice.url:http://localhost:5000/generate_itinerary}")
    private String pythonMicroserviceUrl;
    
    List<String> imageUrls = Arrays.asList(
    		"http://res.cloudinary.com/didg0xpge/image/upload/v1745563965/rh62v2pkxe1iidaq51pp.jpg",
    		 "http://res.cloudinary.com/didg0xpge/image/upload/v1745564280/thq60ytekuxokvhx1tfh.jpg",
    	        "http://res.cloudinary.com/didg0xpge/image/upload/v1745564379/y3yzv80lqmzq0fgstn9f.jpg",
    	        "http://res.cloudinary.com/didg0xpge/image/upload/v1745564411/nr9wvshaewcssiyldq1r.jpg",
    	        "http://res.cloudinary.com/didg0xpge/image/upload/v1745564438/yotejrr4sp6zb6qa4byx.jpg",
    	        "http://res.cloudinary.com/didg0xpge/image/upload/v1745564462/jh6vo0cyrbxuhb1hbboz.jpg",
    	        "http://res.cloudinary.com/didg0xpge/image/upload/v1745564470/lco3idkoelc4rrhgld7t.jpg",
    	        "http://res.cloudinary.com/didg0xpge/image/upload/v1745564485/gw9svacvp16jdnctkv8p.jpg",
    	        "http://res.cloudinary.com/didg0xpge/image/upload/v1745564495/ruqiponckujq6o7l8czk.jpg"
    	 );

    // ✅ Get all trips
    @GetMapping
    public ResponseEntity<?> getUserTrips() {
        String userId = getCurrentUserId(); // from token/session
        System.out.println("UserId"+userId);
        List<Trip> trips = tripService.getTripsForLoggedInUser(userId);
        return ResponseEntity.ok(trips);
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

    	String userId = getCurrentUserId(); // Returns email, e.g., "test@example.com"
//        Optional<User> userOptional = userRepository.findByEmail(userEmail);
//        if (!userOptional.isPresent()) {
//            Map<String, String> response = new HashMap<>();
//            response.put("error", "User does not exist");
//            return ResponseEntity.badRequest().body(response);
//        }
//
//        User user = userOptional.get();
//        String userId = user.getId(); // Get the MongoDB _id (e.g., "user123")

        // Step 1: Populate non-input fields
        trip.setUserId(userId);
        trip.setAiGenerated(false);
        if (trip.getCollaborators() == null) {
            trip.setCollaborators(new ArrayList<>());
        } else {
            for (Collaborator collaborator : trip.getCollaborators()) {
            	
            	Optional<User> userCollab = userRepository.findByEmail(collaborator.getEmail());
            	userCollab.ifPresent(value -> collaborator.setUserId(value.getId()));

                String subject = "New Trip Added!";
                String body = "Hi there!\r\n"
                        + "You've been added as a collaborator to an exciting new trip planned on TripCraft. "
                        + "The trip is headed to " + trip.getDestination() + " from " + trip.getStartDate() + " to " + trip.getEndDate() + ". "
                        + "As a "  + ", you'll be able to view and contribute to the trip details. "
                        + "Log in to your TripCraft account to explore the plan and join the adventure!\r\n";
                emailSenderService.sendEmail(collaborator.getEmail(), subject, body);
            }
        }

        trip.setCreatedAt(LocalDateTime.now());
        String randomThumbnail = imageUrls.get(new Random().nextInt(imageUrls.size()));
        trip.setThumbnail(randomThumbnail);

        System.out.println("Before Save: " + trip);
        Trip savedTrip = tripRepository.save(trip);
        System.out.println("After Save: " + savedTrip);

        // ✅ Fetch the destination and get the list of spots
        Optional<Destination> destinationOpt = destinationRepository.findByDestinationIgnoreCase(trip.getDestination());

        List<Destination.Spot> spots = new ArrayList<>();
        if (destinationOpt.isPresent()) {
            spots = destinationOpt.get().getSpots(); // Get all spots from the destination
        }

        // ✅ Build the response
        Map<String, Object> response = new HashMap<>();
        response.put("tripId", savedTrip.getId());
        response.put("spots", spots);  // Directly include the full list with all attributes

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
        String randomThumbnail = imageUrls.get(new Random().nextInt(imageUrls.size()));
        trip.setThumbnail(randomThumbnail);

        if (trip.getCollaborators() == null) {
            trip.setCollaborators(new ArrayList<>());
        } else {
            for (Collaborator collaborator : trip.getCollaborators()) {
            	
            	Optional<User> userCollab = userRepository.findByEmail(collaborator.getEmail());
            	userCollab.ifPresent(value -> collaborator.setUserId(value.getId()));

                String subject = "New Trip Added!";
                String body = "Hi there!\r\n"
                        + "You've been added as a collaborator to an exciting new trip planned on TripCraft. "
                        + "The trip is headed to " + trip.getDestination() + " from " + trip.getStartDate() + " to " + trip.getEndDate() + ". "
                        + "As a "  + ", you'll be able to view and contribute to the trip details. "
                        + "Log in to your TripCraft account to explore the plan and join the adventure!\r\n";
                emailSenderService.sendEmail(collaborator.getEmail(), subject, body);
            }
        }

        // Step 3: Check if destination exists in the database
        boolean destinationExists = destinationRepository.existsByDestination(trip.getDestination());

        // Step 4: Call appropriate service based on destination existence
        Itinerary itinerary;
        Destination destination;
        if (!destinationExists) {
        	destination = callGeminiService(trip.getDestination());
        	System.out.println("Gemini response "+destination);
        }
        itinerary = callPythonMicroservice(trip);
        System.out.println("model response "+itinerary);
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
    
    public Destination callGeminiService(String destination) {
        ResponseEntity<?> response = geminiController.generateSpotsAndHotels(destination);
        if (response.getStatusCode() != HttpStatus.OK) {
            throw new RuntimeException("Failed to fetch spots/hotels from Gemini: " + response.getBody());
        }

        String jsonResponse = (String) response.getBody();
        try {
            String cleanedJson = cleanJsonResponse(jsonResponse);
            return saveDataToMongo(cleanedJson, destination);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse and save Gemini response: " + e.getMessage(), e);
        }
    }
    private String cleanJsonResponse(String response) {
        return response
            .replaceAll("```json\\s*", "")
            .replaceAll("```\\s*", "")
            .trim();
    }
    private Destination saveDataToMongo(String cleanedJson, String destinationName) {
        try {
            JsonNode rootNode = objectMapper.readTree(cleanedJson);

            List<Destination.Spot> spots = new ArrayList<>();
            JsonNode spotsNode = rootNode.get("spots");
            if (spotsNode != null && spotsNode.isArray()) {
                for (JsonNode spotNode : spotsNode) {
                    Destination.Spot spot = objectMapper.treeToValue(spotNode, Destination.Spot.class);
                    spots.add(spot);
                }
            }

            List<Destination.Hotel> hotels = new ArrayList<>();
            JsonNode hotelsNode = rootNode.get("hotels");
            if (hotelsNode != null && hotelsNode.isArray()) {
                for (JsonNode hotelNode : hotelsNode) {
                    Destination.Hotel hotel = objectMapper.treeToValue(hotelNode, Destination.Hotel.class);
                    hotels.add(hotel);
                }
            }

            Destination destination = new Destination();
            destination.setDestination(destinationName);
            destination.setSpots(spots);
            destination.setHotels(hotels);
            return destinationRepository.save(destination);
        } catch (Exception e) {
            System.err.println("Failed to extract/save spots and hotels: " + e.getMessage());
            return null;
        }
    }

    private Itinerary callPythonMicroservice(Trip trip) {
        String flaskUrl = "http://localhost:5000/generate_itinerary";

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        ObjectMapper objectMapper = new ObjectMapper();
        ObjectNode root = objectMapper.createObjectNode();       // Root JSON
        ObjectNode tripNode = objectMapper.createObjectNode();   // Nested "trip" object

        // Populate trip fields
        tripNode.put("title", trip.getTitle());
        tripNode.put("destination", trip.getDestination());
        tripNode.put("startDate", trip.getStartDate().toString());
        tripNode.put("endDate", trip.getEndDate().toString());
        tripNode.put("budget", String.valueOf(trip.getBudget()));
        tripNode.put("people", String.valueOf(trip.getPeople()));  // <-- Use direct people count

        // Handle preferences
        if (trip.getPreferences() != null) {
            ArrayNode preferencesArray = objectMapper.valueToTree(trip.getPreferences());
            tripNode.set("preferences", preferencesArray);
        } else {
            tripNode.set("preferences", objectMapper.createArrayNode());
        }

        // Handle collaborators
        if (trip.getCollaborators() != null) {
            ArrayNode collaboratorsArray = objectMapper.valueToTree(trip.getCollaborators());
            tripNode.set("collaborators", collaboratorsArray);
        } else {
            tripNode.set("collaborators", objectMapper.createArrayNode());
        }

        // Add "trip" object to the root
        root.set("trip", tripNode);

        HttpEntity<String> entity = new HttpEntity<>(root.toString(), headers);

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
