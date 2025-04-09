package com.tripCraft.Controllers;

import com.tripCraft.model.Trip;
import com.tripCraft.model.User;
import com.tripCraft.repository.TripRepository;
import com.tripCraft.repository.UserRepo;
import com.tripCraft.util.CurrentUserUtil;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    private final TripRepository tripRepository;
    private final UserRepo userRepository;
    private final CurrentUserUtil currentUserUtil;

    public TripController(TripRepository tripRepository, UserRepo userRepository, CurrentUserUtil currentUserUtil) {
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
        this.currentUserUtil = currentUserUtil;
    }

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
    @PostMapping
    public ResponseEntity<Trip> createTrip(@RequestBody Trip trip) {
        Trip savedTrip = tripRepository.save(trip);
        return ResponseEntity.ok(savedTrip);
    }
    @GetMapping("/recent")
    public ResponseEntity<List<Trip>> getRecentTrips() {
    	String userId = getCurrentUserId();
        List<Trip> recentTrips = tripRepository.findByUserIdAndEndDateBefore(userId, LocalDate.now());
        return ResponseEntity.ok(recentTrips);
    }
 // ✅ Get upcoming trips of a user
    @GetMapping("/upcoming")
    public ResponseEntity<List<Trip>> getUpcomingTrips() {
    	String userEmail = currentUserUtil.getCurrentUserEmail();
        User user = userRepository.findByEmail(userEmail).orElseThrow(() -> new RuntimeException("User not found"));
        List<Trip> upcomingTrips = tripRepository.findByUserIdAndStartDateAfter(user.getId(), java.time.LocalDate.now());
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
}
