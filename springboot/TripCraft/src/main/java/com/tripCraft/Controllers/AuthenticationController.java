package com.tripCraft.Controllers;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tripCraft.Services.UserService;
import com.tripCraft.model.LoginRequest;
import com.tripCraft.model.User;

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
	   
}
