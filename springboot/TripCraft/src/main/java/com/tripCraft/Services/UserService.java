package com.tripCraft.Services;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.tripCraft.model.LoginRequest;
import com.tripCraft.model.User;
import com.tripCraft.repository.UserRepo;

@Service
public class UserService {

    @Autowired
    private JWTService jwtService;

    @Autowired
    AuthenticationManager authManager;

    @Autowired
    private UserRepo repo;


    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    public ResponseEntity<String> register(User user) {
    if (repo.findByEmail(user.getEmail()).isPresent()) {
        return ResponseEntity
                .badRequest()
                .body("{\"message\": \"Email already exists\"}");
    }

    user.setPassword(encoder.encode(user.getPassword()));
    user.setProvider("LOCAL");
    repo.save(user);

    return ResponseEntity
            .ok("{\"message\": \"User registered successfully\"}");
}




public ResponseEntity<Map<String, String>> verify(LoginRequest user) {
    try {
        Authentication authentication = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword()));

        if (authentication.isAuthenticated()) {
            // Generate the JWT token
            String token = jwtService.generateToken(user.getEmail());

            // Create secure cookie
            ResponseCookie cookie = ResponseCookie.from("jwt", token)
                    .httpOnly(true)
                    .secure(false) // remove this in localhost if not using https
                    .path("/")
                    .maxAge(Duration.ofDays(7))
                    .sameSite("Strict")
                    .build();

            // 🔍 Fetch user's name
            Optional<User> optionalUser = repo.findByEmail(user.getEmail());
            String name = optionalUser.map(User::getName).orElse("User");

            // ✅ JSON response with name
            Map<String, String> responseBody = new HashMap<>();
            responseBody.put("message", "Login successful");
            responseBody.put("name", name);

            System.out.println("token: " + token);

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(responseBody);
        } else {
            Map<String, String> responseBody = new HashMap<>();
            responseBody.put("message", "Authentication failed");

            System.out.println("error: auth failed");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(responseBody);
        }
    } catch (Exception e) {
        Map<String, String> responseBody = new HashMap<>();
        responseBody.put("message", "Internal server error: " + e.getMessage());
        responseBody.put("status", "error");

        System.out.println("error: " + e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseBody);
    }
}

}
