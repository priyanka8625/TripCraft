package com.tripCraft.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.tripCraft.model.LoginRequest;
import com.tripCraft.model.Users;
import com.tripCraft.repo.UserRepo;

@Service
public class UserService {

    @Autowired
    private JWTService jwtService;

    @Autowired
    AuthenticationManager authManager;

    @Autowired
    private UserRepo repo;


    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    public Users register(Users user) {
        user.setPassword(encoder.encode(user.getPassword()));
        repo.save(user);
        return user;
    }

    public ResponseEntity<String> verify(LoginRequest user) {
        try {
            Authentication authentication = authManager.authenticate(new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword()));
            
            if (authentication.isAuthenticated()) {
                // Generate the JWT token
                String token = jwtService.generateToken(user.getUsername());

                // Return the token with HTTP status 200 OK
                return ResponseEntity.status(HttpStatus.OK)
                        .header("Authorization", "Bearer " + token)  // Optionally, you can return the token in the Authorization header
                        .body(token);  // Return the token as the body of the response
            } else {
                // Authentication failed, return unauthorized status with error message
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authentication failed");
            }
        } catch (Exception e) {
            // Handle any exceptions that might occur during authentication
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Internal server error: " + e.getMessage());
        }
    }
}
