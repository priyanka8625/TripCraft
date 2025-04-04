package com.tripCraft.Controllers;


import com.tripCraft.Services.UserService;
import com.tripCraft.model.User;
import com.tripCraft.repository.UserRepo;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/profile")
public class UserController {

    private final UserService userService;
    private final UserRepo userRepo;

    public UserController(UserService userService, UserRepo userRepo) {
        this.userService = userService;
        this.userRepo = userRepo;
    }

    // ✅ 1. Get User Profile by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserProfile(@PathVariable String id) {
        Optional<User> user = userRepo.findById(id);
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
