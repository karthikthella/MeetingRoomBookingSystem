package com.epam.meetingroom.service;

import com.epam.meetingroom.entity.enums.Role;
import com.epam.meetingroom.entity.User;
import com.epam.meetingroom.dto.AuthResponse;
import com.epam.meetingroom.dto.LoginRequest;
import com.epam.meetingroom.dto.UserRegistrationRequest;
import com.epam.meetingroom.repository.UserRepository;
import com.epam.meetingroom.security.jwt.JwtUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthService(AuthenticationManager authenticationManager,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    public AuthResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.username(), loginRequest.password()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        User user = userRepository.findByUsername(loginRequest.username()).orElseThrow();
        
        return new AuthResponse(jwt, user.getUsername(), user.getRole());
    }

    public void registerUser(UserRegistrationRequest registrationRequest) {
        if (userRepository.existsByUsername(registrationRequest.username())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(registrationRequest.email())) {
            throw new RuntimeException("Email already exists");
        }

        Role role = registrationRequest.role() != null ? registrationRequest.role() : Role.USER;

        User user = User.builder()
                .username(registrationRequest.username())
                .password(passwordEncoder.encode(registrationRequest.password()))
                .email(registrationRequest.email())
                .role(role)
                .build();

        userRepository.save(user);
    }
}
