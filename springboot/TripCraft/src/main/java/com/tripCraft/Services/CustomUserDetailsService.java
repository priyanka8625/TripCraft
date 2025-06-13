//package com.tripCraft.Services;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.security.core.userdetails.UserDetailsService;
//import org.springframework.security.core.userdetails.UsernameNotFoundException;
//import org.springframework.security.core.userdetails.UsernameNotFoundException;
//import org.springframework.stereotype.Service;
//
//import com.tripCraft.model.CustomUserDetails;
//import com.tripCraft.model.User;
//import com.tripCraft.repository.UserRepo;
//
//@Service
//public class CustomUserDetailsService implements UserDetailsService {
//
//    @Autowired
//    private UserRepo userRepository;
//
//    @Override
//    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
//        User user = userRepository.findByEmail(email)
//            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
//        return new CustomUserDetails(user); // 👈 return wrapped User
//    }
//}
