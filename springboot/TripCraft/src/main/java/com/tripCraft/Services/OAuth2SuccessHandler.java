package com.tripCraft.Services;

import com.tripCraft.model.User;
import com.tripCraft.repository.UserRepo;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;

public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JWTService jwtService;
    private final UserRepo userRepository;

    public OAuth2SuccessHandler(JWTService jwtService, UserRepo userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        String email = null;
        String name = null;

        Object principal = authentication.getPrincipal();

        if (principal instanceof OidcUser oidcUser) {
            email = oidcUser.getEmail();
            name = oidcUser.getFullName();
        } else if (principal instanceof OAuth2User oauth2User) {
            email = (String) oauth2User.getAttributes().get("email");
            name = (String) oauth2User.getAttributes().get("name"); // or "login" depending on provider
        }

        if (email == null) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Email not found in OAuth2 provider");
            return;
        }

        Optional<User> optionalUser = userRepository.findByEmail(email);

        if (optionalUser.isEmpty()) {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(name);
            newUser.setProvider("OAUTH2");
            newUser.setCreatedAt(java.time.LocalDateTime.now());
            userRepository.save(newUser);
        }

        User user = userRepository.findByEmail(email).get();
        String token = jwtService.generateToken(user.getEmail());

        Cookie cookie = new Cookie("jwt", token);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
        response.addCookie(cookie);

        response.sendRedirect("http://localhost:5173/dashboard");
    }
}