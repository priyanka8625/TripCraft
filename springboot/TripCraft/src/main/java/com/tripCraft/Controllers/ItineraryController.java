package com.tripCraft.Controllers;

import com.tripCraft.model.Itinerary;
import com.tripCraft.model.Trip;
import com.tripCraft.repository.ItineraryRepository;
import com.tripCraft.repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/itinerary")
public class ItineraryController {

    @Autowired
    private ItineraryRepository itineraryRepository;

    @Autowired
    private TripRepository tripRepository;

    // ✅ 1. Get All Itineraries
    @GetMapping
    public ResponseEntity<List<Itinerary>> getAllItineraries() {
        return ResponseEntity.ok(itineraryRepository.findAll());
    }

    // ✅ 2. Get Itinerary by ID
    @GetMapping("/{id}")
    public ResponseEntity<Itinerary> getItineraryById(@PathVariable String id) {
        Optional<Itinerary> itinerary = itineraryRepository.findById(id);
        return itinerary.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ✅ 3. Get Itinerary by Trip ID
    @GetMapping("/trip/{tripId}")
    public ResponseEntity<Itinerary> getItineraryByTripId(@PathVariable String tripId) {
        return ResponseEntity.ok(itineraryRepository.findByTripId(tripId));
    }

    // ✅ 4. Create a New Itinerary
    @PostMapping
    public ResponseEntity<?> createItinerary(@RequestBody Itinerary itinerary) {
        // Check if the Trip exists
        Optional<Trip> trip = tripRepository.findById(itinerary.getTripId());
        if (trip.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message","Trip ID not found!"));
        }

        Itinerary savedItinerary = itineraryRepository.save(itinerary);
        return ResponseEntity.ok(savedItinerary);
    }

    // ✅ 5. Update an Itinerary
    @PutMapping("/{id}")
    public ResponseEntity<?> updateItinerary(@PathVariable String id, @RequestBody Itinerary updatedItinerary) {
        Optional<Itinerary> existingItinerary = itineraryRepository.findById(id);
        if (existingItinerary.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        updatedItinerary.setId(id); // Ensure correct ID
        Itinerary savedItinerary = itineraryRepository.save(updatedItinerary);
        return ResponseEntity.ok(savedItinerary);
    }

    // ✅ 6. Delete an Itinerary
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItinerary(@PathVariable String id) {
        if (!itineraryRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        itineraryRepository.deleteById(id);
        return ResponseEntity.ok("Itinerary deleted successfully");
    }
}
