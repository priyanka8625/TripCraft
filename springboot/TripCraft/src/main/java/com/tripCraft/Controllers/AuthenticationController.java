package com.tripCraft.Controllers;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tripCraft.Services.JWTService;
import com.tripCraft.Services.UserService;
import com.tripCraft.model.LoginRequest;
import com.tripCraft.model.User;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/auth")
public class AuthenticationController {
	   @Autowired
	    private UserService service;


	   @PostMapping("/register")
	   public ResponseEntity<String> register(@RequestBody User user) {
	       return service.register(user);
	   }


	   @PostMapping("/login")
	   public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest user) {
	       return service.verify(user);
	   }

	    @GetMapping("/dashboard")
	    public String dash() {
	    	return "Welcome";
	    }
	    @Autowired
	    private  JWTService jwtService;
	    @Autowired
	    private  UserDetailsService userDetailsService;


	    @GetMapping("/status")
	    public ResponseEntity<?> checkAuthStatus(HttpServletRequest request) {
	        Cookie[] cookies = request.getCookies();

	        if (cookies != null) {
	        
	            for (Cookie cookie : cookies) {
	                if ("jwt".equals(cookie.getName())) {
	                    String token = cookie.getValue();
	                    try {
	                        String username = jwtService.extractUserName(token);
	                        UserDetails user = userDetailsService.loadUserByUsername(username);
	                        if (jwtService.validateToken(token, user)) {
	                        	return ResponseEntity.ok().body(Map.of("authenticated", true));
	                        }
	                    } catch (Exception e) {
	                    	return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("authenticated", false));
	                    }
	                }
	            }
	        }else {
            	System.out.println("Np cookies");
            }

	        return ResponseEntity.status(401).body("not authenticated");
	    }
	         @PostMapping("/logout")
	        public ResponseEntity<?> logout(HttpServletResponse response) {
	            // Create an expired cookie with the same name, path, and domain
	            Cookie cookie = new Cookie("authToken", null);
	            cookie.setHttpOnly(true);
	            cookie.setSecure(true); // only if you're using HTTPS
	            cookie.setPath("/");
	            cookie.setMaxAge(0); // instantly expire the cookie
	            response.addCookie(cookie);

	            return ResponseEntity.ok("Logged out successfully.");
	        }
	    

}
