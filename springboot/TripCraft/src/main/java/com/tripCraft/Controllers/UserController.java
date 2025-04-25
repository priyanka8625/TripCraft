package com.tripCraft.Controllers;


import com.tripCraft.Services.UserService;
import com.tripCraft.model.User;
import com.tripCraft.repository.UserRepo;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/profile")
public class UserController {

    private final UserService userService;
    private final UserRepo userRepo;
    private final TripController tripController;

    public UserController(UserService userService, UserRepo userRepo, TripController tripController) {
        this.userService = userService;
        this.userRepo = userRepo;
        this.tripController = tripController;
    }

    // ✅ 1. Get User Profile by ID
    @GetMapping
    public ResponseEntity<?> getUserProfile() {
    	String userEmail = tripController.getCurrentUserId(); // Returns email, e.g., "test@example.com"
        Optional<User> userOptional = userRepo.findByEmail(userEmail);
        if (!userOptional.isPresent()) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "User does not exist");
            return ResponseEntity.badRequest().body(response);
        }

        User user_optional = userOptional.get();
        String userId = user_optional.getId(); // Get the MongoDB _id (e.g., "user123")
        Optional<User> user = userRepo.findById(userId);
        return user.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ✅ 2. Update User Profile
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUserProfile(@PathVariable String id, @RequestBody User updatedUser) {
        return userRepo.findById(id).map(existingUser -> {
            existingUser.setName(updatedUser.getName());
            existingUser.setPhone(updatedUser.getPhone());
            existingUser.setEmail(updatedUser.getEmail());
            userRepo.save(existingUser);
            return ResponseEntity.ok(existingUser);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ✅ 3. Delete User Profile
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUserProfile(@PathVariable String id) {
        if (userRepo.existsById(id)) {
            userRepo.deleteById(id);
            return ResponseEntity.ok("User deleted successfully");
        }
        return ResponseEntity.notFound().build();
    }
}
