package com.tripCraft.Controllers;

import com.tripCraft.model.Trip;
import com.tripCraft.model.Activity;
import com.tripCraft.model.Destination;
import com.tripCraft.model.Itinerary;
import com.tripCraft.model.ItineraryRequest;
import com.tripCraft.model.TripResponse;
import com.tripCraft.repository.DestinationRepository;
import com.tripCraft.repository.TripRepository;
import com.tripCraft.repository.UserRepo;
import com.tripCraft.repository.ItineraryRepository;
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
        Itinerary itinerary;
        if (destinationExists) {
            itinerary = pythonService.callPythonMicroservice(trip);
        } else {
            itinerary = geminiService.callGeminiService(trip);
        }

        // Save Trip
        Trip savedTrip = tripRepository.save(trip);

        // Save Itinerary
        itinerary.setTripId(savedTrip.getId());
        Itinerary savedItinerary = itineraryRepository.save(itinerary);

        // Build response
        TripResponse response = new TripResponse();
        response.setTrip(savedTrip);
        response.setItinerary(savedItinerary);

        return ResponseEntity.ok(response);
    }

    }
