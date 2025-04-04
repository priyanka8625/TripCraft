package com.tripCraft.Services;


import com.tripCraft.model.User;
import com.tripCraft.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class CustomOAuth2UserService {

    @Autowired
    private UserRepo userRepository;

    public OidcUser processOAuthPostLogin(String email, OidcUser oidcUser) {
        Optional<User> existingUser = userRepository.findByEmail(email);

        if (existingUser.isEmpty()) {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(oidcUser.getFullName());
            newUser.setProvider("GOOGLE");
            newUser.setCreatedAt(LocalDateTime.now());

            userRepository.save(newUser);
        }

        return oidcUser;
    }
}
