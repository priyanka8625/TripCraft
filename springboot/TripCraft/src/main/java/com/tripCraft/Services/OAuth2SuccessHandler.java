package com.tripCraft.Services;

import com.tripCraft.model.User;
import com.tripCraft.repository.UserRepo;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JWTService jwtService;
    private final UserRepo userRepository;

    public OAuth2SuccessHandler(JWTService jwtService, UserRepo userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        DefaultOAuth2User oauthUser = (DefaultOAuth2User) authentication.getPrincipal();

        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");

        // Check if user exists
        Optional<User> existingUser = userRepository.findByEmail(email);
        User user;
        if (existingUser.isEmpty()) {
            user = new User();
            user.setEmail(email);
            user.setName(name);
            user.setProvider("GOOGLE");
            userRepository.save(user);
        } else {
            user = existingUser.get();
        }

        // ✅ Generate JWT Token for OAuth login
        String jwtToken = jwtService.generateToken(email);

        // ✅ Return token in response
        response.setHeader("Authorization", "Bearer " + jwtToken);
        response.setContentType("application/json");
        response.getWriter().write("{ \"token\": \"" + jwtToken + "\" }");
    }
}
